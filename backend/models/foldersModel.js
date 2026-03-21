const pool = require("../db");

const getFolders = async () => {
  const result = await pool.query("SELECT * FROM folders");
  return result.rows;
};

const createFolder = async (name, parent_id) => {
  const result = await pool.query(
    "INSERT INTO folders (name, parent_id) VALUES ($1, $2) RETURNING *",
    [name, parent_id]
  );
  return result;
};

module.exports = { getFolders, createFolder };