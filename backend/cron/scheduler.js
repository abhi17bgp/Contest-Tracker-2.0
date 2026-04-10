const cron = require('node-cron');
const axios = require('axios');
const Contest = require('../models/Contest');
const User = require('../models/User');
const { sendContestReminderEmail } = require('../services/email');

const API_BASE = 'https://clist.by/api/v4';
const USERNAME = process.env.CLIST_USERNAME || 'abhi17'; // From the old implementation or env
const API_KEY = process.env.CLIST_API_KEY || '1efafc75818736bfddefe25a5fa4d609df51f3c2';

const PLATFORMS = {
    'codeforces.com': 'Codeforces',
    'codechef.com': 'CodeChef',
    'atcoder.jp': 'AtCoder',
    'leetcode.com': 'LeetCode',
    'geeksforgeeks.org': 'GeeksforGeeks'
};

// Use official platform logos for push notification icons
const getPlatformIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('codeforces'))    return 'https://codeforces.com/favicon-96x96.png';
    if (p.includes('codechef'))      return 'https://www.codechef.com/static/images/cc-logo.png';
    if (p.includes('leetcode'))      return 'https://leetcode.com/favicon-192x192.png';
    if (p.includes('atcoder'))       return 'https://atcoder.jp/assets/atcoder.png';
    if (p.includes('geeksforgeeks')) return 'https://www.geeksforgeeks.org/favicon.ico';
    return 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png'; // fallback trophy
};

const fetchAndSyncDailyContests = async () => {
    try {
        console.log('[CRON] Starting Daily Sync of Contests...');

        // 1. Wipe previous day contests from MongoDB
        await Contest.deleteMany({});
        console.log('[CRON] Wiped previous contests from database.');

        // 2. Fetch fresh contests starting today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOf14Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 23, 59, 59);

        const searchParams = new URLSearchParams({
            username: USERNAME,
            api_key: API_KEY,
            format: 'json',
            limit: '1000',
            start__gte: startOfDay.toISOString(),
            start__lte: endOf14Days.toISOString(),
            order_by: 'start'
        });

        const response = await axios.get(`${API_BASE}/contest/?${searchParams}`);
        const contestsData = response.data.objects;

        // Filter for supported platforms and exclude practice/training contests
        const EXCLUDED_KEYWORDS = ['training', 'practice', 'trial', 'testing', 'easy', 'all', 'daily training'];

        const filteredContests = contestsData.filter(contest => {
            const isSupportedPlatform = Object.keys(PLATFORMS).some(platform => contest.host.includes(platform));
            const eventName = contest.event.toLowerCase();
            const containsExcludedKeyword = EXCLUDED_KEYWORDS.some(keyword => eventName.includes(keyword));

            return isSupportedPlatform && !containsExcludedKeyword;
        });

        // 3. Deduplicate and Bulk insert into DB
        const contestMap = new Map();

        filteredContests.forEach(c => {
            const id = c.id.toString();
            if (!contestMap.has(id)) {
                contestMap.set(id, {
                    contestId: id,
                    name: c.event,
                    platform: Object.keys(PLATFORMS).find(p => c.host.includes(p)) || c.host,
                    startTime: c.start.endsWith('Z') ? c.start : `${c.start}Z`,
                    duration: c.duration,
                    url: c.href,
                    notified: false
                });
            }
        });

        const mappedContests = Array.from(contestMap.values());

        if (mappedContests.length > 0) {
            await Contest.insertMany(mappedContests, { ordered: false });
        }

        console.log(`[CRON] Inserted ${mappedContests.length} unique contests for the next 14 days.`);
    } catch (error) {
        console.error('[CRON] Error during daily sync:', error.response?.data || error.message);
    }
};

const checkAndSendReminders = async () => {
    try {
        console.log('[CRON] Checking for approaching contests...');
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Find contests starting between now and 1 hour from now that need either Email or Push
        const upcomingContests = await Contest.find({
            startTime: { $gte: now, $lte: oneHourFromNow },
            $or: [{ notified: false }, { pushNotified: false }, { finalPushNotified: false }]
        });

        if (upcomingContests.length === 0) {
            console.log('[CRON] No approaching contests needing notification.');
            return;
        }

        console.log(`[CRON] Processing ${upcomingContests.length} contests for notifications...`);

        // Initialize Web Push
        const webpush = require('web-push');
        webpush.setVapidDetails(
            'mailto:alert@smartpostai.online',
            process.env.VAPID_PUBLIC_KEY || 'BCy8Yy9wK4OwS9w_KDmqNfDjsLFQ2QwkER1kufsc-Sj5th4d3t2205YNuLxvghyLsrR3m8L7ikD4Mt60ApgBkT0',
            process.env.VAPID_PRIVATE_KEY || 'TgvUm2FokHjtsP0qwwm3H9OjlhSmEem7W2INSRi3RvQ'
        );

        // Find verified users
        const verifiedUsers = await User.find({ isVerified: true });

        if (verifiedUsers.length === 0) {
            console.log('[CRON] No verified users to notify, skipping emails.');
        } else {
            console.log(`[CRON] Preparing to send reminders to ${verifiedUsers.length} verified users.`);

            for (const contest of upcomingContests) {
                const startTimeMillis = new Date(contest.startTime).getTime();
                const timeDiffMins = (startTimeMillis - now.getTime()) / (1000 * 60);
                let changedStatus = false;

                // Send 1-Hour Email Event (strict window: 60–50 mins before start only)
                if (timeDiffMins <= 61 && timeDiffMins > 50 && !contest.notified) {
                    await sendContestReminderEmail(verifiedUsers, contest);
                    contest.notified = true;
                    changedStatus = true;
                    console.log(`[CRON] Sent 1-hour EMAIL alert for ${contest.name}`);
                }

                // Send 15-Minute Push Notification Event (Triggers between 7–16 mins)
                if (timeDiffMins <= 16 && timeDiffMins > 6 && !contest.pushNotified) {
                    for (const user of verifiedUsers) {
                        if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
                            const payload = JSON.stringify({
                                title: `🔥 15 MIN WARNING: ${contest.platform}!`,
                                body: `${contest.name} is starting in less than 15 minutes. Prepare your environment!`,
                                url: contest.url,
                                icon: getPlatformIcon(contest.platform)
                            });

                            for (const sub of user.pushSubscriptions) {
                                try {
                                    await webpush.sendNotification(sub, payload);
                                } catch (e) {
                                    // Subscription expired
                                }
                            }
                        }
                    }
                    contest.pushNotified = true;
                    changedStatus = true;
                    console.log(`[CRON] Sent 15-minute PUSH alert for ${contest.name}`);
                }

                // Send 5-Minute Final Push Notification Event (Triggers somewhere between 6 mins and 1 mins)
                if (timeDiffMins <= 6 && timeDiffMins > 0 && !contest.finalPushNotified) {
                    for (const user of verifiedUsers) {
                        if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
                            const payload = JSON.stringify({
                                title: `🚨 FINAL WARNING: ${contest.platform}!`,
                                body: `${contest.name} kicks off in 5 MINUTES! Take a deep breath, you've got this! 💪`,
                                url: contest.url,
                                icon: getPlatformIcon(contest.platform)
                            });

                            for (const sub of user.pushSubscriptions) {
                                try {
                                    await webpush.sendNotification(sub, payload);
                                } catch (e) {
                                    // Subscription expired
                                }
                            }
                        }
                    }
                    contest.finalPushNotified = true;
                    changedStatus = true;
                    console.log(`[CRON] Sent 5-minute FINAL PUSH alert for ${contest.name}`);
                }

                if (changedStatus) {
                    await contest.save();
                }
            }
        }
    } catch (error) {
        console.error('[CRON] Error checking reminders:', error.message);
    }
};

const initScheduler = () => {
    // Run Daily Sync at exactly midnight server time (00:00)
    cron.schedule('0 0 * * *', async () => {
        await fetchAndSyncDailyContests();
    });

    // Run Reminder checks every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        await checkAndSendReminders();
    });

    console.log('Cron scheduler initialized.');
};

module.exports = { initScheduler, fetchAndSyncDailyContests };
