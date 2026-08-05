const pool = require("../db");

const uploadData = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const projectId = Number(req.body.project_id);
    const rows = req.body.rows;
    const name = req.body.name || "Imported Dataset";

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        error: "Invalid project_id",
      });
    }

    if (!Array.isArray(rows)) {
      return res.status(400).json({
        error: "rows must be an array",
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({
        error: "The uploaded file contains no rows",
      });
    }

    const invalidRow = rows.some(
      (row) =>
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
    );

    if (invalidRow) {
      return res.status(400).json({
        error: "Every row must be an object",
      });
    }

    const projectResult = await client.query(
      `
      SELECT id
      FROM projects
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    await client.query("BEGIN");

    const existingDataset = await client.query(
      `
      SELECT id
      FROM datasets
      WHERE project_id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [projectId, userId]
    );

    let datasetId;

    if (existingDataset.rows.length > 0) {
      datasetId = existingDataset.rows[0].id;

      await client.query(
        `
        DELETE FROM rows
        WHERE dataset_id = $1
          AND user_id = $2
        `,
        [datasetId, userId]
      );

      await client.query(
        `
        UPDATE datasets
        SET name = $1
        WHERE id = $2
          AND user_id = $3
        `,
        [name, datasetId, userId]
      );
    } else {
      const datasetResult = await client.query(
        `
        INSERT INTO datasets (
          project_id,
          name,
          user_id
        )
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [projectId, name, userId]
      );

      datasetId = datasetResult.rows[0].id;
    }

    const BATCH_SIZE = 1000;

    for (
      let start = 0;
      start < rows.length;
      start += BATCH_SIZE
    ) {
      const batch = rows.slice(
        start,
        start + BATCH_SIZE
      );

      const values = [];

      const placeholders = batch.map(
        (row, index) => {
          const offset = index * 3;

          values.push(
            datasetId,
            JSON.stringify(row),
            userId
          );

          return `(
            $${offset + 1},
            $${offset + 2}::jsonb,
            $${offset + 3}
          )`;
        }
      );

      await client.query(
        `
        INSERT INTO rows (
          dataset_id,
          data,
          user_id
        )
        VALUES ${placeholders.join(",")}
        `,
        values
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      id: datasetId,
      datasetId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Upload dataset error:",
      error
    );

    return res.status(500).json({
      error: "Upload failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  uploadData,
};