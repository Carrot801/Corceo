const pool = require("../db");

const getColumns = async (req, res) => {
  const { dataset_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT data FROM rows WHERE dataset_id = $1 LIMIT 1",
      [dataset_id]
    );

    if (result.rows.length === 0) {
      return res.json([]);
    }

    const columns = Object.keys(result.rows[0].data);

    res.json(columns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
};

const getColumnValues = async (req, res) => {
  try {
    const { dataset_id, column } = req.query;

    const result = await pool.query(
      `SELECT data->>$1 as value FROM rows WHERE dataset_id = $2`,
      [column, dataset_id]
    );

    res.json(result.rows.map(r => r.value));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch column values" });
  }
};

const getDataset = async (req, res) => {
  const { project_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM datasets WHERE project_id = $1 LIMIT 1",
      [project_id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch datasets" });
  }
};

const deleteDataset = async (req, res) => {
  const { dataset_id } = req.params;  
  try {
  await pool.query("DELETE FROM rows WHERE dataset_id = $1", [dataset_id]);
  await pool.query("DELETE FROM datasets WHERE id = $1", [dataset_id]);
  res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete dataset" });
  }
}
const getAllRows = async (req, res) => {
  try {
    const { dataset_id } = req.query;

    const result = await pool.query(
      "SELECT data FROM rows WHERE dataset_id = $1",
      [dataset_id]
    );

    const rows = result.rows.map(r => r.data);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rows" });
  }
};
const saveDataset = async (req, res) => {
  const { rows, project_id } = req.body;
  try {
    let dataset = await pool.query("SELECT id FROM datasets WHERE project_id = $1", [project_id]);
    let datasetId;

    if (dataset.rows.length === 0) {
      const newDataset = await pool.query(
        "INSERT INTO datasets (project_id, name) VALUES ($1, $2) RETURNING id",
        [project_id, "Project Data"]
      );
      datasetId = newDataset.rows[0].id;
    } else {
      datasetId = dataset.rows[0].id;
    }

    await pool.query("DELETE FROM rows WHERE dataset_id = $1", [datasetId]);

    if (rows.length > 0) {
      const values = [];
      const placeholders = rows.map((row, i) => {
        values.push(datasetId, row);
        return `($${i * 2 + 1}, $${i * 2 + 2})`;
      });

      await pool.query(
        `INSERT INTO rows (dataset_id, data) VALUES ${placeholders.join(",")}`,
        values
      );
    }

    res.json({ success: true, datasetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};
const renameColumn = async (req, res) => {
  const { dataset_id, oldName, newName } = req.body;

  try {
    await pool.query(
      `
      UPDATE rows
      SET data =
        (data - $1) ||
        jsonb_build_object($2, data->$1)
      WHERE dataset_id = $3
      `,
      [oldName, newName, dataset_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to rename column",
    });
  }
};

module.exports = { getColumns, getColumnValues, getDataset, deleteDataset, getAllRows, saveDataset, renameColumn };