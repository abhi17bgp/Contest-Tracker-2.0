import { useState, useEffect } from 'react';
import axios from 'axios';

const useContests = (API_URL) => {
    const [allContests, setAllContests] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auto-detect user's local timezone (fallback to UTC if browser blocks it)
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const userLocale = navigator.language || undefined;

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/contests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAllContests(res.data);
            } catch (err) {
                setError('Failed to fetch contests.');
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [API_URL]);

    // Timer to re-evaluate contests every 60 seconds locally
    useEffect(() => {
        let lastFetchDateStr = new Date().toDateString();

        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.getTime());

            // If it's 1 minute past midnight (to ensure backend cron finished wiping/fetching)
            // and we haven't fetched the new day's schedule yet
            if (now.getHours() === 0 && now.getMinutes() >= 1 && now.toDateString() !== lastFetchDateStr) {
                lastFetchDateStr = now.toDateString();
                
                const token = localStorage.getItem('token');
                if (token) {
                    axios.get(`${API_URL}/contests`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => {
                        if (res.data && res.data.length > 0) {
                            setAllContests(res.data);
                        }
                    }).catch(() => {}); // silent fail, will retry next mount
                }
            }
        }, 60000);
        
        return () => clearInterval(timer);
    }, [API_URL]);

    // Derived states
    const activeContests = [];
    const upcomingContests = [];
    const endedContests = [];

    const nowTime = new Date(currentTime);
    const startOfTomorrow = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate() + 1, 0, 0, 0);
    const startOfToday = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 0, 0, 0);

    allContests.forEach(contest => {
        const contestStart = new Date(contest.startTime);
        const contestEnd = new Date(contestStart.getTime() + contest.duration * 1000);

        if (contestStart >= startOfTomorrow) {
            upcomingContests.push(contest);
        } else if (contestEnd >= startOfToday) {
            if (nowTime > contestEnd) {
                endedContests.push(contest);
            } else {
                activeContests.push(contest);
            }
        }
    });

    return {
        allContests,
        activeContests,
        upcomingContests,
        endedContests,
        loading,
        error,
        currentTime,
        userTimeZone,
        userLocale
    };
};

export default useContests;
