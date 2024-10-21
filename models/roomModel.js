const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A room must have a title"],
  },
  rent: {
    type: Number,
    required: [true, "A room must have a rent price"],
  },
  facilities: {
    type: [String],
    required: [true, "A room must have at least one facility"],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "A room must have at least one facility",
    },
  },
  picture: {
    type: String,
    required: [true, "A room must have a picture"],
  },
  details: {
    type: String,
    required: [true, "A room must have a picture"],
  },
  location: {
    type: String,
    required: [true, "A room must have a picture"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
