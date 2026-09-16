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
const deleteFolderById = async (
  folderId,
  userId
) => {
  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    // Move direct child folders to the root
    await client.query(
      `
      UPDATE folders
      SET parent_id = NULL
      WHERE parent_id = $1
        AND user_id = $2
      `,
      [
        folderId,
        userId,
      ]
    );

    // Delete only the selected folder
    const result =
      await client.query(
        `
        DELETE FROM folders
        WHERE id = $1
          AND user_id = $2
        RETURNING *
        `,
        [
          folderId,
          userId,
        ]
      );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");

    return result.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
};
const renameFolderById = async (
  folderId,
  name,
  userId
) => {
  const result = await pool.query(
    `
    UPDATE folders
    SET name = $1
    WHERE id = $2
      AND user_id = $3
    RETURNING *
    `,
    [
      name,
      folderId,
      userId,
    ]
  );

  return result.rows[0] || null;
};

module.exports = { getFolders, createFolder, deleteFolderById, renameFolderById };