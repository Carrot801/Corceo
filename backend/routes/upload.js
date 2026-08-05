const express = require("express");
const router = express.Router();
const { uploadData } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/",authMiddleware, uploadData);

module.exports = router;