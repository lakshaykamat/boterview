const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Optional: Add a compound index if you often query by subject + difficulty
// QuestionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
