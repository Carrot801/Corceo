const {
  getFolders,
  createFolder,
} = require("../models/foldersModel");

const {
  requireString,
  parsePositiveInt,
} = require("../utils/validation");
const pool = require("../db");


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

      // =========================
      // VERIFY PARENT OWNERSHIP
      // =========================

      const parentResult =
        await pool.query(
          `
          SELECT id
          FROM folders
          WHERE id = $1
            AND user_id = $2
          `,
          [
            parentId,
            userId,
          ]
        );

      if (
        parentResult.rows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            error:
              "Parent folder not found",
          });
      }
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