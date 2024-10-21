const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");

exports.createBooking = catchAsync(async (req, res, next) => {
  const { userId, room, startDate, endDate } = req.body;

  // Validate input
  if (!userId || !room || !startDate || !endDate) {
    return res.status(400).json({
      status: "fail",
      message: "User ID, Room ID, start date, and end date are required.",
    });
  }

  const currentDate = new Date();

  // Check if the booking is for a past date
  if (new Date(startDate) <= currentDate) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot book a room for past dates.",
    });
  }

  // Check if endDate is before startDate
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({
      status: "fail",
      message: "End date cannot be earlier than start date.",
    });
  }

  // Check for date conflicts with other bookings
  const hasConflict = await Booking.checkDateConflict(
    room,
    new Date(startDate),
    new Date(endDate)
  );

  if (hasConflict) {
    return res.status(400).json({
      status: "fail",
      message: "Room is already booked for the selected dates.",
    });
  }

  try {
    // Create a new booking
    const newBooking = await Booking.create({
      user: userId,
      room: room,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      data: {
        booking: newBooking,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create booking. Please try again later.",
      error: error.message, // Optional error message for debugging
    });
  }
});

exports.modifyBooking = catchAsync(async (req, res, next) => {
  const { bookingId, startDate, endDate } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).send({ message: "Booking not found." });
  }

  const hasConflict = await Booking.checkDateConflict(
    booking.room,
    new Date(startDate),
    new Date(endDate)
  );
  if (hasConflict) {
    return res
      .status(400)
      .send({ message: "Room is already booked for the selected dates." });
  }

  booking.startDate = startDate;
  booking.endDate = endDate;
  await booking.save();

  res.status(200).send({ message: "Booking updated successfully", booking });
});

// In your bookingController.js

exports.approveBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById({ _id: bookingId });
    if (!booking) {
      return res
        .status(404)
        .send({ success: false, message: "Booking not found." });
    }

    if (booking.status === "approved") {
      return res
        .status(400)
        .send({ success: false, message: "Booking is already approved." });
    }

    // Approve the booking
    booking.status = "approved";
    await booking.save();

    req.io.to(booking.user).emit("bookingStatusChanged", {
      message: "Your booking has been approved!",
      bookingId: booking._id,
    });

    // Respond to the client
    res.status(200).send({
      success: true,
      message: "Booking approved successfully!",
      booking,
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).send({
      success: false,
      message:
        "An error occurred while approving the booking. Please try again later.",
    });
  }
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById({ _id: bookingId });
    if (!booking) {
      return res
        .status(404)
        .send({ success: false, message: "Booking not found." });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .send({ success: false, message: "Booking is already cancelled." });
    }

    // Cancel the booking
    booking.status = "cancelled";
    await booking.save();

    // Emit notification to the user
    req.io.to(booking.user).emit("bookingStatusChanged", {
      message: "Your booking has been cancelled.",
      bookingId: booking._id,
    });

    // Respond to the client
    res.status(200).send({
      success: true,
      message: "Booking cancelled successfully!",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send({
      success: false,
      message:
        "An error occurred while cancelling the booking. Please try again later.",
    });
  }
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const bookings = await Booking.find({ user: userId })
    .populate("room")
    .populate("user")
    .sort({ createdAt: -1 });

  console.log(bookings.length);

  if (!bookings.length) {
    return res.status(404).send({
      success: false,
      message: "No bookings found for this user.",
    });
  }

  res.status(200).send({
    success: true,
    count: bookings.length,
    bookings,
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate("room")
    .populate("user")
    .sort({ createdAt: -1 });

  console.log(bookings.length);

  if (!bookings.length) {
    return res.status(404).send({
      success: false,
      message: "No bookings found for this user.",
    });
  }

  res.status(200).send({
    success: true,
    count: bookings.length,
    bookings,
  });
});
