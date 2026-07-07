const express = require("express");
const router = express.Router();
const { 
    createChart,
    getCharts,
    getPublishedChart,
     } = require("../models/chartsModel");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.post("/",authMiddleware, createChart);
router.get("/",authMiddleware, getCharts);
router.get("/:chartId",authMiddleware,getPublishedChart);

module.exports = router;