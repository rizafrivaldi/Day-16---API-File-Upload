const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/token");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    console.error("JWT verification error", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
