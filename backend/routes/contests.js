const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const { protect } = require('./auth');

// @route   GET /api/v1/contests
// @desc    Get all contests stored (next 14 days)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startTime: 1 });
        res.status(200).json(contests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching contests' });
    }
});

module.exports = router;
