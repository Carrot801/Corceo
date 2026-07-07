const pool = require("../db");

const uploadCSV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows, project_id, name } = req.body;
    const existing = await pool.query(
      "SELECT id FROM datasets WHERE project_id = $1 AND user_id = $2",
      [project_id, userId]
    );

    if (existing.rows.length > 0) {
      const oldId = existing.rows[0].id;

      await pool.query(
        "DELETE FROM rows WHERE dataset_id = $1 AND user_id = $2",
        [oldId, userId]
      );

      await pool.query(
        "DELETE FROM datasets WHERE id = $1 AND user_id = $2",
        [oldId, userId]
      );
    }

    const datasetResult = await pool.query(
      `INSERT INTO datasets (project_id, name, user_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [project_id, name || "CSV Dataset", userId]
    );

    const datasetId = datasetResult.rows[0].id;

    const values = [];

    const placeholders = rows.map((row, i) => {
      values.push(datasetId, row, userId);
      return `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`;
    });

    await pool.query(
      `INSERT INTO rows (dataset_id, data, user_id)
      VALUES ${placeholders.join(",")}`,
      values
    );
    res.json({ success: true, datasetId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = { uploadCSV };