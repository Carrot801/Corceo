const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");


const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      password,
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
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 30
    ) {
      return res.status(400).json({
        error: "Username must be between 3 and 30 characters",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        error:
          "Username may contain only letters, numbers, and underscores",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter",
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        error: "Password must contain at least one number",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id, email, username
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(username) = LOWER($2)
      `,
      [normalizedEmail, normalizedUsername]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];

      if (
        existing.email?.toLowerCase() ===
        normalizedEmail
      ) {
        return res.status(409).json({
          error: "An account with this email already exists",
        });
      }

      return res.status(409).json({
        error: "This username is already taken",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        username,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
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
        passwordHash,
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email or username is already in use",
      });
    }

    return res.status(500).json({
      error: "Registration failed",
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Login failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};