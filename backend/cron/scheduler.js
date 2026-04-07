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

        // Find contests starting between now and 1 hour from now that haven't been notified
        const upcomingContests = await Contest.find({
            startTime: { $gte: now, $lte: oneHourFromNow },
            notified: false
        });

        if (upcomingContests.length === 0) {
            console.log('[CRON] No upcoming contests starting in the next hour.');
            return;
        }

        console.log(`[CRON] Found ${upcomingContests.length} contests starting soon.`);

        // Find verified users
        const verifiedUsers = await User.find({ isVerified: true });
        
        if (verifiedUsers.length === 0) {
             console.log('[CRON] No verified users to notify, skipping emails.');
        } else {
            console.log(`[CRON] Preparing to send reminders to ${verifiedUsers.length} verified users.`);
            
            for (const contest of upcomingContests) {
                // Send email
                await sendContestReminderEmail(verifiedUsers, contest);
                
                // Mark as notified
                contest.notified = true;
                await contest.save();
                console.log(`[CRON] Marked contest ${contest.name} as notified.`);
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
