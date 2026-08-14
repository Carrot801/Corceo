const express = require("express");
const router = express.Router();
const { 
    createChart,
    getCharts,
    getPublishedChart,
    publishChart,
     } = require("../models/chartsModel");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/public/:chartId", getPublishedChart);

router.post("/",authMiddleware, createChart);
router.get("/",authMiddleware, getCharts);
router.get("/:chartId",authMiddleware,getPublishedChart);
router.put("/:chartId/publish",authMiddleware,publishChart,);
module.exports = router;