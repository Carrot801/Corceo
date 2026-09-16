const express = require("express");
const router = express.Router();
const { 
    fetchFolders,
    addFolder,
    deleteFolder,
    renameFolder
} = require("../controllers/foldersController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, fetchFolders);
router.post("/", authMiddleware, addFolder);
router.delete("/:folderId", authMiddleware, deleteFolder);
router.put("/:folderId", authMiddleware, renameFolder);
module.exports = router;