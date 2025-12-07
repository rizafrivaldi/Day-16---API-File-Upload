const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

//single file upload endpoint
router.post("/single", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  return res.json({
    message: "File uploaded successfully",
    file: {
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

//multiple files upload
router.post("/multiple", upload.array("files", 5), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: "No files uploaded" });

  return res.json({
    success: true,
    count: req.files.length,
    files: req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    })),
  });
});

module.exports = router;
