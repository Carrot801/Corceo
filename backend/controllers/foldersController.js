const {
  getFolders,
  createFolder,
} = require("../models/foldersModel");

const {
  requireString,
  parsePositiveInt,
} = require("../utils/validation");


// =========================
// GET FOLDERS
// =========================

const fetchFolders = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user.userId;

    const result =
      await getFolders(userId);

    return res.json(result);
  } catch (error) {
    next(error);
  }
};


// =========================
// CREATE FOLDER
// =========================

const addFolder = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user.userId;

    const name =
      requireString(
        req.body.name,
        "name",
        {
          min: 1,
          max: 120,
        }
      );

    let parentId = null;

    if (
      req.body.parent_id !== null &&
      req.body.parent_id !== undefined
    ) {
      parentId =
        parsePositiveInt(
          req.body.parent_id,
          "parent_id"
        );
    }

    const result =
      await createFolder(
        name,
        parentId,
        userId
      );

    return res
      .status(201)
      .json(
        result.rows[0]
      );

  } catch (error) {
    next(error);
  }
};


module.exports = {
  fetchFolders,
  addFolder,
};