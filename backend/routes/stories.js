const express = require("express");
const router = express.Router();

const {
  createStory,
  getStory,
  updateStory,
  getStories,
  getPublicStory,
  publishStory,
  duplicateSlide,
  deleteSlide,
  duplicateStory,
  deleteStory
} = require("../controllers/storiesController");

const authMiddleware = require("../middleware/authMiddleware");
router.post("/",authMiddleware, createStory);
router.get("/:id",authMiddleware, getStory);
router.get("/",authMiddleware, getStories);
router.put("/:storyId",authMiddleware, updateStory);
router.get("/public/:id", getPublicStory);
router.put("/:storyId/publish", authMiddleware, publishStory);
router.post("/:storyId/slides/:slideId/duplicate",authMiddleware,duplicateSlide);
router.delete("/:storyId/slides/:slideId",authMiddleware,deleteSlide);
router.post("/duplicate/:id", authMiddleware, duplicateStory);
router.delete("/:id", authMiddleware, deleteStory);
module.exports = router;