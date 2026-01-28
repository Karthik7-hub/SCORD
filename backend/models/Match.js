const mongoose = require('mongoose');

const BallSchema = new mongoose.Schema({
    id: Number,
    runs: Number,
    type: String, // LEGAL, WD, NB
    isWicket: Boolean
});

const MatchSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: Number, required: true }, // Frontend ID (timestamp)
    t1: { type: String, required: true },
    t2: { type: String, required: true },
    ov: { type: Number, default: 10 },
    wkts: { type: Number, default: 10 },
    extraVal: { type: Number, default: 1 },

    // --- NEW FIELD ---
    tossResult: { type: String, default: "" },
    // -----------------

    activeInn: { type: Number, default: 1 },
    battingTeam: String,
    bowlingTeam: String,
    inn1: [BallSchema],
    inn2: [BallSchema],
    isDone: { type: Boolean, default: false },
    result: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);