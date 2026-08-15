const pool = require("../db");

const getColumns = async (req, res, next) => {
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
    next(err);
  }
};

const getColumnValues = async (req, res, next) => {
  try {
    const { dataset_id, column } = req.query;
    const userId = req.user.userId; 
    const result = await pool.query(
      `SELECT data->>$1 as value FROM rows WHERE dataset_id = $2 AND user_id = $3`,
      [column, dataset_id, userId]
    );

    res.json(result.rows.map(r => r.value));
  } catch (err) {
    next(err);
  }
};

const getDataset = async (
  req,
  res,
  next
) => {
  try {
    const { project_id } =
      req.query;

    const userId =
      req.user.userId;

    if (
      !project_id ||
      Number.isNaN(
        Number(project_id)
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid project ID",
        });
    }

    const result =
      await pool.query(
        `
        SELECT *
        FROM datasets
        WHERE project_id = $1
          AND user_id = $2
        LIMIT 1
        `,
        [
          project_id,
          userId,
        ]
      );

    if (
      result.rows.length === 0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Dataset not found",
        });
    }

    return res.json(
      result.rows[0]
    );
  } catch (error) {
    next(error);
  }
};

const deleteDataset = async (req, res, next) => {
  const { dataset_id } = req.params;  
  const userId = req.user.userId; // Get the user ID from the request object
  try {
  await pool.query("DELETE FROM rows WHERE dataset_id = $1 AND user_id = $2", [dataset_id, userId]);
  await pool.query("DELETE FROM datasets WHERE id = $1 AND user_id = $2", [dataset_id, userId]);
  res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
const getAllRows = async (
  req,
  res,
  next
) => {
  try {
    const datasetId =
      Number(
        req.query.dataset_id
      );

    const userId =
      req.user.userId;

    // =========================
    // VALIDATE DATASET ID
    // =========================

    if (
      !Number.isInteger(
        datasetId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid dataset_id",
        });
    }

    // =========================
    // VERIFY DATASET OWNERSHIP
    // =========================

    const datasetResult =
      await pool.query(
        `
        SELECT id
        FROM datasets
        WHERE id = $1
          AND user_id = $2
        `,
        [
          datasetId,
          userId,
        ]
      );

    if (
      datasetResult.rows.length ===
      0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Dataset not found",
        });
    }

    // =========================
    // LOAD ROWS
    // =========================

    const result =
      await pool.query(
        `
        SELECT data
        FROM rows
        WHERE dataset_id = $1
          AND user_id = $2
        ORDER BY id
        `,
        [
          datasetId,
          userId,
        ]
      );

    return res.json(
      result.rows.map(
        (row) => row.data
      )
    );

  } catch (err) {
    next(err);
  }
};

const saveDataset = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { rows, project_id } = req.body;

    const userId =
      req.user.userId;

    // =========================
    // VALIDATION
    // =========================

    const projectId =
      Number(project_id);

    if (
      !Number.isInteger(projectId)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid project_id",
        });
    }

    if (!Array.isArray(rows)) {
      return res
        .status(400)
        .json({
          error:
            "Rows must be an array",
        });
    }

    // =========================
    // TRANSACTION START
    // =========================

    await client.query("BEGIN");

    // =========================
    // VERIFY PROJECT OWNERSHIP
    // =========================

    const projectResult =
      await client.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
        AND user_id = $2
        `,
        [
          projectId,
          userId,
        ],
      );

    if (
      projectResult.rows.length ===
      0
    ) {
      await client.query(
        "ROLLBACK",
      );

      return res
        .status(404)
        .json({
          error:
            "Project not found",
        });
    }

    // =========================
    // FIND DATASET
    // =========================

    const datasetResult =
      await client.query(
        `
        SELECT id
        FROM datasets
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
          projectId,
          userId,
        ],
      );

    let datasetId;

    // =========================
    // CREATE IF NEEDED
    // =========================

    if (
      datasetResult.rows.length ===
      0
    ) {
      const newDataset =
        await client.query(
          `
          INSERT INTO datasets (
            project_id,
            name,
            user_id
          )
          VALUES ($1, $2, $3)
          RETURNING id
          `,
          [
            projectId,
            "Project Data",
            userId,
          ],
        );

      datasetId =
        newDataset.rows[0].id;
    } else {
      datasetId =
        datasetResult.rows[0].id;
    }

    // =========================
    // DELETE OLD ROWS
    // =========================

    await client.query(
      `
      DELETE FROM rows
      WHERE dataset_id = $1
      AND user_id = $2
      `,
      [
        datasetId,
        userId,
      ],
    );

    // =========================
    // INSERT NEW ROWS
    // =========================

    if (rows.length > 0) {
      const values = [];

      const placeholders =
        rows.map(
          (row, index) => {
            values.push(
              datasetId,
              row,
              userId,
            );

            const base =
              index * 3;

            return `(
              $${base + 1},
              $${base + 2},
              $${base + 3}
            )`;
          },
        );

      await client.query(
        `
        INSERT INTO rows (
          dataset_id,
          data,
          user_id
        )
        VALUES
        ${placeholders.join(",")}
        `,
        values,
      );
    }

    // =========================
    // TRANSACTION SUCCESS
    // =========================

    await client.query(
      "COMMIT",
    );

    return res.json({
      success: true,
      datasetId,
    });
  } catch (err) {
    // =========================
    // TRANSACTION FAILED
    // =========================

    try {
      await client.query(
        "ROLLBACK",
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Rollback failed:",
        rollbackError,
      );
    }

    console.error(
      "Dataset save failed:",
      err,
    );

    return res
      .status(500)
      .json({
        error:
          "Failed to save dataset",
      });
  } finally {
    client.release();
  }
};
const renameColumn = async (req, res, next) => {
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
    next(err);
  }
};
const deleteColumn = async (req, res, next) => {
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
    next(err);
  }
};
const addColumn = async (req, res, next) => {
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
    next(err);
  }
};

module.exports = { getColumns, getColumnValues, getDataset, deleteDataset, getAllRows, saveDataset, renameColumn, deleteColumn, addColumn };