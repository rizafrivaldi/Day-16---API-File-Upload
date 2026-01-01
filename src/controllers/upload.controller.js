const uploadService = require("../services/upload.service");
const { success, error } = require("../utils/response");

exports.single = async (req, res) => {
  try {
    if (!req.file) return error(res, 400, "No file uploaded");

    const image = await uploadService.createSingle(req.file, req.user.id);

    return success(res, 201, "File uploaded successfully", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.multiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return error(res, 400, "No files uploaded");

    const result = await uploadService.createMultiple(req.files, req.user.id);

    return success(
      res,
      201,
      "Multiple files uploaded successfully",
      result.images,
      { count: result.count }
    );
  } catch (err) {
    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await uploadService.getAll({
      userId: req.user.id,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search || "",
      sortBy: req.query.sortBy || "createdAt",
      order: req.query.order === "asc" ? "asc" : "desc",
    });

    return success(res, 200, "Images fetched", data.images, {
      meta: data.meta,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return error(res, 400, "Invalid ID");

    const image = await uploadService.getById(id, req.user.id);
    if (!image) return error(res, 404, "File not found");

    return success(res, 200, "Image fetched", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.adminAll = async (req, res) => {
  try {
    const images = await uploadService.adminAll();
    return success(res, 200, "All images fetched", images, {
      count: images.length,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.reupload = async (req, res) => {
  try {
    if (!req.file) return error(res, 400, "No file uploaded");

    const updated = await uploadService.reupload(
      Number(req.params.id),
      req.file,
      req.user.id
    );

    if (!updated) return error(res, 404, "File not found");

    return success(res, 200, "File reuploaded successfully", updated);
  } catch (err) {
    if (err === "FORBIDDEN") return error(res, 403, "Forbidden");

    console.error(err);
    return error(res, 500, "Server error");
  }
};

exports.remove = async (req, res) => {
  try {
    const image = await uploadService.remove(
      Number(req.params.id),
      req.user.id
    );

    if (!image) return error(res, 404, "File not found");

    return success(res, 200, "File deleted successfully", image);
  } catch (err) {
    if (err === "FORBIDDEN") return error(res, 403, "Forbidden");

    console.error(err);
    return error(res, 500, "Server error");
  }
};
