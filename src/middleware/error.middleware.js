module.exports = (err, req, res, next) => {
  console.error("GLOBAL ERROR", err);

  if (typeof err === "object" && err.status) {
    return res.status(err.status).json({
      success: false,
      messaage: err.message,
    });
  }

  if (err === "FORBIDDEN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
