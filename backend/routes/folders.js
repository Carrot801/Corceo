const express = require("express");
const router = express.Router();
const { fetchFolders, addFolder } = require("../controllers/foldersController");

router.get("/", fetchFolders);
router.post("/", addFolder);

module.exports = router;