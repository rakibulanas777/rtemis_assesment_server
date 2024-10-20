const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");

exports.createBooking = catchAsync(async (req, res, next) => {
  const { userId, room, startDate, endDate } = req.body;

  const hasConflict = await Booking.checkDateConflict(
    room,
    new Date(startDate),
    new Date(endDate)
  );

  if (hasConflict) {
    return res
      .status(400)
      .send({ message: "Room is already booked for the selected dates." });
  }

  try {
    const newBooking = await Booking.create({
      user: userId,
      room: room,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.status(201).send({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res
      .status(500)
      .send({ message: "Failed to create booking. Please try again later." });
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

// Controller for approving a booking
exports.approveBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById({ _id: bookingId });
  if (!booking) {
    return res
      .status(404)
      .send({ success: false, message: "Booking not found." });
  }

  // Check if the booking is already approved
  if (booking.approved) {
    return res
      .status(400)
      .send({ success: false, message: "Booking is already approved." });
  }

  // Approve the booking
  booking.approved = true;
  await booking.save();

  res.status(200).send({
    success: true, // Success flag
    message: "Booking approved successfully!", // Success message
    booking,
  });
});

// Controller for cancelling a booking
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  // Fetch the booking using the bookingId
  const booking = await Booking.findById({ _id: bookingId });
  if (!booking) {
    return res
      .status(404)
      .send({ success: false, message: "Booking not found." });
  }

  // Check if the booking is already cancelled
  if (booking.status === "cancelled") {
    return res
      .status(400)
      .send({ success: false, message: "Booking is already cancelled." });
  }

  // Cancel the booking
  booking.status = "cancelled";
  await booking.save();

  res.status(200).send({
    success: true, // Success flag
    message: "Booking cancelled successfully!", // Success message
    booking,
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);
  const bookings = await Booking.find({ user: userId })
    .populate("room")
    .populate("user");

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
