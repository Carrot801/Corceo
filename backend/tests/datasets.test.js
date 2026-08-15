const request = require("supertest");

const app = require("../app");
const pool = require("../db");


// =========================================
// TEST USERS
// =========================================

const userA = {
  full_name: "Dataset Test User A",
  username: "dataset_test_user_a",
  email: "dataset_user_a@example.com",
  password: "Password123",
};

const userB = {
  full_name: "Dataset Test User B",
  username: "dataset_test_user_b",
  email: "dataset_user_b@example.com",
  password: "Password123",
};


// =========================================
// TEST DATA
// =========================================

const initialColumns = [
  "Category",
  "Revenue",
];

const initialRows = [
  {
    Category: "A",
    Revenue: 100,
  },
  {
    Category: "B",
    Revenue: 200,
  },
  {
    Category: "C",
    Revenue: 300,
  },
];

const updatedRows = [
  {
    Category: "A",
    Revenue: 500,
  },
  {
    Category: "B",
    Revenue: 700,
  },
];


// =========================================
// TEST STATE
// =========================================

let tokenA = null;
let tokenB = null;

let userAId = null;
let userBId = null;

let projectAId = null;
let projectBId = null;


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


const getDatasetId =
  (responseBody) => {
    return (
      responseBody?.id ??
      responseBody?.datasetId ??
      responseBody?.dataset_id ??
      responseBody?.dataset?.id ??
      null
    );
  };


const saveDataset =
  async ({
    token,
    projectId,
    datasetId = null,
    columns = initialColumns,
    rows = initialRows,
  }) => {
    return request(app)
      .post("/data/save_dataset")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        project_id: projectId,
        dataset_id: datasetId,
        columns,
        rows,
      });
  };


// =========================================
// SETUP / CLEANUP
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
      "Dataset Project A"
    );

  const projectB =
    await createProject(
      tokenB,
      "Dataset Project B"
    );

  projectAId =
    projectA.id;

  projectBId =
    projectB.id;
});


afterEach(async () => {
  /*
   * Remove datasets created during
   * individual tests while preserving
   * the two test projects.
   *
   * rows are removed automatically
   * through ON DELETE CASCADE.
   */

  await pool.query(
    `
    DELETE FROM datasets
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
// SAVE DATASET
// =========================================

describe(
  "POST /data/save_dataset",
  () => {
    test(
      "rejects unauthenticated dataset save",
      async () => {
        const response =
          await request(app)
            .post(
              "/data/save_dataset"
            )
            .send({
              project_id:
                projectAId,

              dataset_id:
                null,

              columns:
                initialColumns,

              rows:
                initialRows,
            });

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "creates a dataset for authenticated project owner",
      async () => {
        const response =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        const datasetId =
          getDatasetId(
            response.body
          );

        expect(
          datasetId
        ).toBeTruthy();

        const result =
          await pool.query(
            `
            SELECT
              id,
              project_id,
              user_id
            FROM datasets
            WHERE id = $1
            `,
            [datasetId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .project_id
        ).toBe(projectAId);

        expect(
          result.rows[0]
            .user_id
        ).toBe(userAId);
      }
    );


    test(
      "persists dataset rows correctly",
      async () => {
        const response =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        const datasetId =
          getDatasetId(
            response.body
          );

        const result =
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
          result.rows
        ).toHaveLength(
          initialRows.length
        );

        const savedRows =
          result.rows.map(
            (row) => row.data
          );

        expect(
          savedRows
        ).toEqual(
          initialRows
        );
      }
    );


    test(
      "stores rows with the authenticated user ownership",
      async () => {
        const response =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            response.body
          );

        const result =
          await pool.query(
            `
            SELECT DISTINCT user_id
            FROM rows
            WHERE dataset_id = $1
            `,
            [datasetId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .user_id
        ).toBe(userAId);
      }
    );


    test(
      "user B cannot create or overwrite a dataset for user A project",
      async () => {
        const response =
          await saveDataset({
            token: tokenB,
            projectId:
              projectAId,
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
            FROM datasets
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
      "saving the same project again updates its dataset instead of creating a second dataset",
      async () => {
        const firstResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        expect(
          [200, 201]
        ).toContain(
          firstResponse.status
        );

        const firstDatasetId =
          getDatasetId(
            firstResponse.body
          );

        const secondResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
            datasetId:
              firstDatasetId,
            rows:
              updatedRows,
          });

        expect(
          [200, 201]
        ).toContain(
          secondResponse.status
        );

        const secondDatasetId =
          getDatasetId(
            secondResponse.body
          );

        expect(
          secondDatasetId
        ).toBe(
          firstDatasetId
        );

        const datasetCount =
          await pool.query(
            `
            SELECT COUNT(*)::int AS count
            FROM datasets
            WHERE project_id = $1
            `,
            [projectAId]
          );

        expect(
          datasetCount
            .rows[0].count
        ).toBe(1);
      }
    );


    test(
      "updating a dataset replaces its previous rows",
      async () => {
        const firstResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            firstResponse.body
          );

        const updateResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
            datasetId,
            rows:
              updatedRows,
          });

        expect(
          [200, 201]
        ).toContain(
          updateResponse.status
        );

        const result =
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
          result.rows
        ).toHaveLength(
          updatedRows.length
        );

        expect(
          result.rows.map(
            (row) => row.data
          )
        ).toEqual(
          updatedRows
        );
      }
    );


    test(
      "user B cannot update user A dataset using its dataset id",
      async () => {
        const firstResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            firstResponse.body
          );

        const response =
          await saveDataset({
            token: tokenB,

            projectId:
              projectAId,

            datasetId,

            rows:
              updatedRows,
          });

        expect(
          [403, 404]
        ).toContain(
          response.status
        );

        const result =
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
          result.rows.map(
            (row) => row.data
          )
        ).toEqual(
          initialRows
        );
      }
    );
  }
);


// =========================================
// GET DATASET
// =========================================

describe(
  "GET /data/datasets",
  () => {
    test(
      "rejects unauthenticated dataset request",
      async () => {
        const response =
          await request(app)
            .get(
              `/data/datasets?project_id=${projectAId}`
            );

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "loads dataset belonging to current user",
      async () => {
        const saveResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            saveResponse.body
          );

        const response =
          await request(app)
            .get(
              `/data/datasets?project_id=${projectAId}`
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
        ).toBe(datasetId);

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
      "user B cannot load user A dataset through project id",
      async () => {
        await saveDataset({
          token: tokenA,
          projectId:
            projectAId,
        });

        const response =
          await request(app)
            .get(
              `/data/datasets?project_id=${projectAId}`
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
// GET ROWS
// =========================================

describe(
  "GET /data/rows",
  () => {
    test(
      "rejects unauthenticated row request",
      async () => {
        const saveResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            saveResponse.body
          );

        const response =
          await request(app)
            .get(
              `/data/rows?dataset_id=${datasetId}`
            );

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "loads saved dataset rows",
      async () => {
        const saveResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            saveResponse.body
          );

        const response =
          await request(app)
            .get(
              `/data/rows?dataset_id=${datasetId}`
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
            response.body
          )
        ).toBe(true);

        expect(
          response.body
        ).toHaveLength(
          initialRows.length
        );

        expect(
          response.body
        ).toEqual(
          initialRows
        );
      }
    );


    test(
      "user B cannot load rows from user A dataset",
      async () => {
        const saveResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            saveResponse.body
          );

        const response =
          await request(app)
            .get(
              `/data/rows?dataset_id=${datasetId}`
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
// DATABASE INTEGRITY
// =========================================

describe(
  "Dataset database integrity",
  () => {
    test(
      "database prevents two datasets for one project",
      async () => {
        await pool.query(
          `
          INSERT INTO datasets (
            project_id,
            name,
            user_id
          )
          VALUES ($1, $2, $3)
          `,
          [
            projectAId,
            "Dataset One",
            userAId,
          ]
        );

        let databaseError =
          null;

        try {
          await pool.query(
            `
            INSERT INTO datasets (
              project_id,
              name,
              user_id
            )
            VALUES ($1, $2, $3)
            `,
            [
              projectAId,
              "Dataset Two",
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

        /*
         * PostgreSQL unique_violation
         */
        expect(
          databaseError.code
        ).toBe("23505");
      }
    );


    test(
      "deleting dataset automatically deletes its rows",
      async () => {
        const saveResponse =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            saveResponse.body
          );

        const beforeDelete =
          await pool.query(
            `
            SELECT COUNT(*)::int
              AS count
            FROM rows
            WHERE dataset_id = $1
            `,
            [datasetId]
          );

        expect(
          beforeDelete
            .rows[0].count
        ).toBe(
          initialRows.length
        );

        await pool.query(
          `
          DELETE FROM datasets
          WHERE id = $1
          `,
          [datasetId]
        );

        const afterDelete =
          await pool.query(
            `
            SELECT COUNT(*)::int
              AS count
            FROM rows
            WHERE dataset_id = $1
            `,
            [datasetId]
          );

        expect(
          afterDelete
            .rows[0].count
        ).toBe(0);
      }
    );


    test(
      "dataset belongs to the same user as its project",
      async () => {
        const response =
          await saveDataset({
            token: tokenA,
            projectId:
              projectAId,
          });

        const datasetId =
          getDatasetId(
            response.body
          );

        const result =
          await pool.query(
            `
            SELECT
              d.user_id
                AS dataset_user_id,
              p.user_id
                AS project_user_id
            FROM datasets d
            JOIN projects p
              ON p.id =
                 d.project_id
            WHERE d.id = $1
            `,
            [datasetId]
          );

        expect(
          result.rows
        ).toHaveLength(1);

        expect(
          result.rows[0]
            .dataset_user_id
        ).toBe(userAId);

        expect(
          result.rows[0]
            .project_user_id
        ).toBe(userAId);

        expect(
          result.rows[0]
            .dataset_user_id
        ).not.toBe(userBId);
      }
    );
  }
);