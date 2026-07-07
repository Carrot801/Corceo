const express = require("express");
const router = express.Router();
const { fetchProjects, addProject,renameProject, deleteProject, duplicateProject, fetchAllProjects, getProjectChart } = require("../controllers/projectsController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, fetchProjects);
router.get("/all", authMiddleware, fetchAllProjects);
router.post("/", authMiddleware, addProject);
router.put("/:project_id", authMiddleware, renameProject);
router.delete("/:project_id", authMiddleware, deleteProject);
router.post("/duplicate/:project_id", authMiddleware, duplicateProject);
router.get("/chart/:project_id", authMiddleware, getProjectChart);

module.exports = router;