const express = require("express");
const router = express.Router();
const { fetchProjects, addProject } = require("../controllers/projectsController");

router.get("/", fetchProjects);
router.post("/", addProject);

module.exports = router;