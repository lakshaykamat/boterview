const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  error: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
