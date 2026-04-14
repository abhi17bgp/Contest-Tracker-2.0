const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail, sendContestReminderEmail } = require('../services/email');
const Contest = require('../models/Contest');

// Middleware to authenticate JWT
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

// @route   POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, timezone, country } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            timezone: timezone || 'UTC',
            country: country || 'Unknown'
        });

        await sendVerificationEmail(user.name, user.email, verificationToken);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/v1/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // ── Catch-up notification: send alerts if a contest is in a live window right now ──
        // Fire-and-forget so verification response is never delayed
        (async () => {
            try {
                const now = new Date();
                const oneHourFromNow = new Date(now.getTime() + 61 * 60 * 1000);

                const nearContests = await Contest.find({
                    startTime: { $gte: now, $lte: oneHourFromNow }
                });

                if (nearContests.length === 0) return;

                const webpush = require('web-push');
                webpush.setVapidDetails(
                    'mailto:alert@smartpostai.online',
                    process.env.VAPID_PUBLIC_KEY,
                    process.env.VAPID_PRIVATE_KEY
                );

                const getPlatformIcon = (platform) => {
                    const p = platform.toLowerCase();
                    if (p.includes('codeforces'))    return 'https://codeforces.com/favicon-96x96.png';
                    if (p.includes('codechef'))      return 'https://www.codechef.com/static/images/cc-logo.png';
                    if (p.includes('leetcode'))      return 'https://leetcode.com/favicon-192x192.png';
                    if (p.includes('atcoder'))       return 'https://atcoder.jp/assets/atcoder.png';
                    if (p.includes('geeksforgeeks')) return 'https://www.geeksforgeeks.org/favicon.ico';
                    return 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png';
                };

                for (const contest of nearContests) {
                    const minsLeft = (new Date(contest.startTime) - now) / 60000;

                    // Email window: 50–61 mins before (same rule as cron)
                    if (minsLeft <= 61 && minsLeft > 50) {
                        await sendContestReminderEmail([user], contest);
                        console.log(`[VERIFY] Sent catch-up EMAIL to ${user.email} for ${contest.name}`);
                    }

                    // Push windows: send if user has subscriptions
                    if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
                        let pushPayload = null;

                        if (minsLeft <= 16 && minsLeft > 6) {
                            pushPayload = JSON.stringify({
                                title: `🔥 15 MIN WARNING: ${contest.platform}!`,
                                body: `${contest.name} is starting in less than 15 minutes. Prepare your environment!`,
                                url: contest.url,
                                icon: getPlatformIcon(contest.platform)
                            });
                        } else if (minsLeft <= 6 && minsLeft > 0) {
                            pushPayload = JSON.stringify({
                                title: `🚨 FINAL WARNING: ${contest.platform}!`,
                                body: `${contest.name} kicks off in 5 MINUTES! Take a deep breath, you've got this! 💪`,
                                url: contest.url,
                                icon: getPlatformIcon(contest.platform)
                            });
                        }

                        if (pushPayload) {
                            let validSubs = [];
                            for (const sub of user.pushSubscriptions) {
                                try {
                                    await webpush.sendNotification(sub, pushPayload);
                                    validSubs.push(sub);
                                } catch (e) {
                                    if (e.statusCode === 410 || e.statusCode === 404) {
                                        console.log(`[VERIFY] Removed expired push subscription for ${user.email}`);
                                    } else {
                                        validSubs.push(sub);
                                    }
                                }
                            }
                            if (validSubs.length !== user.pushSubscriptions.length) {
                                user.pushSubscriptions = validSubs;
                                await user.save();
                            }
                            console.log(`[VERIFY] Sent catch-up PUSH to ${user.email} for ${contest.name}`);
                        }
                    }
                }
            } catch (e) {
                console.error('[VERIFY] Catch-up notification error:', e.message);
            }
        })();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, timezone, country } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // if (!user.isVerified) {
        //   return res.status(401).json({ message: 'Please verify your email before logging in.' });
        // }

        // Silently update user's timezone if it has changed/was provided
        if (timezone && user.timezone !== timezone) {
            user.timezone = timezone;
            await user.save();
        }

        // Silently update user's country if it has changed/was provided
        if (country && user.country !== country) {
            user.country = country;
            await user.save();
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });

        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, isVerified: user.isVerified, timezone: user.timezone } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        await sendPasswordResetEmail(user.name, user.email, resetToken);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/v1/auth/delete-account
router.delete('/delete-account', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/v1/auth/me
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/v1/auth/profile
// @desc    Update user profile (name and bio)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, bio } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, email: user.email, bio: user.bio, isVerified: user.isVerified } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/v1/auth/push-subscribe
// @desc    Save a web push subscription to user profile
// @access  Private
router.post('/push-subscribe', protect, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription) {
            return res.status(400).json({ message: 'Subscription required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if subscription already exists to avoid duplicates
        const subExists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!subExists) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(200).json({ success: true, message: 'Subscription saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error parsing subscription' });
    }
});

// @route   POST /api/v1/auth/push-unsubscribe
// @desc    Remove a web push subscription
// @access  Private
router.post('/push-unsubscribe', protect, async (req, res) => {
    try {
        const { endpoint } = req.body;
        const user = await User.findById(req.user.id);
        if (user) {
            user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
            await user.save();
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error parsing unsubscribe' });
    }
});

module.exports = { authRouter: router, protect };
