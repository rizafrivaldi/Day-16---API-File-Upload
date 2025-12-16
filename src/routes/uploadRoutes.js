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
        url: `/upload/${req.file.filename}`,
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
        url: `/upload/${file.filename}`,
        userId: req.user.id,
      }));

      const images = await prisma.image.createMany({
        data: imageData,
      });

      return res.status(201).json({
        message: "Multiple files uploaded successfully",
        count: images.count,
      });
    } catch (error) {
      console.error("UPLOAD MULTIPLE ERROR:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
);

router.get("/", protect, async (req, res) => {
  const images = await prisma.image.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    count: images.length,
    images,
  });
});

router.delete("/id", protect, async (req, res) => {
  const image = await prisma.image.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!image) return res.status(404).json({ message: "File not found" });

  //delete physical file
  fs.unlink(path.join(__dirname, "../../uploads", image.filename));

  await prisma.image.delete({
    where: { id: image.id },
  });

  res.json({ message: "File deleted successfully" });
});

module.exports = router;
