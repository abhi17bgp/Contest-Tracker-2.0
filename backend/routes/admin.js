const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Quote = require('../models/Quote');
const { fetchAndSyncDailyContests } = require('../cron/scheduler');

// ── Admin JWT Middleware ──────────────────────────────────────────────────────
const adminProtect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_secret_fallback');
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
        req.adminUser = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired admin token' });
    }
};

// ── POST /api/v1/admin/login ──────────────────────────────────────────────────
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== validUser || password !== validPass) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
        { role: 'admin', username },
        process.env.ADMIN_JWT_SECRET || 'admin_secret_fallback',
        { expiresIn: '24h' }
    );
    res.json({ success: true, token });
});

// ── Users ─────────────────────────────────────────────────────────────────────

// GET all users
router.get('/users', adminProtect, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH update user (name, isVerified)
router.patch('/users/:id', adminProtect, async (req, res) => {
    try {
        const { isVerified, name } = req.body;
        const update = {};
        if (typeof isVerified === 'boolean') update.isVerified = isVerified;
        if (name) update.name = name;

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE user
router.delete('/users/:id', adminProtect, async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Contests ──────────────────────────────────────────────────────────────────

// GET all contests
router.get('/contests', adminProtect, async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startTime: 1 });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST add contest manually
router.post('/contests', adminProtect, async (req, res) => {
    try {
        const { name, platform, startTime, duration, url } = req.body;
        const contestId = `manual_${Date.now()}`;
        const contest = await Contest.create({ contestId, name, platform, startTime, duration: Number(duration), url });
        res.status(201).json(contest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating contest' });
    }
});

// PUT update contest
router.put('/contests/:id', adminProtect, async (req, res) => {
    try {
        const { name, platform, startTime, duration, url, notified, pushNotified, finalPushNotified } = req.body;
        const update = { name, platform, startTime, url };
        if (duration !== undefined) update.duration = Number(duration);
        if (typeof notified === 'boolean') update.notified = notified;
        if (typeof pushNotified === 'boolean') update.pushNotified = pushNotified;
        if (typeof finalPushNotified === 'boolean') update.finalPushNotified = finalPushNotified;

        const contest = await Contest.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE contest
router.delete('/contests/:id', adminProtect, async (req, res) => {
    try {
        const deleted = await Contest.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Contest not found' });
        res.json({ success: true, message: 'Contest deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── POST /api/v1/admin/sync — manual contest fetch ───────────────────────────
router.post('/sync', adminProtect, async (req, res) => {
    try {
        await fetchAndSyncDailyContests();
        res.json({ success: true, message: 'Contests synced from CLIST API successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Sync failed: ' + err.message });
    }
});

// ── Quotes ────────────────────────────────────────────────────────────────────

// GET all quotes
router.get('/quotes', adminProtect, async (req, res) => {
    try {
        const quotes = await Quote.find().populate('submittedBy', 'name email').sort({ createdAt: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching quotes' });
    }
});

// PUT update quote (approve, reject, edit)
router.put('/quotes/:id', adminProtect, async (req, res) => {
    try {
        const { text, author, status } = req.body;
        const update = {};
        if (text) update.text = text;
        if (author) update.author = author;
        if (status) update.status = status;

        const quote = await Quote.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!quote) return res.status(404).json({ message: 'Quote not found' });
        res.json(quote);
    } catch (err) {
        res.status(500).json({ message: 'Server error updating quote' });
    }
});

// DELETE quote
router.delete('/quotes/:id', adminProtect, async (req, res) => {
    try {
        const deleted = await Quote.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Quote not found' });
        res.json({ success: true, message: 'Quote deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting quote' });
    }
});

module.exports = router;
