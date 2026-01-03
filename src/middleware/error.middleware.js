const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("GLOBAL ERROR", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      messaage: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
