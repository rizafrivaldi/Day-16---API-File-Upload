const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/roleMiddleware");
const uploadController = require("../controllers/upload.controller");

/**
 * @swagger
 * /api/uploads/single:
 *   post:
 *     summary: Upload single file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post("/single", protect, upload.single("file"), uploadController.single);

/**
 * @swagger
 * /api/uploads/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Multiple files uploaded
 */
router.post(
  "/multiple",
  protect,
  upload.array("files", 5),
  uploadController.multiple
);

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  uploadController.adminAll
);

/**
 * @swagger
 * /api/uploads:
 *   get:
 *     summary: Get all user uploads
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of images
 */
router.get("/", protect, uploadController.getAll);

router.get("/:id", protect, uploadController.getById);

router.put(
  "/:id/reupload",
  protect,
  upload.single("file"),
  uploadController.reupload
);

router.delete("/:id", protect, uploadController.remove);

module.exports = router;
