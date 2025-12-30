const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/roleMiddleware");
const uploadController = require("../controllers/upload.controller");

router.post(
  "/single",
  protect,
  uploadController.single("file"),
  uploadController.single
);

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
