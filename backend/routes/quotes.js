const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const { protect } = require('./auth');

// @route   POST /api/v1/quotes
// @desc    Submit a new quote
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { text, author } = req.body;
        
        if (!text || !author) {
            return res.status(400).json({ message: 'Text and author are required' });
        }

        const quote = await Quote.create({
            text,
            author,
            submittedBy: req.user.id,
            status: 'pending'
        });

        res.status(201).json({ success: true, message: 'Quote submitted and waiting for approval.', quote });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving quote' });
    }
});

// @route   GET /api/v1/quotes/daily
// @desc    Get the daily quote (randomly selected from approved quotes)
// @access  Public
router.get('/daily', async (req, res) => {
    try {
        // Aggregate to get a random approved quote
        const quotes = await Quote.aggregate([
            { $match: { status: 'approved' } },
            { $sample: { size: 1 } }
        ]);

        if (quotes && quotes.length > 0) {
            res.json(quotes[0]);
        } else {
            // Fallback quote if DB has nothing
            res.json({
                text: "Har wrong submission tumhe ek level upar le ja raha hai.",
                author: "Abhishek Anand"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error retrieving quote' });
    }
});

module.exports = router;
