const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  id: Number,
  order: Number,
  category: String,
  title: String,
  content: String
});

const templeSchema = new mongoose.Schema({
  templeId: { type: String, required: true, unique: true },
  sequence: { type: Number, required: true, default: 1 },
  name: { type: String, required: true },
  location: String,
  masterImageUrl: String,
  totalCards: Number,
  flashcards: [flashcardSchema],
  unknownSecret: String
});

module.exports = mongoose.model('Temple', templeSchema);