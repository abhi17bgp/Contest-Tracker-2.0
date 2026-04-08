import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, ExternalLink, Activity, ChevronDown, CheckCircle2, Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from './Header';

const Dashboard = () => {
    const [activeContests, setActiveContests] = useState([]);     // Ongoing + Starting Soon + Upcoming-today
    const [upcomingContests, setUpcomingContests] = useState([]); // Future days
    const [endedContests, setEndedContests] = useState([]);       // Completed today
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEnded, setShowEnded] = useState(false);            // Collapsed by default
    const { API_URL, user } = useContext(AuthContext);

    // Track previous isVerified value to detect the false → true transition
    const prevIsVerifiedRef = useRef(null);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/contests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const now = new Date();
                const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

                const active = [];
                const upcoming = [];
                const ended = [];

                res.data.forEach(contest => {
                    const contestStart = new Date(contest.startTime);
                    const contestEnd = new Date(contestStart.getTime() + contest.duration * 1000);

                    if (contestStart >= startOfTomorrow) {
                        // Future days → Upcoming
                        upcoming.push(contest);
                    } else if (contestEnd < startOfToday) {
                        // Ended before today → Ignore (will be cleaned up by backend)
                    } else if (now > contestEnd) {
                        // Started today but already finished → Ended Today
                        ended.push(contest);
                    } else {
                        // Ongoing or not yet started today → Active Today
                        active.push(contest);
                    }
                });

                setActiveContests(active);
                setUpcomingContests(upcoming);
                setEndedContests(ended);
            } catch (err) {
                setError('Failed to fetch contests.');
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [API_URL]);

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
        const now = new Date();
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
                            {new Date(contest.startTime).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })} IST
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

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
                {!user?.isVerified ? (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-2xl shadow-sm flex items-start" role="alert">
                        <div className="bg-amber-100 p-2 rounded-xl mr-4 flex-shrink-0">
                            <Bell className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-base sm:text-lg tracking-tight">Email Verification Required</h3>
                            <p className="text-amber-700 text-sm sm:text-base mt-1 leading-relaxed">
                                Please verify your email to activate **automated 1-hour contest reminders**. Check your inbox (or spam) for the verification link.
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
                                You are all set! You will receive automated emails **1 hour before** any contest starts. Good luck with your coding!
                            </p>
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
                            {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
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
