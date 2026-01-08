const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error = ("ERROR", err);

  if (error instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
  });
};
