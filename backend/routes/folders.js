const express = require("express");
const router = express.Router();
const { fetchFolders, addFolder } = require("../controllers/foldersController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, fetchFolders);
router.post("/", authMiddleware, addFolder);

module.exports = router;