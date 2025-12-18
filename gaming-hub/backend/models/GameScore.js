const mongoose = require('mongoose');

const GameScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameScore', GameScoreSchema);