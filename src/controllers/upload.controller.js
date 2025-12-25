const uploadService = require("../services/upload.service");
const { success, error } = require("../utils/response");

exports.singleUpload = async (req, res) => {
  try {
    const image = await uploadService.uploadSingle(req.file, req.user.id);
    return success(res, 201, "File uploaded", image);
  } catch (err) {
    return error(res, err.status || 500, err.message);
  }
};

exports.multipleUpload = async (req, res) => {
  try {
    const result = await uploadService.uploadMultiple(req.files, req.user.id);
    return success(res, 201, "Multiple files uploaded", result);
  } catch (err) {
    return error(res, err.status || 500, err.message);
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const image = await uploadService.deleteImage(id, req.user.id);

    return success(res, 200, "File deleted", {
      id: image.id,
      publicId: image.publicId,
      url: image.url,
      deletedAt: new Date(),
    });
  } catch (err) {
    return error(res.err.status || 500, err.message);
  }
};
