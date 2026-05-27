const express = require("express");
const router = express.Router();
const { createChart, getCharts, getPublishedChart } = require("../models/chartsModel");

router.post("/", createChart);
router.get("/", getCharts);
router.get("/:chartId",getPublishedChart);

module.exports = router;