const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    message: "All Users",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token has expired!",
    });
  }

  // Fetch the user and populate their subscriptions
  const currentUser = await User.findOne({ email: decoded.email });

  if (!currentUser) {
    return res.status(404).json({
      status: "fail",
      message: "The user belonging to this token does not exist.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Current user data",
    data: {
      user: currentUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  console.log(userId);
  const deletedUser = await User.findByIdAndDelete(userId);
  console.log(deletedUser);
  res.status(204).json({
    status: "success",
    message: "Success user deleted",
    data: null,
  });
});
