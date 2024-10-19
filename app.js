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

const app = express();

app.use("/", express.static("uploads"));
// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from the same API
// const limiter = rateLimit({
//   validate: {
//     validationsConfig: false,
//     // ...
//     default: true,
//   },
//   // ...
//   max: 10000,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });
// app.use("/api", limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Serving static files
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

// app.all("/", (res, req) => {
//   res.send("Hello world");
// });

app.use(globalErrorHandler);

module.exports = app;
