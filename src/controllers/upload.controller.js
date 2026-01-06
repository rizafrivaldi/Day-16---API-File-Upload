const uploadService = require("../services/upload.service");
const AppError = require("../utils/AppError");
const { success, error } = require("../utils/response");

exports.single = async (req, res) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const image = await uploadService.createSingle(req.file, req.user.id);
  return success(res, 201, "File uploaded successfully", image);
};

exports.multiple = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No files uploaded", 400));
  }

  const result = await uploadService.createMultiple(req.files, req.user.id);

  return success(
    res,
    201,
    "Multiple files uploaded successfully",
    result.images,
    { count: result.count }
  );
};

exports.getAll = async (req, res, next) => {
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
};

exports.getById = async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return next(new AppError("Invalid ID", 400));
  }

  const image = await uploadService.getById(id, req.user.id);
  if (!image) {
    return next(new AppError("File not found", 404));
  }
  return success(res, 200, "Image fetched", image);
};

exports.adminAll = async (req, res, next) => {
  const images = await uploadService.adminAll();
  return success(res, 200, "All images fetched", images, {
    count: images.length,
  });
};

exports.reupload = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const updated = await uploadService.reupload(
    Number(req.params.id),
    req.file,
    req.user.id
  );

  if (!updated) {
    return next(new AppError("File not found", 404));
  }

  return success(res, 200, "File reuploaded successfully", updated);
};

exports.remove = async (req, res) => {
  const image = await uploadService.remove(Number(req.params.id), req.user.id);

  if (!image) {
    return next(new AppError("File not found", 404));
  }
  return success(res, 200, "File deleted successfully", image);
};
