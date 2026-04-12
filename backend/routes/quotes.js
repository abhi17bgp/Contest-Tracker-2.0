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

// Helper to get today's date string in IST (Indian Standard Time +05:30)
const getTodayString = () => {
    const today = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    return today.toISOString().split('T')[0];
};

// @route   GET /api/v1/quotes/daily
// @desc    Get the daily quote (consistent for the whole day)
// @access  Public
router.get('/daily', async (req, res) => {
    try {
        const today = getTodayString();

        // 1. Check if we already have a quote designated for today
        const todaysQuote = await Quote.findOne({ status: 'approved', featuredDate: today });
        if (todaysQuote) {
            return res.json(todaysQuote);
        }

        // 2. If no quote exists for today yet, we need to pick a random approved one
        // and assign it directly to today.
        const quotes = await Quote.aggregate([
            { $match: { status: 'approved' } },
            { $sample: { size: 1 } }
        ]);

        if (quotes && quotes.length > 0) {
            const selectedQuote = await Quote.findByIdAndUpdate(
                quotes[0]._id, 
                { featuredDate: today },
                { new: true }
            );
            return res.json(selectedQuote);
        }

        // 3. Fallback quote if DB has absolutely no approved quotes at all
        res.json({
            text: "Har wrong submission tumhe ek level upar le ja raha hai.",
            author: "Abhishek Anand"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error retrieving quote' });
    }
});

module.exports = router;
