const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Simple string identifier for local storage/mock user
  templeId: { type: String, required: true },
  puzzleCompleted: { type: Boolean, default: false },
  completedCardIds: { type: [Number], default: [] },
  isFullyUnlocked: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserProgress', userProgressSchema);