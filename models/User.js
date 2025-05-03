const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subjects: [String], // e.g., ['JavaScript', 'CSS']
  active: { type: Boolean, default: true },
  lastSent: { type: Date, default: null } // For tracking
});

module.exports = mongoose.model('User', UserSchema);
