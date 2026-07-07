const pool = require("../db");

const { getProjects, createProject,getAllProjects } = require("../models/projectsModel");
const fetchProjects = async (req, res) => {
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
      ORDER BY id DESC
      `,
      [userId, folder_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

const fetchAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: "Failed to fetch all projects" });
  }
};

const addProject = async (req, res) => {
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
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

const renameProject = async (req, res) => {
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
    console.error("Error renaming project:", error);
    res.status(500).json({ error: "Failed to rename project" });
  }
};

const deleteProject = async (req, res) => {
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
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  } finally {
    client.release();
  }
};
const duplicateProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const { project_id } = req.params;

    await client.query("BEGIN");

    // Create new project
    const projectResult = await client.query(
      `
      INSERT INTO projects (name, folder_id, image_url)
      SELECT name || ' Copy', folder_id, image_url
      FROM projects
      WHERE id = $1
      RETURNING *
      `,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const newProject = projectResult.rows[0];
    const newProjectId = newProject.id;

    // Copy charts belonging to original project
    await client.query(
      `
      INSERT INTO charts
      (
        project_id,
        dataset_id,
        chart_type,
        x_axis,
        y_axis,
        settings
      )
      SELECT
        $1,
        dataset_id,
        chart_type,
        x_axis,
        y_axis,
        settings
      FROM charts
      WHERE project_id = $2
      `,
      [newProjectId, project_id]
    );

    await client.query("COMMIT");

    res.status(201).json(newProject);

  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    res.status(500).json({
      error: "Failed to duplicate project",
    });
  } finally {
    client.release();
  }
};
const getProjectChart = async (req, res) => {
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
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch chart"
    });
  }
};


module.exports = { fetchProjects, addProject, renameProject, deleteProject, duplicateProject, fetchAllProjects,getProjectChart };