const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisma = require("../../prisma/prisma");
const protect = require("../middleware/authMiddleware");

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
    console.error("UPLOAD SINGLE ERROR:", error);
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

module.exports = router;
