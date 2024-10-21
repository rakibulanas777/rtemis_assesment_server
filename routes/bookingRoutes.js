// routes/bookingRoutes.js
const express = require("express");
const {
  createBooking,
  modifyBooking,
  cancelBooking,
  getUserBookings,
  approveBooking,
  getAllBookings,
} = require("../controllers/bookingController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.post("/", createBooking);

router.put("/:bookingId", protect, modifyBooking);

router.patch("/:bookingId/cancel", protect, cancelBooking);

// Route to approve a booking
router.patch("/:bookingId/approve", protect, approveBooking);

router.get("/user/:userId", getUserBookings);
router.get("/all-booking", protect, getAllBookings);

module.exports = router;
