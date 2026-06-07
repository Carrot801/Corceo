const express = require("express");
const router = express.Router();
const { fetchProjects, addProject,renameProject, deleteProject, duplicateProject } = require("../controllers/projectsController");

router.get("/", fetchProjects);
router.post("/", addProject);
router.put("/:project_id", renameProject);
router.delete("/:project_id", deleteProject);
router.post("/duplicate/:project_id", duplicateProject);

module.exports = router;