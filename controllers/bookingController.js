const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");

exports.createBooking = catchAsync(async (req, res, next) => {
  const { userId, roomId, startDate, endDate } = req.body;

  const hasConflict = await Booking.checkDateConflict(
    roomId,
    new Date(startDate),
    new Date(endDate)
  );

  if (hasConflict) {
    return res
      .status(400)
      .send({ message: "Room is already booked for the selected dates." });
  }

  const newBooking = await Booking.create({
    user: userId,
    room: roomId,
    startDate,
    endDate,
  });
  res
    .status(201)
    .send({ message: "Booking created successfully", booking: newBooking });
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

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).send({ message: "Booking not found." });
  }

  booking.status = "cancelled";
  await booking.save();

  res.status(200).send({ message: "Booking cancelled successfully", booking });
});

// Controller for approving a booking
exports.approveBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).send({ message: "Booking not found." });
  }

  // Check if the booking is already approved
  if (booking.approved) {
    return res.status(400).send({ message: "Booking is already approved." });
  }

  // Approve the booking
  booking.approved = true;
  await booking.save();

  res.status(200).send({ message: "Booking approved successfully", booking });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const bookings = await Booking.find({ user: userId });
  res.status(200).send({ success: true, bookings });
});
