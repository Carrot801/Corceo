const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authorizationHeader =
    req.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Authorization token is required",
    });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;