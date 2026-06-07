const express = require("express");
const router = express.Router();
const { getColumns, getColumnValues, getDataset, getAllRows, deleteDataset, saveDataset, getPublishedChart, renameColumn} = require("../controllers/dataController");

router.get("/columns", getColumns);
router.put("/columns/rename", renameColumn);
router.get("/values", getColumnValues);
router.get("/datasets", getDataset);
router.get("/rows", getAllRows);
router.post("/save_dataset", saveDataset);
router.delete("/datasets/:dataset_id", deleteDataset);
module.exports = router;