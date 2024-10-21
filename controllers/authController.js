const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const AppError = require("../utils/appError");
const path = require("path");

const signToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user.email);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  user.otp = undefined;
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

// SignUp function
exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) return next(new AppError("Email already registered", 400));

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newUser = await User.create({
    name: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    otp,
  });

  try {
    await sendEmail({
      email: email,
      subject: "Your OTP for Email Verification",
      html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; border: 2px solid #007bff; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #007bff;">Your OTP Code</h2>
        <p style="font-size: 16px; text-align: center;">Hello, <strong>${req.body.name}</strong>!</p>
        <p style="font-size: 16px; text-align: center;">Use the following One-Time Password (OTP) to complete your verification:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #ff6b6b; padding: 10px 20px; background-color: #fff3f3; border: 1px solid #ff6b6b; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center;">This OTP is valid for the next 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #555; text-align: center;">If you did not request this OTP, please ignore this email or contact support immediately.</p>
        <p style="font-size: 12px; color: #555; text-align: center;">Thanks, <br/> The Room Booking Team</p>
      </div>
    </div>
  `,
    });

    createSendToken(
      newUser,
      200,
      res,
      "Registration Successful. Check your email for OTP verification."
    );
  } catch (err) {
    await User.findByIdAndDelete(newUser.id);
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// email verification
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  console.log(email);
  if (!email || !otp) {
    return next(
      new AppError("Email and OTP are required for verification", 400)
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Invalid OTP", 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email has been verified. You can now log in.",
    data: {
      user,
    },
  });
});

// resend OTP
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Find the user by their email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Generate a new OTP
  const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
  // Update the user's OTP in the database
  user.otp = newOTP;
  await user.save({ validateBeforeSave: false });

  // Send the new OTP to the user's email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your New OTP for Email Verification",
      html: `Your new OTP for email verification: ${newOTP}`,
    });

    res.status(200).json({
      status: "success",
      message: "New OTP has been sent to your email. Check your inbox.",
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please Provide your email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res, "Login Successful");
});

// Forget Password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No User Found", 404));
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetToken = otp;
  user.resetTokenExpiration = Date.now() + 300000; // 5 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      from: "Homez",
      subject: "OTP for Email Verification",
      html: `
    <p>Hello,</p>
    <p>Thank you for registering with Homez. To complete your email verification, please use the following One-Time Password (OTP):</p>
    <p style="font-size: 24px; color: #007bff;"><strong>${otp}</strong></p>
    
    <p>This OTP is valid for the next 15 minutes. If you didn't request this verification, please ignore this email.</p>
    
    <p>Best regards,</p>
    <p>The WavLyric Team</p>
    
    <p style="font-style: italic; color: #888;">Note: This is an automated email. Please do not reply.</p>
  `,
    });

    res.status(200).json({
      status: "success",
      message: "Password Reset Otp is send to your email",
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;

  const user = await User.findOne({
    email,
    resetToken: otp,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("No User Found!", 400));
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();
  createSendToken(user, 200, res, "Password Reset Successful");
});

// change password for currently login user
exports.changePassword = catchAsync(async (req, res, next) => {
  const { email, currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Find the user by email
  const user = await User.findOne({ email }).select("+password");

  // Check if the user exists
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the current password matches the stored password
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Incorrect current password", 400));
  }

  // Check if the new password and confirm password match
  if (newPassword !== newPasswordConfirm) {
    return next(
      new AppError("New password and confirm password do not match", 400)
    );
  }

  // Update the user's password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // Generate a new JWT token
  createSendToken(user, 200, res, "Password changed successfully");
});

// Update Profile controller
exports.updateProfile = catchAsync(async (req, res, next) => {
  const reqUser = JSON.parse(req.body.user);
  // console.log(req.file);
  // Check if user exists
  const user = await User.findById(reqUser._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update user's name
  if (req.body.name) {
    user.name = req.body.name;
  }

  // Update user's profile picture
  if (req.file) {
    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    user.photo = fileUrl; // Assuming you save the profile picture to disk
  }

  // Save updated user data
  await user.save({ validateBeforeSave: false });

  // Send response
  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      console.log(err);
      if (err) {
        return res.status(200).send({
          message: "Auth failed",
          success: false,
        });
      } else {
        console.log(decode);

        const currentUser = await User.findOne({ email: decode.email });
        if (!currentUser) {
          return res.status(404).send({
            message: "User not found",
            success: false,
          });
        }

        // Check if the user is an admin
        if (currentUser.role !== "admin") {
          return res.status(403).send({
            message: "You do not have permission to access this resource",
            success: false,
          });
        }

        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Auth error`,
    });
  }
});
