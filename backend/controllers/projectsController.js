const pool = require("../db");

const { getProjects, createProject,getAllProjects } = require("../models/projectsModel");
const fetchProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const folder_id = req.query.folder_id || null;

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE user_id = $1
      AND (
        ($2::int IS NULL AND folder_id IS NULL)
        OR folder_id = $2::int
      )
      ORDER BY is_favorite DESC, id DESC
      `,
      [userId, folder_id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const fetchAllProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE user_id = $1
      ORDER BY is_favorite DESC, id DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const addProject = async (req, res, next) => {
  try {
    const { name, folder_id } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `
      INSERT INTO projects (name, folder_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name || "New Project", folder_id ?? null, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const renameProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `
      UPDATE projects
      SET name = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [name, project_id, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { project_id } = req.params;
    const userId = req.user.userId;

    await client.query("BEGIN");

    const datasets = await client.query(
      `
      SELECT id
      FROM datasets
      WHERE project_id = $1 AND user_id = $2
      `,
      [project_id, userId]
    );

    const datasetIds = datasets.rows.map(d => d.id);

    if (datasetIds.length > 0) {
      await client.query(
        `
        DELETE FROM rows
        WHERE dataset_id = ANY($1::int[])
        AND user_id = $2
        `,
        [datasetIds, userId]
      );
    }

    await client.query(
      `
      DELETE FROM charts
      WHERE project_id = $1 AND user_id = $2
      `,
      [project_id, userId]
    );

    await client.query(
      `
      DELETE FROM datasets
      WHERE project_id = $1 AND user_id = $2
      `,
      [project_id, userId]
    );

    const deletedProject = await client.query(
      `
      DELETE FROM projects
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [project_id, userId]
    );

    if (deletedProject.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Project not found" });
    }

    await client.query("COMMIT");

    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

const getCopyableColumns = async (client, tableName, excludedColumns = []) => {
  const result = await client.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND is_identity = 'NO'
      AND is_generated = 'NEVER'
    ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows
    .map((row) => row.column_name)
    .filter((column) => !excludedColumns.includes(column));
};

const copyDatabaseRow = async (
  client,
  tableName,
  originalRow,
  overrides = {},
  excludedColumns = ["id"]
) => {
  const availableColumns = await getCopyableColumns(
    client,
    tableName,
    excludedColumns
  );

  const finalRow = {
    ...originalRow,
    ...overrides,
  };

  const columns = availableColumns.filter(
    (column) => finalRow[column] !== undefined
  );

  if (columns.length === 0) {
    throw new Error(`No copyable columns found for ${tableName}`);
  }

  const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const values = columns.map((column) => finalRow[column]);

  const result = await client.query(
    `
    INSERT INTO "${tableName}" (${quotedColumns})
    VALUES (${placeholders})
    RETURNING *
    `,
    values
  );

  return result.rows[0];
};

const duplicateProject = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { project_id } = req.params;
    const userId = req.user.userId;

    if (!project_id || Number.isNaN(Number(project_id))) {
      return res.status(400).json({
        error: "Invalid project ID",
      });
    }

    await client.query("BEGIN");

    // 1. Load original project
    const originalProjectResult = await client.query(
      `
      SELECT *
      FROM projects
      WHERE id = $1
        AND user_id = $2
      `,
      [project_id, userId]
    );

    if (originalProjectResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Project not found",
      });
    }

    const originalProject = originalProjectResult.rows[0];

    // 2. Copy project
    const newProject = await copyDatabaseRow(
      client,
      "projects",
      originalProject,
      {
        name: `${originalProject.name} Copy`,
        user_id: userId,
        is_favorite: false,
      },
      ["id"]
    );

    // old dataset ID -> new dataset ID
    const datasetIdMap = new Map();

    // 3. Load and copy datasets
    const originalDatasetsResult = await client.query(
      `
      SELECT *
      FROM datasets
      WHERE project_id = $1
        AND user_id = $2
      ORDER BY id
      `,
      [project_id, userId]
    );

    for (const originalDataset of originalDatasetsResult.rows) {
      const newDataset = await copyDatabaseRow(
        client,
        "datasets",
        originalDataset,
        {
          project_id: newProject.id,
          user_id: userId,
        },
        ["id"]
      );

      datasetIdMap.set(originalDataset.id, newDataset.id);

      // 4. Copy dataset rows
      const originalRowsResult = await client.query(
        `
        SELECT *
        FROM rows
        WHERE dataset_id = $1
          AND user_id = $2
        ORDER BY id
        `,
        [originalDataset.id, userId]
      );

      for (const originalRow of originalRowsResult.rows) {
        await copyDatabaseRow(
          client,
          "rows",
          originalRow,
          {
            dataset_id: newDataset.id,
            user_id: userId,
          },
          ["id"]
        );
      }
    }

    // 5. Load and copy charts
    const originalChartsResult = await client.query(
      `
      SELECT *
      FROM charts
      WHERE project_id = $1
        AND user_id = $2
      ORDER BY id
      `,
      [project_id, userId]
    );

    for (const originalChart of originalChartsResult.rows) {
      let newDatasetId = null;

      if (originalChart.dataset_id !== null) {
        newDatasetId = datasetIdMap.get(originalChart.dataset_id);

        if (!newDatasetId) {
          throw new Error(
            `Could not find copied dataset for chart ${originalChart.id}`
          );
        }
      }

      await copyDatabaseRow(
        client,
        "charts",
        originalChart,
        {
          project_id: newProject.id,
          dataset_id: newDatasetId,
          user_id: userId,
        },
        ["id"]
      );
    }

    await client.query("COMMIT");

    res.status(201).json(newProject);
  } catch (error) {
    await client.query("ROLLBACK");

    next(error);
    console.error("Duplicate project error:", error);
  } finally {
    client.release();
  }
};

const getProjectChart = async (req, res, next) => {
  try {
    const { project_id } = req.params;

    const userId = req.user.userId; // Get the user ID from the request object
    const chart = await pool.query(
      `
      SELECT * FROM charts WHERE project_id = $1 AND user_id = $2
      `,
      [project_id, userId]
    );

    res.json(chart.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateProjectFavorite = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { is_favorite } = req.body;
    const userId = req.user.userId;

    if (!project_id || Number.isNaN(Number(project_id))) {
      return res.status(400).json({
        error: "Invalid project ID",
      });
    }

    if (typeof is_favorite !== "boolean") {
      return res.status(400).json({
        error: "is_favorite must be a boolean",
      });
    }

    const result = await pool.query(
      `
      UPDATE projects
      SET is_favorite = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
      [
        is_favorite,
        project_id,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};


module.exports = { 
  fetchProjects, 
  addProject, 
  renameProject, 
  deleteProject, 
  duplicateProject, 
  fetchAllProjects,
  getProjectChart,
  updateProjectFavorite,
 };