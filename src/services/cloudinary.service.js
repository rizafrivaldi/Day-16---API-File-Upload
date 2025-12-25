const cloudinary = require("../config/cloudinary");

exports.destroy = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
