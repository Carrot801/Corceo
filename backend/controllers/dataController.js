const pool = require("../db");

const getColumns = async (req, res) => {
  const { dataset_id } = req.query;

  try {
    const userId = req.user.userId; // Get the user ID from the request object
    const result = await pool.query(
      "SELECT data FROM rows WHERE dataset_id = $1 AND user_id = $2 LIMIT 1",
      [dataset_id, userId]
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
    const userId = req.user.userId; 
    const result = await pool.query(
      `SELECT data->>$1 as value FROM rows WHERE dataset_id = $2 AND user_id = $3`,
      [column, dataset_id, userId]
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
    const userId = req.user.userId; // Get the user ID from the request object
    const result = await pool.query(
      "SELECT * FROM datasets WHERE project_id = $1 AND user_id = $2 LIMIT 1",
      [project_id, userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch datasets" });
  }
};

const deleteDataset = async (req, res) => {
  const { dataset_id } = req.params;  
  const userId = req.user.userId; // Get the user ID from the request object
  try {
  await pool.query("DELETE FROM rows WHERE dataset_id = $1 AND user_id = $2", [dataset_id, userId]);
  await pool.query("DELETE FROM datasets WHERE id = $1 AND user_id = $2", [dataset_id, userId]);
  res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete dataset" });
  }
}

const getAllRows = async (req, res) => {
  try {
    const datasetId = Number(req.query.dataset_id);
    const userId = req.user.userId;

    if (!Number.isInteger(datasetId)) {
      return res.status(400).json({ error: "Invalid dataset_id" });
    }

    const result = await pool.query(
      "SELECT data FROM rows WHERE dataset_id = $1 AND user_id = $2",
      [datasetId, userId]
    );

    res.json(result.rows.map(r => r.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rows" });
  }
};


const saveDataset = async (req, res) => {
  const { rows, project_id } = req.body;
  const userId = req.user.userId; // Get the user ID from the request object
  try {
    let dataset = await pool.query(
      "SELECT id FROM datasets WHERE project_id = $1 AND user_id = $2",
      [project_id, userId]
    );
    let datasetId;

    if (dataset.rows.length === 0) {
      const newDataset = await pool.query(
        "INSERT INTO datasets (project_id, name, user_id) VALUES ($1, $2, $3) RETURNING id",
        [project_id, "Project Data", userId]
      );
      datasetId = newDataset.rows[0].id;
    } else {
      datasetId = dataset.rows[0].id;
    }

    await pool.query("DELETE FROM rows WHERE dataset_id = $1 AND user_id = $2", [datasetId, userId]);

    if (rows.length > 0) {
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
    }

    res.json({ success: true, datasetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};
const renameColumn = async (req, res) => {
  const { dataset_id, oldName, newName } = req.body;
  const userId = req.user.userId; // Get the user ID from the request object
  try {
    await pool.query(
      `
      UPDATE rows
      SET data = (data - $1) || jsonb_build_object($2::text, data->$1)
      WHERE dataset_id = $3 AND user_id = $4
      `,
      [oldName, newName, dataset_id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename column" });
  }
};
const deleteColumn = async (req, res) => {
  const { dataset_id, columnName } = req.body;
  const userId = req.user.userId; // Get the user ID from the request object

  try {
    await pool.query(
      `
      UPDATE rows
      SET data = data - $1
      WHERE dataset_id = $2 AND user_id = $3
      `,
      [columnName, dataset_id, userId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete column",
    });
  }
};
const addColumn = async (req, res) => {
  const {
    dataset_id,
    columnName,
    defaultValue = ""
  } = req.body;

  const userId = req.user.userId; // Get the user ID from the request object
  try {
    await pool.query(
      `
        UPDATE rows
        SET data = data || jsonb_build_object(
          $1::text,
          to_jsonb($2::text)
        )
        WHERE dataset_id = $3 AND user_id = $4
      `,
      [columnName, defaultValue, dataset_id, userId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to add column",
    });
  }
};

module.exports = { getColumns, getColumnValues, getDataset, deleteDataset, getAllRows, saveDataset, renameColumn, deleteColumn, addColumn };