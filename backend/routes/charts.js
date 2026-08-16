const express = require("express");
const router = express.Router();
const { 
    createChart,
    getCharts,
    getPublishedChart,
    publishChart,
    getChartById
     } = require("../models/chartsModel");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/public/:chartId", getPublishedChart);

router.post("/",authMiddleware, createChart);
router.get("/",authMiddleware, getCharts);
router.put("/:chartId/publish",authMiddleware,publishChart);
router.get("/:chartId",authMiddleware,getChartById);
module.exports = router;