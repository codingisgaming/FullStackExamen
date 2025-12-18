const express = require('express');
const router = express.Router();
const GameScore = require('../models/GameScore');
const auth = require('../middleware/auth');

// Submit game score
router.post('/score', auth, async (req, res) => {
    try {
        const { gameId, score, gameName } = req.body;

        // Best-effort de-duplication: prevent accidental double submits (e.g. React strict mode)
        // for the same user/game/score within a short window.
        const duplicateWindowMs = 5000;
        const since = new Date(Date.now() - duplicateWindowMs);
        const existing = await GameScore.findOne({
            userId: req.user.userId,
            gameId,
            score,
            playedAt: { $gte: since }
        });
        if (existing) {
            return res.json({
                message: 'Score already saved (duplicate ignored)',
                score: existing
            });
        }

        const gameScore = new GameScore({
            userId: req.user.userId,
            username: req.user.username,
            gameId,
            gameName,
            score
        });

        await gameScore.save();

        res.json({
            message: 'Score saved successfully',
            score: gameScore
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user game history
router.get('/user/:userId/history', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user is requesting their own history
        if (req.user.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const gameHistory = await GameScore.find({ userId })
            .sort({ playedAt: -1 })
            .limit(50);

        res.json({ data: gameHistory });
    } catch (error) {
        console.error('Error fetching game history:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a game score
router.delete('/score/:scoreId', auth, async (req, res) => {
    try {
        const { scoreId } = req.params;

        // Find the score and verify ownership
        const gameScore = await GameScore.findById(scoreId);

        if (!gameScore) {
            return res.status(404).json({ error: 'Score not found' });
        }

        if (gameScore.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await GameScore.findByIdAndDelete(scoreId);

        res.json({ message: 'Score deleted successfully' });
    } catch (error) {
        console.error('Error deleting score:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;