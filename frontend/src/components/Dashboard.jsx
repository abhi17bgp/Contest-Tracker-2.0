import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, ExternalLink, Activity, ChevronDown, CheckCircle2, Bell, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from './Header';

const Dashboard = () => {
    const [allContests, setAllContests] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEnded, setShowEnded] = useState(false);            // Collapsed by default
    const { API_URL, user } = useContext(AuthContext);
    
    // Auto-detect user's local timezone (fallback to UTC if browser blocks it)
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const userLocale = navigator.language || undefined;

    // Track previous isVerified value to detect the false → true transition
    const prevIsVerifiedRef = useRef(user?.isVerified);
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    const promptShownRef = useRef(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && user?.isVerified) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsPushEnabled(true);
                    } else if (
                        !promptShownRef.current &&
                        Notification.permission === 'default'
                    ) {
                        // Auto-show our custom prompt 3s after login if never asked before
                        promptShownRef.current = true;
                        setTimeout(() => setShowPushPrompt(true), 3000);
                    }
                });
            });
        }
    }, [user?.isVerified]);

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

    // ── Show toast when email gets verified (cross-tab or same-tab) ────────
    useEffect(() => {
        if (loading || user === null) return;

        // Only fire when isVerified transitions from false → true,
        // NOT on initial mount when user may already be verified.
        if (prevIsVerifiedRef.current === false && user.isVerified === true) {
            toast.success(
                '🎉 Email verified! You will now receive automated contest reminders 1 hour before they start.',
                { autoClose: 6000 }
            );
        }
        prevIsVerifiedRef.current = user.isVerified;
    }, [user?.isVerified, loading, user]);

    const publicVapidKey = 'BCy8Yy9wK4OwS9w_KDmqNfDjsLFQ2QwkER1kufsc-Sj5th4d3t2205YNuLxvghyLsrR3m8L7ikD4Mt60ApgBkT0';

    // The Web Push API requires the VAPID key as a Uint8Array, not a raw string
    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
    };

    const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const isBrave = typeof navigator.brave !== 'undefined';
    const alertText = isMobile ? 'Mobile Alerts' : 'Desktop Alerts';

    const handlePushToggle = async () => {
        if (!('serviceWorker' in navigator)) return toast.error('Browser unsupported');

        try {
            const registration = await navigator.serviceWorker.ready;
            
            if (isPushEnabled) {
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    const token = localStorage.getItem('token');
                    await axios.post(`${API_URL}/auth/push-unsubscribe`, { endpoint: subscription.endpoint }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(console.error);
                }
                setIsPushEnabled(false);
                toast.info(`${alertText} disabled.`);
            } else {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return toast.error('Permission denied. Please enable notifications in browser settings.');

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/auth/push-subscribe`, { subscription }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setIsPushEnabled(true);
                toast.success(`Secure ${alertText.toLowerCase()} enabled!`);
            }
        } catch (err) {
            console.error(err);
            const isBraveBlocked = err.message?.includes('push service error') || err.name === 'AbortError';
            if (isBraveBlocked && isBrave) {
                toast.error(
                    '🦁 Brave Browser Detected! Go to brave://settings/privacy → Enable "Use Google services for push messaging".',
                    { autoClose: 10000 }
                );
            } else {
                toast.error('Failed to enable alerts. Check that notifications are allowed in your browser settings.');
            }
        }
    };


    const getPlatformColor = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('codeforces')) return 'bg-red-500';
        if (p.includes('codechef')) return 'bg-orange-500';
        if (p.includes('atcoder')) return 'bg-gray-800';
        if (p.includes('leetcode')) return 'bg-yellow-500';
        if (p.includes('geeksforgeeks')) return 'bg-green-600';
        return 'bg-blue-500';
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getContestStatus = (startTime, durationInSeconds) => {
        const now = new Date(currentTime);
        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationInSeconds * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        if (now > end) return 'Completed';
        if (now >= start && now <= end) return 'Ongoing';
        if (now < start && start <= oneHourFromNow) return 'Starting Soon';
        return 'Upcoming';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Ongoing':
                return {
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    badge: 'bg-emerald-500',
                    text: 'text-emerald-700',
                    accent: 'text-emerald-500'
                };
            case 'Starting Soon':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    badge: 'bg-amber-500',
                    text: 'text-amber-700',
                    accent: 'text-amber-500'
                };
            case 'Completed':
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    badge: 'bg-gray-400',
                    text: 'text-gray-500',
                    accent: 'text-gray-400'
                };
            default:
                return {
                    bg: 'bg-white',
                    border: 'border-gray-200',
                    badge: 'bg-blue-600',
                    text: 'text-gray-700',
                    accent: 'text-blue-500'
                };
        }
    };

    const renderContestCard = (contest, forceCompleted = false) => {
        const status = forceCompleted ? 'Completed' : getContestStatus(contest.startTime, contest.duration);
        const styles = getStatusStyles(status);
        const isCompleted = status === 'Completed';

        return (
            <div
                key={contest._id}
                className={`relative flex flex-col p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 group hover:shadow-2xl ${styles.bg} ${styles.border} ${isCompleted ? 'opacity-70 grayscale-[0.3]' : 'hover:scale-[1.02]'}`}
            >
                {/* Status Badge */}
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-white shadow-lg shadow-black/10 flex items-center z-10">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Ongoing' ? 'bg-white animate-pulse' : 'bg-white/50'}`}></span>
                    <span className={`${styles.badge} px-2 py-0.5 rounded-full`}>{status}</span>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white rounded-lg shadow-sm ${getPlatformColor(contest.platform)}`}>
                        {contest.platform}
                    </span>
                </div>

                <h3 className={`font-black text-lg sm:text-xl leading-tight mb-4 line-clamp-2 min-h-[3.5rem] ${isCompleted ? 'text-gray-400' : 'text-gray-900'}`} title={contest.name}>
                    {contest.name}
                </h3>

                <div className="space-y-2 sm:space-y-3 mb-5">
                    <div className="flex items-center text-xs sm:text-sm font-bold bg-black/5 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-black/10">
                        <Clock className={`w-4 h-4 mr-2 flex-shrink-0 ${styles.accent}`} />
                        <span className="text-gray-700 leading-snug">
                            {new Date(contest.startTime).toLocaleString(userLocale, {
                                timeZone: userTimeZone,
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZoneName: 'short'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm font-bold bg-black/5 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-black/10">
                        <Activity className={`w-4 h-4 mr-2 flex-shrink-0 text-indigo-500`} />
                        <span className="text-gray-700">Duration: {formatDuration(contest.duration)}</span>
                    </div>
                </div>

                <a
                    href={isCompleted ? undefined : contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto block w-full text-center font-black py-3 sm:py-4 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-black/5 hover:shadow-xl active:scale-95 ${isCompleted
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 hover:bg-blue-600 text-white'
                        }`}
                >
                    {!isCompleted && <ExternalLink className="w-4 h-4 mr-2" />}
                    {isCompleted ? 'Contest Ended' : 'Join Contest'}
                </a>
            </div>
        );
    };

    const PROGRAMMING_QUOTES = [
        { text: "Code yaad mat karo, logic samjho.", author: "Abhishek Anand" },
        { text: "Har problem ek story hai, bas uska flow pakdo.", author: "Abhishek Anand" },
        { text: "DP tough nahi, thinking missing hai.", author: "Abhishek Anand" },
        { text: "Interview mein syntax nahi, approach select hoti hai.", author: "Abhishek Anand" },
        { text: "Problem ko feel karo, solution khud aayega.", author: "Abhishek Anand" },
        { text: "Brute force shuruaat hai, final answer nahi.", author: "Abhishek Anand" },
        { text: "Questions solve mat karo, patterns dhoondo.", author: "Abhishek Anand" },
        { text: "Confusion clarity ki pehli seedhi hai.", author: "Abhishek Anand" },
        { text: "Agar explain nahi kar pa rahe, toh samjhe nahi ho.", author: "Abhishek Anand" },
        { text: "Story → State → Transition = DP solved.", author: "Abhishek Anand" },
        { text: "Har wrong submission tumhe ek level upar le ja raha hai.", author: "Abhishek Anand" },
        { text: "Rating slow badh rahi hai? Matlab foundation strong ho raha hai.", author: "Abhishek Anand" },
        { text: "Consistency > Talent — roz thoda karo, lekin rukna mat.", author: "Abhishek Anand" },
        { text: "Hard problems tumhe todne nahi, banaane aati hain.", author: "Abhishek Anand" },
        { text: "Ek din tum wahi problem solve karoge jo aaj impossible lag rahi hai — bas lage raho 💯", author: "Abhishek Anand" }
    ];

    const todayQuote = PROGRAMMING_QUOTES[new Date().getDate() % PROGRAMMING_QUOTES.length];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            {/* ── Push Notification Prompt Modal ── */}
            {showPushPrompt && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-[slide-up_0.3s_ease]">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 text-white">
                            <div className="flex items-center mb-1">
                                <Bell className="w-6 h-6 mr-2 text-yellow-300 animate-pulse" />
                                <h3 className="text-lg font-extrabold tracking-tight">Never Miss a Contest!</h3>
                            </div>
                            <p className="text-blue-100 text-sm">Enable instant alerts sent directly to your screen.</p>
                        </div>
                        {/* Body */}
                        <div className="px-6 py-5">
                            <div className="space-y-3 mb-5">
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="text-xl mr-3">📧</span>
                                    <span>Email reminder <strong>1 hour before</strong> the contest</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="text-xl mr-3">🔥</span>
                                    <span>Push popup <strong>15 minutes before</strong> the contest</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="text-xl mr-3">🚨</span>
                                    <span>Final alert <strong>5 minutes before</strong> it starts</span>
                                </div>
                            </div>
                            {isBrave && (
                                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-start">
                                    <span className="mr-1.5">🦁</span>
                                    <span><strong>Brave user?</strong> Enable <code className="bg-amber-100 px-1 rounded">Use Google services for push messaging</code> in <code className="bg-amber-100 px-1 rounded">brave://settings/privacy</code> first.</span>
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        setShowPushPrompt(false);
                                        await handlePushToggle();
                                    }}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center"
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Yes, Enable Alerts!
                                </button>
                                <button
                                    onClick={() => setShowPushPrompt(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all active:scale-95"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
                {/* ── Daily Motivation Quote ── */}
                <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl shadow-lg border border-indigo-500/20 mb-6 p-5 sm:p-6 flex items-center justify-between relative overflow-hidden group">
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                    <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                    
                    <div className="flex items-start sm:items-center relative z-10 w-full">
                        <div className="bg-white/10 p-3 rounded-xl mr-4 sm:mr-5 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-300 mb-1 block opacity-80">Quote of the Day</span>
                            <p className="text-white font-medium italic text-sm sm:text-lg leading-relaxed drop-shadow-md">
                                "{todayQuote.text}"
                            </p>
                            <p className="text-indigo-200 text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider">
                                — {todayQuote.author}
                            </p>
                        </div>
                    </div>
                </div>
                {!user?.isVerified ? (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-2xl shadow-sm flex items-start" role="alert">
                        <div className="bg-amber-100 p-2 rounded-xl mr-4 flex-shrink-0">
                            <Bell className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-base sm:text-lg tracking-tight">Email Verification Required</h3>
                            <p className="text-amber-700 text-sm sm:text-base mt-1 leading-relaxed">
                                Please verify your email to activate <span className="font-extrabold text-amber-900 bg-amber-500/20 px-2 py-0.5 rounded-md mx-0.5">automated 1-hour contest reminders</span>. Check your inbox (or spam) for the verification link.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-8 rounded-2xl shadow-sm flex items-start" role="alert">
                        <div className="bg-emerald-100 p-2 rounded-xl mr-4 flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-900 text-base sm:text-lg tracking-tight">Notifications Active</h3>
                            <p className="text-emerald-700 text-sm sm:text-base mt-1 leading-relaxed">
                                You are all set! You will receive automated emails <span className="font-extrabold text-emerald-900 bg-emerald-500/20 px-2 py-0.5 rounded-md mx-0.5">1 hour before</span> any contest starts. Good luck with your coding!
                            </p>
                            <button
                                onClick={handlePushToggle}
                                className={`mt-4 px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm flex items-center text-white ${isPushEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                <Bell className={`w-4 h-4 mr-2 ${!isPushEnabled && 'text-yellow-300 animate-pulse'}`} />
                                {isPushEnabled ? `Disable ${alertText}` : `Enable ${alertText}`}
                            </button>
                            {isBrave && !isPushEnabled && (
                                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start">
                                    <span className="mr-1.5 text-base">🦁</span>
                                    <span><strong>Brave User?</strong> Go to <code className="bg-amber-100 px-1 rounded">brave://settings/privacy</code> → enable <strong>"Use Google services for push messaging"</strong> first.</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Today's Active Contests ── */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-5 sm:mb-6">
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                            Today's Contests
                        </h2>
                        <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                            {new Date().toLocaleDateString(userLocale, { timeZone: userTimeZone, month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="p-3 sm:p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-16 sm:py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 text-red-500 bg-red-50 rounded-lg">
                                <p>{error}</p>
                            </div>
                        ) : activeContests.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <div className="text-gray-400 mb-4 flex justify-center"><Calendar className="w-14 h-14 opacity-50" /></div>
                                <h3 className="text-lg font-medium text-gray-900">No Active Contests Right Now</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm px-4">
                                    {endedContests.length > 0
                                        ? "All of today's contests have ended. Check upcoming contests below!"
                                        : "There are no programming contests scheduled for today. Enjoy your break!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {activeContests.map(c => renderContestCard(c))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Ended Today (collapsible) ── */}
                {!loading && !error && endedContests.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5 sm:mb-6">
                        {/* Toggle Header */}
                        <button
                            onClick={() => setShowEnded(!showEnded)}
                            className="w-full p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center text-base sm:text-lg font-semibold text-gray-500">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                                Ended Today
                                <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {endedContests.length}
                                </span>
                            </span>
                            <span className="flex items-center text-xs text-gray-400 font-medium">
                                {showEnded ? 'Hide' : 'Show'}
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showEnded ? 'rotate-180' : ''}`} />
                            </span>
                        </button>

                        {/* Collapsible Content */}
                        {showEnded && (
                            <div className="px-3 sm:px-6 pb-3 sm:pb-6 border-t border-gray-100 pt-4">
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {endedContests.map(c => renderContestCard(c, true))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Upcoming (Future days) ── */}
                {!loading && !error && upcomingContests.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" />
                                Upcoming Contests
                            </h2>
                            <span className="bg-indigo-100 text-indigo-700 font-medium px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                                Next 14 days
                            </span>
                        </div>
                        <div className="p-3 sm:p-6">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingContests.map(c => renderContestCard(c))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
