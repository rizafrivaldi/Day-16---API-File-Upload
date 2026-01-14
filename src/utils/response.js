exports.success = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = null
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
};

exports.error = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  data = null,
  meta = null
) => {
  const response = {
    success: false,
    message,
    data,
  };

  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
};
