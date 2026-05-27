const express = require("express");
const router = express.Router();
const { uploadCSV } = require("../controllers/uploadController");

router.post("/", uploadCSV);

module.exports = router;