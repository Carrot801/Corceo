const pool = require("../db");

const uploadCSV = async (req, res) => {
  try {
    const { rows, project_id, name } = req.body;
    const existing = await pool.query(
      "SELECT id FROM datasets WHERE project_id = $1",
      [project_id]
    );

    if (existing.rows.length > 0) {
      const oldId = existing.rows[0].id;

      await pool.query("DELETE FROM rows WHERE dataset_id = $1", [oldId]);
      await pool.query("DELETE FROM datasets WHERE id = $1", [oldId]);
    }
    
    const datasetResult = await pool.query(
      "INSERT INTO datasets (project_id, name) VALUES ($1, $2) RETURNING *",
      [project_id, name || "CSV Dataset"]
    );

    const datasetId = datasetResult.rows[0].id;

    const values = [];
    const placeholders = rows.map((row, i) => {
      values.push(datasetId, row);
      return `($${i * 2 + 1}, $${i * 2 + 2})`;
    });

    await pool.query(
      `INSERT INTO rows (dataset_id, data) VALUES ${placeholders.join(",")}`,
      values
    );

    res.json({ success: true, datasetId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = { uploadCSV };