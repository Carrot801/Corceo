const request = require("supertest");

const app = require("../app");
const pool = require("../db");


// =========================================
// TEST USERS
// =========================================

const userA = {
  full_name: "Chart Test User A",
  username: "chart_test_user_a",
  email: "chart_user_a@example.com",
  password: "Password123",
};

const userB = {
  full_name: "Chart Test User B",
  username: "chart_test_user_b",
  email: "chart_user_b@example.com",
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
let projectBId = null;

let datasetAId = null;
let datasetBId = null;


// =========================================
// CHART DATA
// =========================================

const chartPayload = {
  chart_type: "bar",

  x_axis: "Category",

  y_axis: JSON.stringify([
    "Revenue",
  ]),

  settings: {
    title: "Revenue by Category",
    showLegend: true,
    showGrid: true,
    decimalPlaces: 2,
  },

  chart_config: {
    type: "bar",
    x: "Category",
    y: [
      "Revenue",
    ],
    aggregation: "sum",
    sort: "desc",
    filters: [],
  },

  image_data:
    "data:image/png;base64,test-image",
};


const updatedChartPayload = {
  chart_type: "line",

  x_axis: "Month",

  y_axis: JSON.stringify([
    "Sales",
  ]),

  settings: {
    title: "Monthly Sales",
    showLegend: false,
    showGrid: false,
    decimalPlaces: 0,
  },

  chart_config: {
    type: "line",
    x: "Month",
    y: [
      "Sales",
    ],
    aggregation: "avg",
    sort: "asc",
    filters: [],
  },

  image_data:
    "data:image/png;base64,updated-image",
};


// =========================================
// HELPERS
// =========================================

const cleanupTestUsers =
  async () => {
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


const registerUser =
  async (user) => {
    const response =
      await request(app)
        .post("/auth/register")
        .send(user);

    expect(
      response.status
    ).toBe(201);

    return response.body;
  };


const createProject =
  async (
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


const saveDataset =
  async (
    token,
    projectId
  ) => {
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

          dataset_id:
            null,

          columns: [
            "Category",
            "Revenue",
            "Month",
            "Sales",
          ],

          rows: [
            {
              Category: "A",
              Revenue: 100,
              Month: "January",
              Sales: 50,
            },

            {
              Category: "B",
              Revenue: 200,
              Month: "February",
              Sales: 75,
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
      response.body.id ??
      response.body.dataset?.id
    );
  };


const saveChart =
  async ({
    token,
    projectId,
    datasetId,
    payload = chartPayload,
  }) => {
    return request(app)
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

        ...payload,
      });
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
      "Chart Project A"
    );

  const projectB =
    await createProject(
      tokenB,
      "Chart Project B"
    );

  projectAId =
    projectA.id;

  projectBId =
    projectB.id;

  datasetAId =
    await saveDataset(
      tokenA,
      projectAId
    );

  datasetBId =
    await saveDataset(
      tokenB,
      projectBId
    );
});


afterEach(async () => {
  await pool.query(
    `
    DELETE FROM charts
    WHERE project_id IN ($1, $2)
    `,
    [
      projectAId,
      projectBId,
    ]
  );
});


afterAll(async () => {
  await cleanupTestUsers();

  await pool.end();
});


// =========================================
// CREATE CHART
// =========================================

describe(
  "POST /charts",
  () => {
    test(
      "rejects chart save without authentication",
      async () => {
        const response =
          await request(app)
            .post("/charts")
            .send({
              project_id:
                projectAId,

              dataset_id:
                datasetAId,

              ...chartPayload,
            });

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "allows authenticated user to save chart",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        expect(
          response.body
        ).toHaveProperty("id");

        expect(
          response.body
            .project_id
        ).toBe(projectAId);

        expect(
          response.body
            .dataset_id
        ).toBe(datasetAId);

        expect(
          response.body
            .user_id
        ).toBe(userAId);
      }
    );


    test(
      "stores chart type and axes correctly",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT
              chart_type,
              x_axis,
              y_axis
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .chart_type
        ).toBe("bar");

        expect(
          result.rows[0]
            .x_axis
        ).toBe("Category");

        expect(
          JSON.parse(
            result.rows[0]
              .y_axis
          )
        ).toEqual([
          "Revenue",
        ]);
      }
    );


    test(
      "stores settings JSON correctly",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT settings
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          result.rows[0]
            .settings
        ).toEqual(
          chartPayload.settings
        );
      }
    );


    test(
      "stores chart_config JSON correctly",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT chart_config
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          result.rows[0]
            .chart_config
        ).toEqual(
          chartPayload
            .chart_config
        );
      }
    );


    test(
      "stores image_data",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT image_data
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          result.rows[0]
            .image_data
        ).toBe(
          chartPayload
            .image_data
        );
      }
    );


    test(
      "chart belongs to authenticated user",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT user_id
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          result.rows[0]
            .user_id
        ).toBe(userAId);

        expect(
          result.rows[0]
            .user_id
        ).not.toBe(userBId);
      }
    );


    test(
      "user B cannot create chart inside user A project",
      async () => {
        const response =
          await saveChart({
            token: tokenB,

            projectId:
              projectAId,

            datasetId:
              datasetAId,
          });

        expect(
          [403, 404]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT *
            FROM charts
            WHERE project_id = $1
            `,
            [projectAId]
          );

        expect(
          result.rows
        ).toHaveLength(0);
      }
    );


    test(
      "user A cannot use user B dataset for user A chart",
      async () => {
        const response =
          await saveChart({
            token: tokenA,

            projectId:
              projectAId,

            datasetId:
              datasetBId,
          });

        expect(
          [400, 403, 404]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT *
            FROM charts
            WHERE project_id = $1
            `,
            [projectAId]
          );

        expect(
          result.rows
        ).toHaveLength(0);
      }
    );
  }
);


// =========================================
// UPDATE / UPSERT
// =========================================

describe(
  "Chart update behavior",
  () => {
    test(
      "saving chart again updates existing chart instead of creating second chart",
      async () => {
        const firstResponse =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        expect(
          [200, 201]
        ).toContain(
          firstResponse.status
        );

        const firstChartId =
          firstResponse.body.id;

        const secondResponse =
          await saveChart({
            token: tokenA,

            projectId:
              projectAId,

            datasetId:
              datasetAId,

            payload:
              updatedChartPayload,
          });

        expect(
          [200, 201]
        ).toContain(
          secondResponse.status
        );

        const result =
          await pool.query(
            `
            SELECT *
            FROM charts
            WHERE project_id = $1
            `,
            [projectAId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0].id
        ).toBe(
          firstChartId
        );
      }
    );


    test(
      "updated chart values are persisted",
      async () => {
        await saveChart({
          token: tokenA,
          projectId:
            projectAId,
          datasetId:
            datasetAId,
        });

        await saveChart({
          token: tokenA,

          projectId:
            projectAId,

          datasetId:
            datasetAId,

          payload:
            updatedChartPayload,
        });

        const result =
          await pool.query(
            `
            SELECT
              chart_type,
              x_axis,
              y_axis,
              settings,
              chart_config,
              image_data
            FROM charts
            WHERE project_id = $1
            `,
            [projectAId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        const chart =
          result.rows[0];

        expect(
          chart.chart_type
        ).toBe("line");

        expect(
          chart.x_axis
        ).toBe("Month");

        expect(
          JSON.parse(
            chart.y_axis
          )
        ).toEqual([
          "Sales",
        ]);

        expect(
          chart.settings
        ).toEqual(
          updatedChartPayload
            .settings
        );

        expect(
          chart.chart_config
        ).toEqual(
          updatedChartPayload
            .chart_config
        );

        expect(
          chart.image_data
        ).toBe(
          updatedChartPayload
            .image_data
        );
      }
    );


    test(
      "database allows only one chart per project",
      async () => {
        await pool.query(
          `
          INSERT INTO charts (
            project_id,
            dataset_id,
            chart_type,
            settings,
            chart_config,
            user_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          `,
          [
            projectAId,
            datasetAId,
            "bar",
            {},
            {},
            userAId,
          ]
        );

        let databaseError =
          null;

        try {
          await pool.query(
            `
            INSERT INTO charts (
              project_id,
              dataset_id,
              chart_type,
              settings,
              chart_config,
              user_id
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6
            )
            `,
            [
              projectAId,
              datasetAId,
              "line",
              {},
              {},
              userAId,
            ]
          );
        } catch (error) {
          databaseError =
            error;
        }

        expect(
          databaseError
        ).not.toBeNull();

        expect(
          databaseError.code
        ).toBe("23505");
      }
    );
  }
);


// =========================================
// GET CHART
// =========================================

describe(
  "GET /charts",
  () => {
    test(
      "rejects chart loading without authentication",
      async () => {
        const response =
          await request(app)
            .get(
              `/charts?project_id=${projectAId}`
            );

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "loads current user saved chart",
      async () => {
        const saveResponse =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          saveResponse.body.id;

        const response =
          await request(app)
            .get(
              `/charts?project_id=${projectAId}`
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
        ).toBe(chartId);

        expect(
          response.body
            .project_id
        ).toBe(projectAId);

        expect(
          response.body.user_id
        ).toBe(userAId);
      }
    );


    test(
      "loaded chart contains stored JSON configuration",
      async () => {
        await saveChart({
          token: tokenA,
          projectId:
            projectAId,
          datasetId:
            datasetAId,
        });

        const response =
          await request(app)
            .get(
              `/charts?project_id=${projectAId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
            .settings
        ).toEqual(
          chartPayload.settings
        );

        expect(
          response.body
            .chart_config
        ).toEqual(
          chartPayload
            .chart_config
        );
      }
    );


    test(
      "user B cannot load user A chart",
      async () => {
        await saveChart({
          token: tokenA,
          projectId:
            projectAId,
          datasetId:
            datasetAId,
        });

        const response =
          await request(app)
            .get(
              `/charts?project_id=${projectAId}`
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
      "returns 404 when chart does not exist",
      async () => {
        const response =
          await request(app)
            .get(
              `/charts?project_id=${projectAId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          response.status
        ).toBe(404);
      }
    );
  }
);


// =========================================
// DATABASE RELATIONSHIPS
// =========================================

describe(
  "Chart database integrity",
  () => {
    test(
      "deleting project deletes its chart",
      async () => {
        /*
         * Create a temporary project because
         * deleting projectA would break the
         * remaining test setup.
         */

        const tempProject =
          await createProject(
            tokenA,
            "Chart Cascade Project"
          );

        const tempProjectId =
          tempProject.id;

        const tempDatasetId =
          await saveDataset(
            tokenA,
            tempProjectId
          );

        const chartResponse =
          await saveChart({
            token: tokenA,

            projectId:
              tempProjectId,

            datasetId:
              tempDatasetId,
          });

        const chartId =
          chartResponse.body.id;

        const beforeDelete =
          await pool.query(
            `
            SELECT id
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          beforeDelete.rows
        ).toHaveLength(1);

        const deleteResponse =
          await request(app)
            .delete(
              `/projects/${tempProjectId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          [200, 204]
        ).toContain(
          deleteResponse.status
        );

        const afterDelete =
          await pool.query(
            `
            SELECT id
            FROM charts
            WHERE id = $1
            `,
            [chartId]
          );

        expect(
          afterDelete.rows
        ).toHaveLength(0);
      }
    );


    test(
      "chart dataset belongs to same user as chart",
      async () => {
        const response =
          await saveChart({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              datasetAId,
          });

        const chartId =
          response.body.id;

        const result =
          await pool.query(
            `
            SELECT
              c.user_id
                AS chart_user_id,

              d.user_id
                AS dataset_user_id,

              p.user_id
                AS project_user_id

            FROM charts c

            JOIN datasets d
              ON d.id =
                 c.dataset_id

            JOIN projects p
              ON p.id =
                 c.project_id

            WHERE c.id = $1
            `,
            [chartId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .chart_user_id
        ).toBe(userAId);

        expect(
          result.rows[0]
            .dataset_user_id
        ).toBe(userAId);

        expect(
          result.rows[0]
            .project_user_id
        ).toBe(userAId);
      }
    );
  }
);