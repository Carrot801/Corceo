const request = require("supertest");

const app = require("../app");
const pool = require("../db");


// =========================================
// TEST USER
// =========================================

const testUser = {
  full_name: "Transaction Test User",
  username: "transaction_test_user",
  email: "transaction_test@example.com",
  password: "Password123",
};


// =========================================
// TEST STATE
// =========================================

let token = null;
let userId = null;

let projectId = null;
let datasetId = null;
let chartId = null;


// =========================================
// HELPERS
// =========================================

const cleanupTestUser =
  async () => {
    await pool.query(
      `
      DELETE FROM users
      WHERE LOWER(email) =
            LOWER($1)
         OR LOWER(username) =
            LOWER($2)
      `,
      [
        testUser.email,
        testUser.username,
      ]
    );
  };


const registerUser =
  async () => {
    const response =
      await request(app)
        .post("/auth/register")
        .send(testUser);

    expect(
      response.status
    ).toBe(201);

    token =
      response.body.token;

    userId =
      response.body.user.id;
  };


const createProject =
  async () => {
    const response =
      await request(app)
        .post("/projects")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          name:
            "Transaction Test Project",

          folder_id: null,
        });

    expect(
      [200, 201]
    ).toContain(
      response.status
    );

    projectId =
      response.body.id;
  };


const createDataset =
  async () => {
    const response =
      await request(app)
        .post(
          "/data/save_dataset"
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          project_id:
            projectId,

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

    datasetId =
      response.body.datasetId;
  };


const createChart =
  async () => {
    const response =
      await request(app)
        .post("/charts")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          project_id:
            projectId,

          dataset_id:
            datasetId,

          chart_type:
            "bar",

          x_axis:
            "Category",

          y_axis:
            JSON.stringify([
              "Revenue",
            ]),

          settings: {
            title:
              "Transaction Chart",
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

    chartId =
      response.body.id;
  };


const createValidStory =
  async (
    name =
      "Original Transaction Story"
  ) => {
    const response =
      await request(app)
        .post("/stories")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          name,

          slides: [
            {
              description:
                "Original slide",

              content: [
                {
                  chartId,

                  x: 5,
                  y: 10,
                  width: 80,
                  height: 60,
                  zIndex: 1,
                },
              ],

              annotations: [
                {
                  id:
                    "original-annotation",

                  type: "text",

                  text:
                    "Original annotation",
                },
              ],
            },
          ],
        });

    expect(
      [200, 201]
    ).toContain(
      response.status
    );

    return response.body.id;
  };


// =========================================
// SETUP
// =========================================

beforeAll(
  async () => {
    await cleanupTestUser();

    await registerUser();

    await createProject();

    await createDataset();

    await createChart();
  }
);


afterEach(
  async () => {
    /*
     * Only remove stories.
     *
     * Keep project/dataset/chart because
     * every transaction test uses them.
     */
    await pool.query(
      `
      DELETE FROM stories
      WHERE user_id = $1
      `,
      [userId]
    );
  }
);


afterAll(
  async () => {
    await cleanupTestUser();

    await pool.end();
  }
);


// =========================================
// STORY CREATION ROLLBACK
// =========================================

describe(
  "Story creation transaction",
  () => {
    test(
      "failed story creation rolls back the story and slides",
      async () => {
        /*
         * This chart ID should not exist.
         *
         * The story itself and its slide
         * are inserted BEFORE slide_content.
         *
         * The invalid FK therefore causes
         * a failure in the middle of the
         * transaction.
         */
        const impossibleChartId =
          2147483646;

        const response =
          await request(app)
            .post("/stories")
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              name:
                "Should Roll Back",

              slides: [
                {
                  description:
                    "Temporary slide",

                  content: [
                    {
                      chartId:
                        impossibleChartId,

                      x: 0,
                      y: 0,
                      width: 100,
                      height: 100,
                      zIndex: 1,
                    },
                  ],

                  annotations: [],
                },
              ],
            });

        /*
         * Foreign-key failure should
         * reach your global error handler.
         */
        expect(
          response.status
        ).toBeGreaterThanOrEqual(
          400
        );

        // Story must not remain
        const storyResult =
          await pool.query(
            `
            SELECT id
            FROM stories
            WHERE name = $1
              AND user_id = $2
            `,
            [
              "Should Roll Back",
              userId,
            ]
          );

        expect(
          storyResult.rows
        ).toHaveLength(0);

        /*
         * No orphan slides should exist
         * either.
         */
        const slideResult =
          await pool.query(
            `
            SELECT s.id
            FROM slides s

            LEFT JOIN stories st
              ON st.id =
                 s.story_id

            WHERE s.user_id = $1
              AND st.id IS NULL
            `,
            [userId]
          );

        expect(
          slideResult.rows
        ).toHaveLength(0);
      }
    );
  }
);


// =========================================
// STORY UPDATE ROLLBACK
// =========================================

describe(
  "Story update transaction",
  () => {
    test(
      "failed story update restores original story data",
      async () => {
        const storyId =
          await createValidStory();

        // =========================
        // ORIGINAL DATABASE STATE
        // =========================

        const originalStory =
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

        const originalSlides =
          await pool.query(
            `
            SELECT
              id,
              position,
              description
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [storyId]
          );

        expect(
          originalSlides.rows
        ).toHaveLength(1);

        const originalSlideId =
          originalSlides.rows[0].id;

        const originalContent =
          await pool.query(
            `
            SELECT
              chart_id,
              position,
              layout
            FROM slide_content
            WHERE slide_id = $1
            ORDER BY position
            `,
            [originalSlideId]
          );

        expect(
          originalContent.rows
        ).toHaveLength(1);

        // =========================
        // FORCE UPDATE TO FAIL
        // =========================

        const impossibleChartId =
          2147483646;

        const response =
          await request(app)
            .put(
              `/stories/${storyId}`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              /*
               * These changes happen before
               * the bad chart is inserted.
               */
              name:
                "Broken Updated Story",

              image_url:
                "broken-image.png",

              slides: [
                {
                  description:
                    "Broken replacement slide",

                  content: [
                    {
                      chartId:
                        impossibleChartId,

                      x: 20,
                      y: 20,
                      width: 50,
                      height: 50,
                      zIndex: 1,
                    },
                  ],

                  annotations: [],
                },
              ],
            });

        expect(
          response.status
        ).toBeGreaterThanOrEqual(
          400
        );

        // =========================
        // STORY MUST BE RESTORED
        // =========================

        const storyAfter =
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
          storyAfter.rows
        ).toHaveLength(1);

        expect(
          storyAfter.rows[0].name
        ).toBe(
          originalStory.rows[0].name
        );

        expect(
          storyAfter.rows[0]
            .image_url
        ).toBe(
          originalStory.rows[0]
            .image_url
        );

        // =========================
        // ORIGINAL SLIDE MUST RETURN
        // =========================

        const slidesAfter =
          await pool.query(
            `
            SELECT
              id,
              position,
              description
            FROM slides
            WHERE story_id = $1
            ORDER BY position
            `,
            [storyId]
          );

        expect(
          slidesAfter.rows
        ).toHaveLength(1);

        expect(
          slidesAfter.rows[0].id
        ).toBe(
          originalSlideId
        );

        expect(
          slidesAfter.rows[0]
            .description
        ).toBe(
          "Original slide"
        );

        // =========================
        // ORIGINAL CONTENT MUST RETURN
        // =========================

        const contentAfter =
          await pool.query(
            `
            SELECT
              chart_id,
              position,
              layout
            FROM slide_content
            WHERE slide_id = $1
            ORDER BY position
            `,
            [
              slidesAfter
                .rows[0].id,
            ]
          );

        expect(
          contentAfter.rows
        ).toHaveLength(1);

        expect(
          contentAfter
            .rows[0].chart_id
        ).toBe(chartId);

        expect(
          contentAfter.rows[0]
            .layout
        ).toEqual(
          originalContent.rows[0]
            .layout
        );
      }
    );


    test(
      "failed story update restores annotations",
      async () => {
        const storyId =
          await createValidStory();

        const slideBefore =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            LIMIT 1
            `,
            [storyId]
          );

        const originalSlideId =
          slideBefore.rows[0].id;

        const annotationsBefore =
          await pool.query(
            `
            SELECT annotation
            FROM slide_annotations
            WHERE slide_id = $1
            `,
            [originalSlideId]
          );

        expect(
          annotationsBefore.rows
        ).toHaveLength(1);

        expect(
          annotationsBefore
            .rows[0]
            .annotation.text
        ).toBe(
          "Original annotation"
        );

        // Force transaction failure
        await request(app)
          .put(
            `/stories/${storyId}`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            name:
              "Failed Annotation Update",

            slides: [
              {
                description:
                  "Replacement",

                content: [
                  {
                    chartId:
                      2147483646,

                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    zIndex: 1,
                  },
                ],

                annotations: [
                  {
                    id:
                      "new-annotation",

                    type: "text",

                    text:
                      "Should never persist",
                  },
                ],
              },
            ],
          });

        // Original slide should exist again
        const slidesAfter =
          await pool.query(
            `
            SELECT id
            FROM slides
            WHERE story_id = $1
            `,
            [storyId]
          );

        expect(
          slidesAfter.rows
        ).toHaveLength(1);

        expect(
          slidesAfter.rows[0].id
        ).toBe(
          originalSlideId
        );

        // Original annotation should return
        const annotationsAfter =
          await pool.query(
            `
            SELECT annotation
            FROM slide_annotations
            WHERE slide_id = $1
            `,
            [originalSlideId]
          );

        expect(
          annotationsAfter.rows
        ).toHaveLength(1);

        expect(
          annotationsAfter
            .rows[0]
            .annotation.text
        ).toBe(
          "Original annotation"
        );
      }
    );
  }
);


// =========================================
// DATASET SAFETY
// =========================================

describe(
  "Dataset transaction protection",
  () => {
    test(
      "failed unauthorized dataset save does not replace existing rows",
      async () => {
        // Current rows
        const before =
          await pool.query(
            `
            SELECT data
            FROM rows
            WHERE dataset_id = $1
            ORDER BY id
            `,
            [datasetId]
          );

        expect(
          before.rows
        ).toHaveLength(2);

        /*
         * Use a project ID that doesn't
         * belong to this operation.
         *
         * saveDataset begins a transaction
         * and must reject it before changing
         * the existing dataset.
         */
        const response =
          await request(app)
            .post(
              "/data/save_dataset"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              project_id:
                2147483646,

              rows: [
                {
                  Category:
                    "Destroyed",
                  Revenue:
                    999999,
                },
              ],
            });

        expect(
          [400, 403, 404]
        ).toContain(
          response.status
        );

        // Existing dataset must be untouched
        const after =
          await pool.query(
            `
            SELECT data
            FROM rows
            WHERE dataset_id = $1
            ORDER BY id
            `,
            [datasetId]
          );

        expect(
          after.rows
        ).toEqual(
          before.rows
        );
      }
    );
  }
);