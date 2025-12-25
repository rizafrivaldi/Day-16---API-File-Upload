exports.success = (res, status, message, data = null, meta = null) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    meta,
  });
};

exports.error = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
