const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteCurrentUser,
} = require("../controllers/userController");

router.get("/me", authMiddleware, getCurrentUser);

router.put("/me", authMiddleware, updateCurrentUser);

router.put(
  "/me/password",
  authMiddleware,
  changePassword
);

router.delete(
  "/me",
  authMiddleware,
  deleteCurrentUser
);

module.exports = router;