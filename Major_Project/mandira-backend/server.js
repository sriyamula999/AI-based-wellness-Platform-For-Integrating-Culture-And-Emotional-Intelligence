const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Temple = require('./models/Temple');
const UserProgress = require('./models/UserProgress');
const templesData = require('./data/templesData.json');
const mandiraRoutes = require('./routes/mandiraRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/mandira', mandiraRoutes);

// ==========================================
// 1. POST: Save Flashcard Progress when completed
// ==========================================
app.post('/api/mandira/progress', async (req, res) => {
  try {
    const { userId, templeId, cardId } = req.body;

    const temple = await Temple.findOne({ templeId });
    if (!temple) return res.status(404).json({ error: "Temple not found" });

    // Find or create progress document for this user & temple
    let progress = await UserProgress.findOne({ userId, templeId });
    if (!progress) {
      progress = new UserProgress({ userId, templeId, completedCardIds: [] });
    }

    // Push cardId if it hasn't been added yet
    if (!progress.completedCardIds.includes(cardId)) {
      progress.completedCardIds.push(cardId);
    }

    // Check if all cards for this temple are now completed
    const isFullyUnlocked = progress.completedCardIds.length >= temple.totalCards;
    progress.isFullyUnlocked = isFullyUnlocked;

    await progress.save();

    res.json({
      success: true,
      completedCount: progress.completedCardIds.length,
      isFullyUnlocked
    });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// 2. GET: Fetch Profile Stats (Cards & Temples)
// ==========================================
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progressRecords = await UserProgress.find({ userId });
    const temples = await Temple.find({}, 'templeId totalCards');

    let completedTemplesCount = 0;
    const uniqueCardSet = new Set();
    const totalCards = temples.reduce((count, temple) => count + (temple.totalCards || 0), 0);

    progressRecords.forEach(record => {
      if (record.isFullyUnlocked) {
        completedTemplesCount += 1;
      }
      if (record.completedCardIds && Array.isArray(record.completedCardIds)) {
        record.completedCardIds.forEach(id => {
          uniqueCardSet.add(`${record.templeId}_${id}`);
        });
      }
    });

    res.json({
      completedTemplesCount,
      totalTemplesCount: temples.length,
      totalCardsCollected: uniqueCardSet.size,
      totalCards
    });
  } catch (err) {
    console.error("Error fetching profile stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    
    // Auto-seed database if empty
    const count = await Temple.countDocuments();
    if (count === 0) {
      await Temple.insertMany(templesData.map((temple, index) => ({ ...temple, sequence: index + 1 })));
      console.log('Database seeded with Mandira temple dataset.');
    }

    await Promise.all(templesData.map((temple, index) => (
      Temple.updateOne({ templeId: temple.templeId }, { $set: { sequence: index + 1 } }).exec()
    )));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Database connection error:', err));