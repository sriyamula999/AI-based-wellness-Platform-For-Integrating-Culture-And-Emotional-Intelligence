const express = require('express');
const router = express.Router();
const Temple = require('../models/Temple');
const UserProgress = require('../models/UserProgress');

// 1. Get all temples list
router.get('/temples', async (req, res) => {
  try {
    const userId = req.query.userId || 'local_user_1';
    const temples = await Temple.find({}, 'templeId name location masterImageUrl totalCards sequence').sort({ sequence: 1 });
    const progressRecords = await UserProgress.find({ userId });
    const progressByTemple = new Map(progressRecords.map(record => [record.templeId, record]));

    let previousCompleted = true;
    res.json(temples.map((temple) => {
      const progress = progressByTemple.get(temple.templeId);
      const puzzleCompleted = Boolean(progress?.puzzleCompleted);
      const isFullyUnlocked = Boolean(progress?.isFullyUnlocked);
      const unlocked = previousCompleted;
      previousCompleted = unlocked && puzzleCompleted && isFullyUnlocked;

      return {
        ...temple.toObject(),
        puzzleCompleted,
        isFullyUnlocked,
        unlocked,
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get flashcards for a specific temple
router.get('/:templeId/flashcards', async (req, res) => {
  try {
    const userId = req.query.userId || 'local_user_1';
    const progress = await UserProgress.findOne({ userId, templeId: req.params.templeId });
    if (!progress?.puzzleCompleted) {
      return res.status(403).json({ error: 'Complete this temple puzzle before opening its flashcards.' });
    }

    const temple = await Temple.findOne({ templeId: req.params.templeId });
    if (!temple) return res.status(404).json({ error: 'Temple not found' });
    res.json(temple.flashcards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark the Ayurveda image puzzle complete before allowing flashcard access.
router.post('/:templeId/puzzle-complete', async (req, res) => {
  const { userId = 'local_user_1' } = req.body;
  try {
    const temples = await Temple.find({}).sort({ sequence: 1 });
    const templeIndex = temples.findIndex(temple => temple.templeId === req.params.templeId);
    if (templeIndex === -1) return res.status(404).json({ error: 'Temple not found' });

    if (templeIndex > 0) {
      const previousProgress = await UserProgress.findOne({
        userId,
        templeId: temples[templeIndex - 1].templeId,
        isFullyUnlocked: true
      });
      if (!previousProgress) {
        return res.status(403).json({ error: 'Complete the previous temple before starting this puzzle.' });
      }
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId, templeId: req.params.templeId },
      { $set: { puzzleCompleted: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, puzzleCompleted: progress.puzzleCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Post user progress (track completed card)
router.post('/progress', async (req, res) => {
  const { userId, templeId, cardId } = req.body;
  try {
    const temple = await Temple.findOne({ templeId });
    if (!temple) return res.status(404).json({ error: 'Temple not found' });

    const existingProgress = await UserProgress.findOne({ userId, templeId });
    if (!existingProgress?.puzzleCompleted) {
      return res.status(403).json({ error: 'Complete the temple puzzle before recording flashcards.' });
    }

    let progress = existingProgress;
    if (!progress) {
      progress = new UserProgress({ userId, templeId, completedCardIds: [] });
    }

    if (!progress.completedCardIds.includes(cardId)) {
      progress.completedCardIds.push(cardId);
    }

    // Check if all cards are completed
    if (progress.completedCardIds.length >= temple.totalCards) {
      progress.isFullyUnlocked = true;
    }

    await progress.save();
    res.json({
      success: true,
      completedCount: progress.completedCardIds.length,
      totalCards: temple.totalCards,
      isFullyUnlocked: progress.isFullyUnlocked
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get reward & grand secret if completed
router.get('/:templeId/reward/:userId', async (req, res) => {
  const { templeId, userId } = req.params;
  try {
    const progress = await UserProgress.findOne({ userId, templeId });
    if (!progress || !progress.isFullyUnlocked) {
      return res.status(403).json({ error: 'Complete all flashcards to unlock the secret.' });
    }

    const temple = await Temple.findOne({ templeId });
    res.json({
      masterImageUrl: temple.masterImageUrl,
      unknownSecret: temple.unknownSecret
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;