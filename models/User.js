const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      required: false,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isAdmin: { type: Boolean, default: false },
    subjects: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one subject must be selected.",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastSent: {
      type: Date,
      default: null,
    },
    lastQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
