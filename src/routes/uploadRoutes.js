const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisma = require("../../prisma/prisma");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const cloudinary = require("../config/cloudinary");

// SINGLE UPLOAD
router.post("/single", protect, upload.single("file"), async (req, res) => {
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

    return success(res, 201, "File uploaded succesfully", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
});

// MULTIPLE UPLOAD
router.post(
  "/multiple",
  protect,
  upload.array("files", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return error(res, 400, "No files uploaded");

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
  }
);

router.get("/", protect, async (req, res) => {
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
      publicId: {
        contains: search,
      },
    };

    const [total, images] = await Promise.all([
      prisma.image.count({ where }),
      prisma.image.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),
    ]);

    return success(res, 200, "Images fetched successfully", images, {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: images,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const image = await prisma.image.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!image) {
      return error(res, 404, "File not found");
    }

    return success(res, 200, "Image fetched successfully", image);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
});

router.get("/admin/all", protect, authorize("admin"), async (req, res) => {
  const images = await prisma.image.findMany({
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    count: images.length,
    images,
  });
});

router.put(
  "/:id/reupload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!req.file) {
        return error(res, 400, "No file uploades");
      }

      const image = await prisma.image.findUnique({ where: { id } });
      if (!image) {
        return error(res, 404, "File not found");
      }
      if (image.userId !== req.user.id) {
        return error(res, 403, "Forbidden action");
      }

      await cloudinary.uploader.destroy(image.publicId);

      const updateImage = await prisma.image.update({
        where: { id },
        data: {
          publicId: req.file.public_id,
          url: req.file.secure_url,
          mimetype: req.file.mimetype,
          size: req.file.bytes,
        },
      });

      return success(res, 200, "File uploaded successfully", {
        before: image,
        after: updateImage,
      });
    } catch (err) {
      console.error(err);
      return error(res, 500, "Terjadi kesalahan server");
    }
  }
);

router.delete("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return error(res, 400, "Invalid ID");

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return error(res, 404, "Not found");
    if (image.userId !== req.user.id) return error(res, 403, "Forbidden");

    await cloudinary.uploader.destroy(image.publicId);
    await prisma.image.delete({
      where: { id },
    });

    return success(res, 200, "File deleted successfully", {
      deletedFile: {
        id: image.id,
        publicId: image.publicId,
        url: image.url,
        size: image.size,
        mimetype: image.mimetype,
        deletedAt: new Date(),
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Terjadi kesalahan server");
  }
});

module.exports = router;
