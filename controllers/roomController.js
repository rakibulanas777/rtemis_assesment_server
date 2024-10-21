const Room = require("../models/roomModel");
const catchAsync = require("../utils/catchAsync");

// Get all rooms (no role restriction)
exports.getAllRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.find().sort({ createdAt: -1 });

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

exports.createRoom = catchAsync(async (req, res, next) => {
  const { title, rent, facilities, details, location } = req.body; // Fixed spelling for facilities
  console.log(req.body);
  if (!title || !rent || !facilities) {
    return res.status(400).json({
      status: "fail",
      message: "Title, rent, and facilities are required.",
    });
  }

  console.log(facilities[0]);
  const imageFile = req?.files["image"] ? req.files["image"][0] : null;
  if (!imageFile) {
    return res.status(400).json({
      status: "fail",
      message: "Image file is required.",
    });
  }
  console.log(imageFile);
  try {
    const newRoom = await Room.create({
      title,
      rent,
      facilities: facilities[0],
      details,
      location,
      picture: `https://rtemis-assesment-server-2.onrender.com/${imageFile?.originalname}`,
    });

    return res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: {
        room: newRoom,
      },
    });
  } catch (error) {
    // Handle any database errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while creating the room.",
      error: error.message, // Optionally include error details
    });
  }
});

// Update room by ID (only admin can update)
exports.updateRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;

  // Destructure the fields from the request body
  const { title, rent, facilities, details, location } = req.body;

  // Input validation
  if (!title || !rent || !facilities) {
    return res.status(400).json({
      status: "fail",
      message: "Title, rent, and facilities are required.",
    });
  }

  // Check for existing room
  const existingRoom = await Room.findById(roomId);
  if (!existingRoom) {
    return res.status(404).json({
      status: "fail",
      message: "No room found with that ID",
    });
  }

  // Handle image upload if provided
  const imageFile = req?.files["image"] ? req.files["image"][0] : null;
  if (imageFile) {
    // Update the room picture URL if a new image is uploaded
    existingRoom.picture = `https://rtemis-assesment-server-2.onrender.com/${imageFile?.originalname}`;
  }

  // Update room details
  existingRoom.title = title;
  existingRoom.rent = rent;
  existingRoom.facilities = facilities; // Store all facilities if required
  existingRoom.details = details;
  existingRoom.location = location;

  // Save updated room
  const updatedRoom = await existingRoom.save();

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
