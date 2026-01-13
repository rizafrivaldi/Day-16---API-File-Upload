const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("ERROR STACK:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: false,
    message: err.message || "Internal Server Error",
  });
};
