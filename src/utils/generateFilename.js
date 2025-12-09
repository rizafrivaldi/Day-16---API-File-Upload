module.exports = function generateFilename(file) {
  const ext = file.originalname.split(".").pop();
  return Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
};
