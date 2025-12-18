const express = require('express');
const router = express.Router();
const GameScore = require('../models/GameScore');
const auth = require('../middleware/auth');

// Get global leaderboard
router.get('/global', async (req, res) => {
    try {
        const leaderboard = await GameScore.aggregate([
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    totalScore: { $sum: '$score' },
                    gamesPlayed: { $sum: 1 },
                    averageScore: { $avg: '$score' }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: 1,
                    totalScore: 1,
                    gamesPlayed: 1,
                    averageScore: { $round: ['$averageScore', 2] }
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's position
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user's total score and rank
        const userScores = await GameScore.find({ userId });
        const totalScore = userScores.reduce((sum, game) => sum + game.score, 0);

        // Calculate global rank
        const allUsers = await GameScore.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalScore: { $sum: '$score' }
                }
            },
            { $sort: { totalScore: -1 } }
        ]);

        const userRank = allUsers.findIndex(user => user._id.toString() === userId) + 1;

        // Get game-specific scores
        const gameScores = await GameScore.find({ userId })
            .sort({ score: -1 })
            .select('gameId gameName score playedAt')
            .lean();

        res.json({
            userId,
            totalScore,
            globalRank: userRank,
            gamesPlayed: userScores.length,
            gameScores
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get game-specific leaderboard
router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const leaderboard = await GameScore.find({ gameId })
            .sort({ score: -1 })
            .limit(limit)
            .select('username score playedAt')
            .lean();

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;