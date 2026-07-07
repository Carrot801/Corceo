const pool = require("../db");

const getProjects = async (folder_id) => {
  let result;

  if (folder_id !== null && folder_id !== undefined) {
    result = await pool.query(
      "SELECT * FROM projects WHERE folder_id = $1",
      [folder_id]
    );
  } else {
    result = await pool.query(
      "SELECT * FROM projects WHERE folder_id IS NULL"
    );
  }

  return result.rows;
};

const createProject = async (name, folder_id, user_id) => {
  const result = await pool.query(
    "INSERT INTO projects (name, folder_id, user_id) VALUES ($1, $2, $3) RETURNING *",
    [name, folder_id, user_id]
  );

  return result.rows[0];
};
const getAllProjects = async () => {
  const result = await pool.query(`
    SELECT *
    FROM projects
  `);

  return result.rows;
};

module.exports = { getProjects, createProject, getAllProjects };