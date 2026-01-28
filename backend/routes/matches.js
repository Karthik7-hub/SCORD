const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Match = require('../models/Match');

// GET all matches for logged in user
router.get('/', auth, async (req, res) => {
    try {
        // Sort by newest first
        const matches = await Match.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(matches);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST create a new match
router.post('/', auth, async (req, res) => {
    try {
        const newMatch = new Match({
            ...req.body,
            user: req.user.id // Attach user ID
        });
        const match = await newMatch.save();
        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PATCH update match (sync stats, balls, settings)
router.patch('/:id', auth, async (req, res) => {
    try {
        // Find match by Frontend ID (not Mongo _id) and User ID
        let match = await Match.findOneAndUpdate(
            { id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        res.json(match);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE match
router.delete('/:id', auth, async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id, user: req.user.id });
        res.json({ msg: 'Match Removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;