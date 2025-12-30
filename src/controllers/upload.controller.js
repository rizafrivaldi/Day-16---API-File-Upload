const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");
const { success, error } = require("../utils/response");

exports.single = async (req, res) => {
  try {
    if (!req.file) return error(res, 400, "No file uploaded");

    const image = await prisma.image.create({
      data: {
        publicId: req.file.public_id,
        url: req.file.secure_url,
        mimetype: req.file.mimetype,
        size: req.file.bytes,
        userId: req.user.id,
      },
    });

    return success(res, 201, "File uploaded successfully", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.multiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, 400, "No files uploaded");
    }

    const images = req.files.map((file) => ({
      publicId: file.public_id,
      url: file.secure_url,
      mimetype: file.mimetype,
      size: file.bytes,
      userId: req.user.id,
    }));

    const result = await prisma.image.createMany({
      data: images,
      skipDuplicates: true,
    });

    return success(res, 201, "Multiple files uploaded successfully", images, {
      count: result.count,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const allowedSort = ["createdAt", "size", "publicId"];
    if (!allowedSort.includes(sortBy)) {
      return error(res, 400, "Invalid sort field");
    }

    const where = {
      userId: req.user.id,
      publicId: { contains: search },
    };

    const [total, images] = await Promise.all([
      prisma.image.count({ where }),
      prisma.image.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    return success(res, 200, "Images fetched successfully", images, {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return error(res, 400, "Invalid ID");

    const image = await prisma.image.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!image) return error(res, 404, "File not found");

    return success(res, 200, "Image fetched successfully", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.adminAll = async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, 200, "All images fetched", images, {
      count: images.length,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.reupload = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return error(res, 400, "No file uploaded");

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return error(res, 404, "File not found");
    if (image.userId !== req.user.id)
      return error(res, 403, "Forbidden action");

    await cloudinary.uploader.destroy(image.publicId);

    const updated = await prisma.image.update({
      where: { id },
      data: {
        publicId: req.file.public_id,
        url: req.file.secure_url,
        mimetype: req.file.mimetype,
        size: req.file.bytes,
      },
    });

    return success(res, 200, "File reuploaded successfully", {
      before: image,
      after: updated,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return error(res, 400, "Invalid ID");

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return error(res, 404, "File not found");
    if (image.userId !== req.user.id) return error(res, 403, "Forbidden");

    await cloudinary.uploader.destroy(image.publicId);
    await prisma.image.delete({ where: { id } });

    return success(res, 200, "File deleted successfully", {
      id: image.id,
      publicId: image.publicId,
      url: image.url,
      size: image.size,
      mimetype: image.mimetype,
      deletedAt: new Date(),
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
};
