const request = require("supertest");

const app = require("../app");
const pool = require("../db");


// =========================================
// TEST USERS
// =========================================

const userA = {
  full_name: "Story Test User A",
  username: "story_test_user_a",
  email: "story_user_a@example.com",
  password: "Password123",
};

const userB = {
  full_name: "Story Test User B",
  username: "story_test_user_b",
  email: "story_user_b@example.com",
  password: "Password123",
};


// =========================================
// TEST STATE
// =========================================

let tokenA = null;
let tokenB = null;

let userAId = null;
let userBId = null;

let projectAId = null;
let datasetAId = null;
let chartAId = null;


// =========================================
// HELPERS
// =========================================

const cleanupTestUsers = async () => {
  await pool.query(
    `
    DELETE FROM users
    WHERE LOWER(email) IN (
      LOWER($1),
      LOWER($2)
    )
    OR LOWER(username) IN (
      LOWER($3),
      LOWER($4)
    )
    `,
    [
      userA.email,
      userB.email,
      userA.username,
      userB.username,
    ]
  );
};


const registerUser = async (user) => {
  const response =
    await request(app)
      .post("/auth/register")
      .send(user);

  expect(response.status)
    .toBe(201);

  return response.body;
};


const createProject = async (
  token,
  name
) => {
  const response =
    await request(app)
      .post("/projects")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        name,
        folder_id: null,
      });

  expect(
    [200, 201]
  ).toContain(
    response.status
  );

  return response.body;
};


const createDataset = async (
  token,
  projectId
) => {
  const response =
    await request(app)
      .post("/data/save_dataset")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        project_id: projectId,

        rows: [
          {
            Category: "A",
            Revenue: 100,
          },
          {
            Category: "B",
            Revenue: 200,
          },
        ],
      });

  expect(
    [200, 201]
  ).toContain(
    response.status
  );

  return (
    response.body.datasetId ??
    response.body.dataset_id ??
    response.body.id
  );
};


const createChart = async (
  token,
  projectId,
  datasetId
) => {
  const response =
    await request(app)
      .post("/charts")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        project_id: projectId,
        dataset_id: datasetId,

        chart_type: "bar",

        x_axis: "Category",

        y_axis:
          JSON.stringify([
            "Revenue",
          ]),

        settings: {
          title:
            "Story Test Chart",
        },

        chart_config: {
          type: "bar",
          x: "Category",
          y: ["Revenue"],
        },

        image_data: null,
      });

  expect(
    [200, 201]
  ).toContain(
    response.status
  );

  return response.body.id;
};


const createStory = async (
  token,
  overrides = {}
) => {
  const payload = {
    name: "Integration Test Story",

    folder_id: null,

    image_url: null,

    slides: [
      {
        description:
          "First test slide",

        content: [
          {
            chartId: chartAId,

            x: 5,
            y: 10,
            width: 80,
            height: 60,
            zIndex: 1,
          },
        ],

        annotations: [
          {
            id: "test-annotation-1",
            type: "text",
            text:
              "Important value",
            x: 20,
            y: 30,
          },
        ],
      },

      {
        description:
          "Second test slide",

        content: [],

        annotations: [],
      },
    ],

    ...overrides,
  };

  return request(app)
    .post("/stories")
    .set(
      "Authorization",
      `Bearer ${token}`
    )
    .send(payload);
};


// =========================================
// SETUP
// =========================================

beforeAll(async () => {
  await cleanupTestUsers();

  const accountA =
    await registerUser(userA);

  const accountB =
    await registerUser(userB);

  tokenA =
    accountA.token;

  tokenB =
    accountB.token;

  userAId =
    accountA.user.id;

  userBId =
    accountB.user.id;

  const projectA =
    await createProject(
      tokenA,
      "Story Chart Project"
    );

  projectAId =
    projectA.id;

  datasetAId =
    await createDataset(
      tokenA,
      projectAId
    );

  chartAId =
    await createChart(
      tokenA,
      projectAId,
      datasetAId
    );
});


afterEach(async () => {
  /*
   * Keep the test user's project,
   * dataset and chart.
   *
   * Remove stories created by
   * individual tests.
   *
   * ON DELETE CASCADE removes slides,
   * slide_content and annotations.
   */
  await pool.query(
    `
    DELETE FROM stories
    WHERE user_id IN ($1, $2)
    `,
    [
      userAId,
      userBId,
    ]
  );
});


afterAll(async () => {
  await cleanupTestUsers();

  await pool.end();
});


// =========================================
// CREATE STORY
// =========================================

describe(
  "POST /stories",
  () => {
    test(
      "rejects story creation without authentication",
      async () => {
        const response =
          await request(app)
            .post("/stories")
            .send({
              name:
                "Unauthorized Story",
              slides: [],
            });

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "creates story for authenticated user",
      async () => {
        const response =
          await createStory(
            tokenA
          );

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        expect(
          response.body
        ).toHaveProperty(
          "id"
        );

        const result =
          await pool.query(
            `
            SELECT *
            FROM stories
            WHERE id = $1
            `,
            [
              response.body.id,
            ]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .user_id
        ).toBe(userAId);

        expect(
          result.rows[0].name
        ).toBe(
          "Integration Test Story"
        );
      }
    );


    test(
      "stores slides in correct positions",
      async () => {
        const response =
          await createStory(
            tokenA
          );

        const storyId =
          response.body.id;

        const slides =
          await pool.query(
            `
            SELECT
              position,
              description,
              user_id
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [storyId]
          );

        expect(
          slides.rows
        ).toHaveLength(2);

        expect(
          slides.rows[0]
            .position
        ).toBe(0);

        expect(
          slides.rows[1]
            .position
        ).toBe(1);

        expect(
          slides.rows[0]
            .description
        ).toBe(
          "First test slide"
        );

        expect(
          slides.rows[1]
            .description
        ).toBe(
          "Second test slide"
        );

        slides.rows.forEach(
          (slide) => {
            expect(
              slide.user_id
            ).toBe(userAId);
          }
        );
      }
    );


    test(
      "stores slide chart content and layout",
      async () => {
        const response =
          await createStory(
            tokenA
          );

        const storyId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT
              sc.chart_id,
              sc.position,
              sc.layout,
              sc.user_id

            FROM slide_content sc

            JOIN slides s
              ON s.id =
                 sc.slide_id

            WHERE s.story_id = $1
            `,
            [storyId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        const item =
          result.rows[0];

        expect(
          item.chart_id
        ).toBe(chartAId);

        expect(
          item.position
        ).toBe(0);

        expect(
          item.user_id
        ).toBe(userAId);

        expect(
          item.layout
        ).toEqual({
          x: 5,
          y: 10,
          width: 80,
          height: 60,
          zIndex: 1,
        });
      }
    );


    test(
      "stores slide annotations",
      async () => {
        const response =
          await createStory(
            tokenA
          );

        const storyId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT
              sa.annotation,
              sa.user_id

            FROM slide_annotations sa

            JOIN slides s
              ON s.id =
                 sa.slide_id

            WHERE s.story_id = $1
            `,
            [storyId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .annotation.text
        ).toBe(
          "Important value"
        );

        expect(
          result.rows[0]
            .user_id
        ).toBe(userAId);
      }
    );


    test(
      "all created story records belong to authenticated user",
      async () => {
        const response =
          await createStory(
            tokenA
          );

        const storyId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT
              st.user_id
                AS story_user,

              s.user_id
                AS slide_user,

              sc.user_id
                AS content_user,

              sa.user_id
                AS annotation_user

            FROM stories st

            JOIN slides s
              ON s.story_id =
                 st.id

            LEFT JOIN slide_content sc
              ON sc.slide_id =
                 s.id

            LEFT JOIN slide_annotations sa
              ON sa.slide_id =
                 s.id

            WHERE st.id = $1
            `,
            [storyId]
          );

        result.rows.forEach(
          (row) => {
            expect(
              row.story_user
            ).toBe(userAId);

            expect(
              row.slide_user
            ).toBe(userAId);

            if (
              row.content_user !==
              null
            ) {
              expect(
                row.content_user
              ).toBe(userAId);
            }

            if (
              row.annotation_user !==
              null
            ) {
              expect(
                row.annotation_user
              ).toBe(userAId);
            }
          }
        );
      }
    );
  }
);


// =========================================
// GET STORIES
// =========================================

describe(
  "GET /stories",
  () => {
    test(
      "rejects story list without authentication",
      async () => {
        const response =
          await request(app)
            .get("/stories");

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "returns current user stories",
      async () => {
        await createStory(
          tokenA
        );

        const response =
          await request(app)
            .get("/stories")
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          Array.isArray(
            response.body
          )
        ).toBe(true);

        expect(
          response.body.length
        ).toBeGreaterThan(0);

        response.body.forEach(
          (story) => {
            expect(
              story.user_id
            ).toBe(userAId);
          }
        );
      }
    );


    test(
      "user B does not see user A stories",
      async () => {
        await createStory(
          tokenA
        );

        const response =
          await request(app)
            .get("/stories")
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            );

        expect(
          response.status
        ).toBe(200);

        const containsAStory =
          response.body.some(
            (story) =>
              story.user_id ===
              userAId
          );

        expect(
          containsAStory
        ).toBe(false);
      }
    );
  }
);


// =========================================
// GET ONE STORY
// =========================================

describe(
  "GET /stories/:id",
  () => {
    test(
      "owner can load story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .get(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.id
        ).toBe(storyId);
      }
    );


    test(
      "user B cannot load user A story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .get(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            );

        expect(
          [403, 404]
        ).toContain(
          response.status
        );
      }
    );


    test(
      "story response contains slides",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const response =
          await request(app)
            .get(
              `/stories/${created.body.id}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          Array.isArray(
            response.body.slides
          )
        ).toBe(true);

        expect(
          response.body.slides
        ).toHaveLength(2);
      }
    );
  }
);


// =========================================
// UPDATE STORY
// =========================================

describe(
  "PUT /stories/:id",
  () => {
    test(
      "owner can update story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .put(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            )
            .send({
              name:
                "Updated Story",

              image_url:
                "updated-preview.png",

              slides: [
                {
                  description:
                    "Updated Slide",

                  content: [
                    {
                      chartId:
                        chartAId,

                      x: 10,
                      y: 15,
                      width: 60,
                      height: 50,
                      zIndex: 1,
                    },
                  ],

                  annotations: [
                    {
                      id:
                        "updated-annotation",
                      type: "text",
                      text:
                        "Updated annotation",
                    },
                  ],
                },
              ],
            });

        expect(
          response.status
        ).toBe(200);

        const storyResult =
          await pool.query(
            `
            SELECT
              name,
              image_url
            FROM stories
            WHERE id = $1
            `,
            [storyId]
          );

        expect(
          storyResult
            .rows[0].name
        ).toBe(
          "Updated Story"
        );

        expect(
          storyResult
            .rows[0].image_url
        ).toBe(
          "updated-preview.png"
        );
      }
    );


    test(
      "update replaces old slides",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const oldSlides =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [storyId]
          );

        expect(
          oldSlides.rows
        ).toHaveLength(2);

        const oldIds =
          oldSlides.rows.map(
            (slide) =>
              slide.id
          );

        await request(app)
          .put(
            `/stories/${storyId}`
          )
          .set(
            "Authorization",
            `Bearer ${tokenA}`
          )
          .send({
            name:
              "Rebuilt Story",

            slides: [
              {
                description:
                  "Only New Slide",

                content: [],

                annotations: [],
              },
            ],
          });

        const newSlides =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            `,
            [storyId]
          );

        expect(
          newSlides.rows
        ).toHaveLength(1);

        expect(
          oldIds
        ).not.toContain(
          newSlides.rows[0].id
        );
      }
    );


    test(
      "user B cannot update user A story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .put(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            )
            .send({
              name:
                "Hacked Story",

              slides: [],
            });

        expect(
          [403, 404]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT name
            FROM stories
            WHERE id = $1
            `,
            [storyId]
          );

        expect(
          result.rows[0].name
        ).toBe(
          "Integration Test Story"
        );
      }
    );
  }
);


// =========================================
// DUPLICATE STORY
// =========================================

describe(
  "POST /stories/duplicate/:id",
  () => {
    test(
      "owner can duplicate story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .post(
              `/stories/duplicate/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        expect(
          response.body
        ).toHaveProperty(
          "id"
        );

        expect(
          response.body.id
        ).not.toBe(storyId);

        expect(
          response.body.user_id
        ).toBe(userAId);
      }
    );


    test(
      "duplicated story has copied slides",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const originalId =
          created.body.id;

        const duplicate =
          await request(app)
            .post(
              `/stories/duplicate/${originalId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        const duplicateId =
          duplicate.body.id;

        const originalSlides =
          await pool.query(
            `
            SELECT *
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [originalId]
          );

        const copiedSlides =
          await pool.query(
            `
            SELECT *
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [duplicateId]
          );

        expect(
          copiedSlides.rows
        ).toHaveLength(
          originalSlides.rows.length
        );

        expect(
          copiedSlides.rows[0].id
        ).not.toBe(
          originalSlides
            .rows[0].id
        );

        expect(
          copiedSlides
            .rows[0].description
        ).toBe(
          originalSlides
            .rows[0].description
        );
      }
    );


    test(
      "duplicated story copies content and annotations",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const originalId =
          created.body.id;

        const duplicate =
          await request(app)
            .post(
              `/stories/duplicate/${originalId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        const duplicateId =
          duplicate.body.id;

        const content =
          await pool.query(
            `
            SELECT sc.*
            FROM slide_content sc
            JOIN slides s
              ON s.id = sc.slide_id
            WHERE s.story_id = $1
            `,
            [duplicateId]
          );

        const annotations =
          await pool.query(
            `
            SELECT sa.*
            FROM slide_annotations sa
            JOIN slides s
              ON s.id = sa.slide_id
            WHERE s.story_id = $1
            `,
            [duplicateId]
          );

        expect(
          content.rows.length
        ).toBeGreaterThan(0);

        expect(
          annotations.rows.length
        ).toBeGreaterThan(0);

        expect(
          content.rows[0]
            .chart_id
        ).toBe(chartAId);

        expect(
          annotations
            .rows[0]
            .annotation.text
        ).toBe(
          "Important value"
        );
      }
    );


    test(
      "user B cannot duplicate user A story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const response =
          await request(app)
            .post(
              `/stories/duplicate/${created.body.id}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            );

        expect(
          [403, 404]
        ).toContain(
          response.status
        );
      }
    );
  }
);


// =========================================
// PUBLISH STORY
// =========================================

describe(
  "PUT /stories/:id/publish",
  () => {
    test(
      "owner can publish story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .put(
              `/stories/${storyId}/publish`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(200);

        const result =
          await pool.query(
            `
            SELECT is_published
            FROM stories
            WHERE id = $1
            `,
            [storyId]
          );

        expect(
          result.rows[0]
            .is_published
        ).toBe(true);
      }
    );


    test(
      "user B cannot publish user A story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const response =
          await request(app)
            .put(
              `/stories/${created.body.id}/publish`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            );

        expect(
          [403, 404]
        ).toContain(
          response.status
        );
      }
    );
  }
);


// =========================================
// DELETE STORY
// =========================================

describe(
  "DELETE /stories/:id",
  () => {
    test(
      "user B cannot delete user A story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .delete(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            );

        expect(
          [403, 404]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT id
            FROM stories
            WHERE id = $1
            `,
            [storyId]
          );

        expect(
          result.rows
        ).toHaveLength(1);
      }
    );


    test(
      "owner can delete story",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const response =
          await request(app)
            .delete(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          [200, 204]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT id
            FROM stories
            WHERE id = $1
            `,
            [storyId]
          );

        expect(
          result.rows
        ).toHaveLength(0);
      }
    );


    test(
      "deleting story cascades to slides content and annotations",
      async () => {
        const created =
          await createStory(
            tokenA
          );

        const storyId =
          created.body.id;

        const slides =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            `,
            [storyId]
          );

        const slideIds =
          slides.rows.map(
            (slide) =>
              slide.id
          );

        expect(
          slideIds.length
        ).toBeGreaterThan(0);

        await request(app)
          .delete(
            `/stories/${storyId}`
          )
          .set(
            "Authorization",
            `Bearer ${tokenA}`
          );

        const slidesAfter =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            `,
            [storyId]
          );

        const contentAfter =
          await pool.query(
            `
            SELECT *
            FROM slide_content
            WHERE slide_id =
              ANY($1::int[])
            `,
            [slideIds]
          );

        const annotationsAfter =
          await pool.query(
            `
            SELECT *
            FROM slide_annotations
            WHERE slide_id =
              ANY($1::int[])
            `,
            [slideIds]
          );

        expect(
          slidesAfter.rows
        ).toHaveLength(0);

        expect(
          contentAfter.rows
        ).toHaveLength(0);

        expect(
          annotationsAfter.rows
        ).toHaveLength(0);
      }
    );
  }
);