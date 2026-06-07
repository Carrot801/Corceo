const pool = require("../db");

const { getProjects, createProject } = require("../models/projectsModel");

const fetchProjects = async (req, res) => {
    try {
        const folder_id = req.query.folder_id || null;
        const result = await getProjects(folder_id);
        res.json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

const addProject = async (req, res) => {
    try {
        const { name, folder_id } = req.body;
        const result = await createProject(name, folder_id);
        res.json(result);
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
};

const renameProject = async (req, res) => {
    try {
        const { project_id, new_name } = req.body;
        const result = await pool.query(
            "UPDATE projects SET name = $1 WHERE id = $2 RETURNING *",
            [new_name, project_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error renaming project:", error);
        res.status(500).json({ error: "Failed to rename project" });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { project_id } = req.params;
        await pool.query("DELETE FROM projects WHERE id = $1", [project_id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
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
module.exports = { fetchProjects, addProject, renameProject, deleteProject, duplicateProject };