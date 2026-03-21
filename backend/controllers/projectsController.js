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

module.exports = { fetchProjects, addProject };