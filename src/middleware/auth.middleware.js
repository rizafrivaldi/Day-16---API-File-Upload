const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/token");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("\n🔍 ===== AUTH MIDDLEWARE DEBUG =====");
    console.log("📋 Headers:", req.headers);
    console.log("🎫 Auth Header:", authHeader);
    console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("🔑 JWT_SECRET value:", process.env.JWT_SECRET); // Temporary debug

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("🪙 Extracted Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified. Decoded payload:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
