const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisma = require("../../prisma/prisma");
const protect = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");

// SINGLE UPLOAD
router.post("/single", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const image = await prisma.image.create({
      data: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
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
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const imageData = req.files.map((file) => ({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        userId: req.user.id,
      }));

      const images = await prisma.image.createMany({
        data: imageData,
        skipDuplicates: true,
      });

      return res.status(201).json({
        message: "Multiple files uploaded successfully",
        count: images.count,
        imageData: imageData,
      });
    } catch (error) {
      console.error("UPLOAD MULTIPLE ERROR:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
);

router.get("/", protect, async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      count: images.length,
      images,
    });
  } catch (err) {
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

router.delete("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const image = await prisma.image.findUnique({
      where: { id },
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
