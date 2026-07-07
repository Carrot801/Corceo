const express = require("express");
const router = express.Router();
const { getColumns, getColumnValues, getDataset, getAllRows, deleteDataset, saveDataset, getPublishedChart, renameColumn, deleteColumn, addColumn} = require("../controllers/dataController");

const authMiddleware = require("../middleware/authMiddleware");
router.get("/columns",authMiddleware, getColumns);
router.put("/columns/rename", authMiddleware, renameColumn);
router.delete("/columns/delete", authMiddleware, deleteColumn);
router.post("/columns/add", authMiddleware, addColumn);
router.get("/values", authMiddleware, getColumnValues);
router.get("/datasets", authMiddleware, getDataset);
router.get("/rows", authMiddleware, getAllRows);
router.post("/save_dataset", authMiddleware, saveDataset);
router.delete("/datasets/:dataset_id", authMiddleware, deleteDataset);
module.exports = router;