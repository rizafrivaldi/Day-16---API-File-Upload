const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  let error = err;

  if (error instanceof AppError) {
    console.error("Unexpected Error:", error);
    error = new AppError("Internal Server Error", 500);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
