const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["booked", "approved", "cancelled"],
    default: "booked",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to check for date conflicts
bookingSchema.statics.checkDateConflict = async function (
  roomId,
  startDate,
  endDate
) {
  const bookings = await this.find({
    room: roomId,
    $or: [
      { startDate: { $lt: endDate, $gt: startDate } },
      { endDate: { $gt: startDate, $lt: endDate } },
      {
        startDate: { $gte: startDate, $lte: endDate },
        endDate: { $lte: endDate },
      },
    ],
  });

  return bookings.length > 0; // Returns true if there's a conflict
};

// Create and export the Booking model
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
