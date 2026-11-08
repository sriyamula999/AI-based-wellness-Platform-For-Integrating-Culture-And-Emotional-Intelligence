const UserProgress = require('./models/UserProgress'); // Adjust path as needed

// GET user overall heritage progress stats
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all progress documents for this user
    const progressRecords = await UserProgress.find({ userId });

    let completedTemplesCount = 0;
    let totalCardsCollected = 0;

    progressRecords.forEach(record => {
      if (record.isFullyUnlocked) {
        completedTemplesCount += 1;
      }
      // Count unique completed card IDs accumulated across records
      if (record.completedCardIds && Array.isArray(record.completedCardIds)) {
        totalCardsCollected += record.completedCardIds.length;
      }
    });

    res.json({
      completedTemplesCount,
      totalCardsCollected
    });
  } catch (err) {
    console.error("Error fetching user profile stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});