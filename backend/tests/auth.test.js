const request = require("supertest");

const app = require("../app");
const pool = require("../db");

const testUser = {
  full_name: "Test User",
  username: "test_auth_user",
  email: "test_auth@example.com",
  password: "Password123",
};

const secondUser = {
  full_name: "Second User",
  username: "second_auth_user",
  email: "second_auth@example.com",
  password: "Password123",
};


// =========================================
// CLEANUP HELPERS
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
      testUser.email,
      secondUser.email,
      testUser.username,
      secondUser.username,
    ]
  );
};


// =========================================
// BEFORE / AFTER
// =========================================

beforeEach(async () => {
  await cleanupTestUsers();
});

afterAll(async () => {
  await cleanupTestUsers();

  await pool.end();
});


// =========================================
// REGISTER
// =========================================

describe(
  "POST /auth/register",
  () => {
    test(
      "registers a valid user",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send(testUser);

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body
        ).toHaveProperty("token");

        expect(
          typeof response.body.token
        ).toBe("string");

        expect(
          response.body
        ).toHaveProperty("user");

        expect(
          response.body.user.email
        ).toBe(testUser.email);

        expect(
          response.body.user.username
        ).toBe(testUser.username);

        expect(
          response.body.user.full_name
        ).toBe(testUser.full_name);

        expect(
          response.body.user
            .password_hash
        ).toBeUndefined();
      }
    );


    test(
      "rejects missing fields",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              email:
                testUser.email,
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body
        ).toHaveProperty("error");
      }
    );


    test(
      "rejects username shorter than 3 characters",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,
              username: "ab",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/username/i);
      }
    );


    test(
      "rejects username longer than 30 characters",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,

              username:
                "a".repeat(31),
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/username/i);
      }
    );


    test(
      "rejects username with invalid characters",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,
              username:
                "bad username!",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/username/i);
      }
    );


    test(
      "rejects password shorter than 8 characters",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,
              password: "Abc123",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/password/i);
      }
    );


    test(
      "rejects password without uppercase letter",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,
              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/uppercase/i);
      }
    );


    test(
      "rejects password without a number",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,
              password:
                "PasswordOnly",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toMatch(/number/i);
      }
    );


    test(
      "rejects duplicate email",
      async () => {
        const firstResponse =
          await request(app)
            .post("/auth/register")
            .send(testUser);

        expect(
          firstResponse.status
        ).toBe(201);

        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...secondUser,

              email:
                testUser.email,
            });

        expect(
          response.status
        ).toBe(409);

        expect(
          response.body.error
        ).toMatch(/email/i);
      }
    );


    test(
      "rejects duplicate email regardless of case",
      async () => {
        await request(app)
          .post("/auth/register")
          .send(testUser);

        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...secondUser,

              email:
                testUser.email.toUpperCase(),
            });

        expect(
          response.status
        ).toBe(409);
      }
    );


    test(
      "rejects duplicate username",
      async () => {
        await request(app)
          .post("/auth/register")
          .send(testUser);

        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...secondUser,

              username:
                testUser.username,
            });

        expect(
          response.status
        ).toBe(409);

        expect(
          response.body.error
        ).toMatch(/username/i);
      }
    );


    test(
      "rejects duplicate username regardless of case",
      async () => {
        await request(app)
          .post("/auth/register")
          .send(testUser);

        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...secondUser,

              username:
                testUser.username
                  .toUpperCase(),
            });

        expect(
          response.status
        ).toBe(409);
      }
    );


    test(
      "normalizes email and username to lowercase",
      async () => {
        const response =
          await request(app)
            .post("/auth/register")
            .send({
              ...testUser,

              username:
                "TEST_AUTH_USER",

              email:
                "TEST_AUTH@EXAMPLE.COM",
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.user.username
        ).toBe(
          "test_auth_user"
        );

        expect(
          response.body.user.email
        ).toBe(
          "test_auth@example.com"
        );
      }
    );
  }
);


// =========================================
// LOGIN
// =========================================

describe(
  "POST /auth/login",
  () => {
    beforeEach(async () => {
      await request(app)
        .post("/auth/register")
        .send(testUser);
    });


    test(
      "logs in with valid credentials",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              email:
                testUser.email,

              password:
                testUser.password,
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
        ).toHaveProperty("token");

        expect(
          typeof response.body.token
        ).toBe("string");

        expect(
          response.body
        ).toHaveProperty("user");

        expect(
          response.body.user.email
        ).toBe(testUser.email);

        expect(
          response.body.user.username
        ).toBe(testUser.username);

        expect(
          response.body.user
            .password_hash
        ).toBeUndefined();
      }
    );


    test(
      "login email is case-insensitive",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              email:
                testUser.email
                  .toUpperCase(),

              password:
                testUser.password,
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
        ).toHaveProperty("token");
      }
    );


    test(
      "rejects wrong password",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              email:
                testUser.email,

              password:
                "WrongPassword123",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.error
        ).toMatch(
          /invalid email or password/i
        );
      }
    );


    test(
      "rejects unknown email",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              email:
                "unknown@example.com",

              password:
                testUser.password,
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.error
        ).toMatch(
          /invalid email or password/i
        );
      }
    );


    test(
      "rejects missing email",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              password:
                testUser.password,
            });

        expect(
          response.status
        ).toBe(400);
      }
    );


    test(
      "rejects missing password",
      async () => {
        const response =
          await request(app)
            .post("/auth/login")
            .send({
              email:
                testUser.email,
            });

        expect(
          response.status
        ).toBe(400);
      }
    );
  }
);


// =========================================
// PROTECTED ROUTES
// =========================================

describe(
  "Authentication middleware",
  () => {
    test(
      "rejects /users/me without token",
      async () => {
        const response =
          await request(app)
            .get("/users/me");

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body
        ).toHaveProperty("error");
      }
    );


    test(
      "rejects invalid token",
      async () => {
        const response =
          await request(app)
            .get("/users/me")
            .set(
              "Authorization",
              "Bearer invalid-token"
            );

        expect(
          response.status
        ).toBe(401);
      }
    );


    test(
      "allows /users/me with valid token",
      async () => {
        const registerResponse =
          await request(app)
            .post("/auth/register")
            .send(testUser);

        expect(
          registerResponse.status
        ).toBe(201);

        const token =
          registerResponse.body.token;

        const response =
          await request(app)
            .get("/users/me")
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.email
        ).toBe(testUser.email);

        expect(
          response.body.username
        ).toBe(
          testUser.username
        );

        expect(
          response.body
        ).not.toHaveProperty(
          "password_hash"
        );
      }
    );
  }
);