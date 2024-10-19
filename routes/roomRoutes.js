const express = require("express");

const roomController = require("../controllers/roomController");
const { protect } = require("../controllers/authController");
const restrictTo = require("../middleware/restrictTo");
const { upload } = require("../multer");

const router = express.Router();

router.get("/getAllRooms", roomController.getAllRooms);
router.get("/getRoom/:id", roomController.getRoom);
router.post(
  "/addRoom",
  protect,
  upload.fields([{ name: "file" }, { name: "image" }]),
  roomController.createRoom
);
router.patch(
  "/rooms/:id",
  protect,
  upload.fields([{ name: "file" }, { name: "image" }]),
  roomController.updateRoom
);
router.delete("/rooms/:id", protect, roomController.deleteRoom);

module.exports = router;
