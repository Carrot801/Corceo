const request = require("supertest");

const app = require("../app");
const pool = require("../db");


// =========================================
// TEST USERS
// =========================================

const userA = {
  full_name: "Project Test User A",
  username: "project_test_user_a",
  email: "project_user_a@example.com",
  password: "Password123",
};

const userB = {
  full_name: "Project Test User B",
  username: "project_test_user_b",
  email: "project_user_b@example.com",
  password: "Password123",
};


// =========================================
// TEST STATE
// =========================================

let tokenA = null;
let tokenB = null;

let userAId = null;
let userBId = null;


// =========================================
// HELPERS
// =========================================

const cleanupTestUsers = async () => {
  /*
   * Because your database now uses
   * ON DELETE CASCADE from users,
   * deleting these users should also
   * delete their test projects,
   * datasets, charts, etc.
   */

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


const registerUser = async (
  user
) => {
  const response =
    await request(app)
      .post("/auth/register")
      .send(user);

  expect(
    response.status
  ).toBe(201);

  return response.body;
};


const createProject = async (
  token,
  name = "Test Project",
  folderId = null
) => {
  return request(app)
    .post("/projects")
    .set(
      "Authorization",
      `Bearer ${token}`
    )
    .send({
      name,
      folder_id: folderId,
    });
};


// =========================================
// BEFORE / AFTER
// =========================================

beforeAll(async () => {
  await cleanupTestUsers();

  const accountA =
    await registerUser(userA);

  const accountB =
    await registerUser(userB);

  tokenA = accountA.token;
  tokenB = accountB.token;

  userAId =
    accountA.user.id;

  userBId =
    accountB.user.id;
});


afterAll(async () => {
  await cleanupTestUsers();

  await pool.end();
});


// =========================================
// CREATE PROJECT
// =========================================

describe(
  "POST /projects",
  () => {
    test(
      "rejects project creation without authentication",
      async () => {
        const response =
          await request(app)
            .post("/projects")
            .send({
              name:
                "Unauthorized Project",
            });

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "creates a project for authenticated user",
      async () => {
        const response =
          await createProject(
            tokenA,
            "User A Project"
          );

        expect(
          response.status
        ).toBeOneOf
          ? undefined
          : undefined;

        /*
         * Use an ordinary condition here
         * because your current controller
         * may return either 200 or 201.
         */
        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        expect(
          response.body
        ).toHaveProperty("id");

        expect(
          response.body.name
        ).toBe(
          "User A Project"
        );

        expect(
          response.body.user_id
        ).toBe(userAId);
      }
    );


    test(
      "created project is stored with authenticated user ownership",
      async () => {
        const response =
          await createProject(
            tokenA,
            "Ownership Test Project"
          );

        expect(
          [200, 201]
        ).toContain(
          response.status
        );

        const projectId =
          response.body.id;

        const dbResult =
          await pool.query(
            `
            SELECT
              id,
              name,
              user_id
            FROM projects
            WHERE id = $1
            `,
            [projectId]
          );

        expect(
          dbResult.rows
        ).toHaveLength(1);

        expect(
          dbResult.rows[0].user_id
        ).toBe(userAId);
      }
    );


    test(
      "allows different users to create their own projects",
      async () => {
        const projectA =
          await createProject(
            tokenA,
            "Project A"
          );

        const projectB =
          await createProject(
            tokenB,
            "Project B"
          );

        expect(
          [200, 201]
        ).toContain(
          projectA.status
        );

        expect(
          [200, 201]
        ).toContain(
          projectB.status
        );

        expect(
          projectA.body.user_id
        ).toBe(userAId);

        expect(
          projectB.body.user_id
        ).toBe(userBId);

        expect(
          projectA.body.user_id
        ).not.toBe(
          projectB.body.user_id
        );
      }
    );
  }
);


// =========================================
// GET PROJECTS
// =========================================

describe(
  "GET /projects",
  () => {
    test(
      "rejects project list without authentication",
      async () => {
        const response =
          await request(app)
            .get("/projects");

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "returns only projects belonging to current user",
      async () => {
        await createProject(
          tokenA,
          "Private Project A"
        );

        await createProject(
          tokenB,
          "Private Project B"
        );

        const responseA =
          await request(app)
            .get("/projects")
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            );

        expect(
          responseA.status
        ).toBe(200);

        expect(
          Array.isArray(
            responseA.body
          )
        ).toBe(true);

        const hasUserBProject =
          responseA.body.some(
            (project) =>
              project.user_id ===
              userBId
          );

        expect(
          hasUserBProject
        ).toBe(false);

        responseA.body.forEach(
          (project) => {
            expect(
              project.user_id
            ).toBe(userAId);
          }
        );
      }
    );
  }
);


// =========================================
// RENAME PROJECT
// =========================================

describe(
  "PUT /projects/:id",
  () => {
    test(
      "allows owner to rename project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Old Project Name"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .put(
              `/projects/${projectId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenA}`
            )
            .send({
              name:
                "New Project Name",
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.name
        ).toBe(
          "New Project Name"
        );

        expect(
          response.body.user_id
        ).toBe(userAId);
      }
    );


    test(
      "user B cannot rename user A project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "User A Protected Project"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .put(
              `/projects/${projectId}`
            )
            .set(
              "Authorization",
              `Bearer ${tokenB}`
            )
            .send({
              name:
                "Hacked Name",
            });

        /*
         * 403 and 404 are both defensible.
         *
         * 404 is often preferable because
         * it doesn't reveal that another
         * user's resource exists.
         */
        expect(
          [403, 404]
        ).toContain(
          response.status
        );

        const result =
          await pool.query(
            `
            SELECT name
            FROM projects
            WHERE id = $1
            `,
            [projectId]
          );

        expect(
          result.rows[0].name
        ).toBe(
          "User A Protected Project"
        );
      }
    );
  }
);


// =========================================
// DELETE PROJECT
// =========================================

describe(
  "DELETE /projects/:id",
  () => {
    test(
      "user B cannot delete user A project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Protected Delete Project"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .delete(
              `/projects/${projectId}`
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
            FROM projects
            WHERE id = $1
            `,
            [projectId]
          );

        expect(
          result.rows
        ).toHaveLength(1);
      }
    );


    test(
      "allows owner to delete project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Delete Me"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .delete(
              `/projects/${projectId}`
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
            FROM projects
            WHERE id = $1
            `,
            [projectId]
          );

        expect(
          result.rows
        ).toHaveLength(0);
      }
    );
  }
);


// =========================================
// DUPLICATE PROJECT
// =========================================

describe(
  "POST /projects/duplicate/:id",
  () => {
    test(
      "allows owner to duplicate project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Original Project"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .post(
              `/projects/duplicate/${projectId}`
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
        ).toHaveProperty("id");

        expect(
          response.body.id
        ).not.toBe(projectId);

        expect(
          response.body.user_id
        ).toBe(userAId);
      }
    );


    test(
      "user B cannot duplicate user A project",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Private Original"
          );

        const projectId =
          created.body.id;

        const response =
          await request(app)
            .post(
              `/projects/duplicate/${projectId}`
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
// DATABASE CASCADE
// =========================================

describe(
  "Project database cascade",
  () => {
    test(
      "deleting project also deletes its dataset",
      async () => {
        const created =
          await createProject(
            tokenA,
            "Cascade Test Project"
          );

        const projectId =
          created.body.id;

        /*
         * Insert a dataset directly into
         * the TEST database.
         */
        const datasetResult =
          await pool.query(
            `
            INSERT INTO datasets (
              project_id,
              name,
              user_id
            )
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [
              projectId,
              "Cascade Test Dataset",
              userAId,
            ]
          );

        const datasetId =
          datasetResult.rows[0].id;

        const beforeDelete =
          await pool.query(
            `
            SELECT id
            FROM datasets
            WHERE id = $1
            `,
            [datasetId]
          );

        expect(
          beforeDelete.rows
        ).toHaveLength(1);

        const deleteResponse =
          await request(app)
            .delete(
              `/projects/${projectId}`
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
            FROM datasets
            WHERE id = $1
            `,
            [datasetId]
          );

        expect(
          afterDelete.rows
        ).toHaveLength(0);
      }
    );
  }
);