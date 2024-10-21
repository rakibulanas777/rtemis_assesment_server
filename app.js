const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const userRouter = require("./routes/userRoutes");
const roomRouter = require("./routes/roomRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

// Add http and socket.io
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app); // Create server instance
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Attach the `io` instance to the request object in middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.set("io", io);
// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("register", (userId) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  socket.on("bookingStatusChanged", (data) => {
    console.log("Booking status update:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

app.use("/", express.static("uploads"));

// 1) GLOBAL MIDDLEWARES
app.use(cookieParser());
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/booking", bookingRouter);

app.all("*", (req, res, next) => {
  res.send("Hello world");
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Export the `server` instead of `app` so you can run the Socket.IO server
module.exports = server;
