const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisma = require("../../prisma/prisma");
const protect = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const authorize = require("../middleware/roleMiddleware");
const cloudinary = require("../config/cloudinary");

// SINGLE UPLOAD
router.post("/single", protect, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const image = await prisma.image.create({
      data: {
        publicId: file.public_id, //cloudinary public_id
        url: file.secure_url, //cloudinary secure_URL
        mimetype: file.mimetype,
        size: file.bytes,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// MULTIPLE UPLOAD
router.post(
  "/multiple",
  protect,
  upload.array("files", 5),
  async (req, res) => {
    try {
      /*if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const data = req.files.map((file) => ({
        publicId: file.filename,
        url: file.path,
        mimetype: file.mimetype,
        size: file.size,
        userId: req.user.id,
      }));
      */

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

      return res.status(201).json({
        message: "Multiple files uploaded successfully",
        count: result.count,
        images: images,
      });
    } catch (error) {
      console.error("UPLOAD MULTIPLE ERROR:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
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

    const skip = (page - 1) * limit;

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
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),
    ]);

    res.json({
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: images,
    });
  } catch (error) {
    console.error("Pagination error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
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
      return res.status(404).json({ message: "File not found" });
    }

    res.json(image);
  } catch (error) {
    console.error("GET IMAGE ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
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
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const image = await prisma.image.findUnique({ where: { id } });

      if (!image) {
        return res.status(404).json({ message: "File not found" });
      }

      if (image.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden action" });
      }

      //delete old physical file
      try {
        await fs.promises.unlink(
          path.join(__dirname, "../../uploads", image.filename)
        );
      } catch (err) {
        console.warn("Old file already deleted");
      }

      const updateImage = await prisma.image.update({
        where: { id },
        data: {
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: `/uploads/${req.file.filename}`,
        },
      });

      res.json({
        message: "File reuploaded successfully",
        before: {
          id: image.id,
          filename: image.filename,
          url: image.url,
        },
        after: updateImage,
      });
    } catch (error) {
      console.error("Reupload image error:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
);

router.delete("/admin/:id", protect, authorize("admin"), async (req, res) => {
  const id = Number(req.params.id);

  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return res.status(404).json({ message: "File not found" });

  //delete physical file
  try {
    await fs.promises.unlink(
      path.join(__dirname, "../../uploads", image.filename)
    );
  } catch {}
  await prisma.image.delete({ where: { id } });

  res.json({ message: "Admin deleted file", deletedFile: image });
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const image= await.prisma.image.findUnique({ where: { id } });

    if (!image) return.res.status(404).json({ message: "Not found" });
    if (!image.userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    
    const image = await prisma.image.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!image) return res.status(404).json({ message: "File not found" });

    if (image.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden action" });
    }

    //delete physical file
    try {
      await fs.promises.unlink(
        path.join(__dirname, "../../uploads", image.filename)
      );
    } catch (err) {
      console.warn("File already deleted");
    }

    await cloudinary.uploader.destroy(image.publicId);

    await prisma.image.delete({
      where: { id: image.id },
    });

    res.json({
      message: "File deleted successfully",
      deleteFile: {
        id: image.id,
        filename: image.filename,
        url: image.url,
        size: image.size,
        mimetype: image.mimetype,
        delete: new Date(),
      },
    });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
