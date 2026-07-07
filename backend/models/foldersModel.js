const pool = require("../db");


const getFolders = async (userId) => {
  const result = await pool.query("SELECT * FROM folders WHERE user_id = $1", [userId]);
  return result.rows;
};

const createFolder = async (name, parent_id, userId) => {
  const result = await pool.query(
    "INSERT INTO folders (name, parent_id, user_id) VALUES ($1, $2, $3) RETURNING *",
    [name, parent_id, userId]
  );
  return result;
};

module.exports = { getFolders, createFolder };