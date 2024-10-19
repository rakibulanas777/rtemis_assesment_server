const Room = require("../models/roomModel");
const catchAsync = require("../utils/catchAsync");

// Get all rooms (no role restriction)
exports.getAllRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.find();

  res.status(200).json({
    status: "success",
    message: "All rooms retrieved successfully",
    results: rooms.length,
    data: {
      rooms,
    },
  });
});

// Get room by ID (no role restriction)
exports.getRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;
  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      status: "fail",
      message: "No room found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Room details retrieved successfully",
    data: {
      room,
    },
  });
});

// Create a new room (only admin can create)
exports.createRoom = catchAsync(async (req, res, next) => {
  const newRoom = await Room.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Room created successfully",
    data: {
      room: newRoom,
    },
  });
});

// Update room by ID (only admin can update)
exports.updateRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;
  const updatedRoom = await Room.findByIdAndUpdate(roomId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedRoom) {
    return res.status(404).json({
      status: "fail",
      message: "No room found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Room updated successfully",
    data: {
      room: updatedRoom,
    },
  });
});

// Delete room by ID (only admin can delete)
exports.deleteRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;
  const deletedRoom = await Room.findByIdAndDelete(roomId);

  if (!deletedRoom) {
    return res.status(404).json({
      status: "fail",
      message: "No room found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Room deleted successfully",
    data: null,
  });
});
