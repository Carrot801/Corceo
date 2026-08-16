const { Pool } = require("pg");

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string is not configured"
  );
}

const pool = new Pool({
  connectionString,
});

module.exports = pool;