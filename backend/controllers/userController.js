const bcrypt = require("bcrypt");
const pool = require("../db");
const getCurrentUser = async (req, res,next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      full_name,
      username,
      email,
    } = req.body;

    const normalizedName = full_name?.trim();
    const normalizedUsername = username
      ?.trim()
      .toLowerCase();
    const normalizedEmail = email
      ?.trim()
      .toLowerCase();

    if (
      !normalizedName ||
      !normalizedUsername ||
      !normalizedEmail
    ) {
      return res.status(400).json({
        error: "Full name, username, and email are required",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        error:
          "Username may contain only letters, numbers, and underscores",
      });
    }

    const duplicate = await pool.query(
      `
      SELECT id, email, username
      FROM users
      WHERE id <> $1
        AND (
          LOWER(email) = LOWER($2)
          OR LOWER(username) = LOWER($3)
        )
      `,
      [
        userId,
        normalizedEmail,
        normalizedUsername,
      ]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        error: "Email or username is already in use",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        full_name = $1,
        username = $2,
        email = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING
        id,
        full_name,
        username,
        email
      `,
      [
        normalizedName,
        normalizedUsername,
        normalizedEmail,
        userId,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update profile error:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email or username is already in use",
      });
    }

    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
  return res
    .status(400)
    .json({
      error:
        "New password must be at least 8 characters",
    });
}

if (!/[A-Z]/.test(newPassword)) {
  return res
    .status(400)
    .json({
      error:
        "New password must contain at least one uppercase letter",
    });
}

if (!/[0-9]/.test(newPassword)) {
  return res
    .status(400)
    .json({
      error:
        "New password must contain at least one number",
    });
}

    const result = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordIsCorrect) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );

    if (samePassword) {
      return res.status(400).json({
        error: "New password must be different from the current password",
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newPasswordHash, userId]
    );

    return res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};

const deleteCurrentUser = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Password is required to delete the account",
      });
    }

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
      FOR UPDATE
      `,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "User not found",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsCorrect) {
      await client.query("ROLLBACK");

      return res.status(401).json({
        error: "Password is incorrect",
      });
    }

    await client.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [userId]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Account deleted successfully",
    });
  } catch (err) {
  try {
    await client.query(
      "ROLLBACK"
    );
  } catch (
    rollbackError
  ) {
    console.error(
      "Rollback failed:",
      rollbackError
    );
  }

  if (err.code === "23503") {
    return res
      .status(409)
      .json({
        error:
          "The account still owns projects or stories. Configure cascading deletion or delete those records first.",
      });
  }

  next(err);
} finally {
    client.release();
  }
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteCurrentUser,
};