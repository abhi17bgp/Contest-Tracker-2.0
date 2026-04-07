import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, ExternalLink, Activity } from 'lucide-react';
import Header from './Header';

const Dashboard = () => {
    const [todayContests, setTodayContests] = useState([]);
    const [upcomingContests, setUpcomingContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { API_URL, user } = useContext(AuthContext);

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
                
                const today = [];
                const upcoming = [];
                
                res.data.forEach(contest => {
                    const contestDate = new Date(contest.startTime);
                    if (contestDate < startOfTomorrow) {
                        today.push(contest);
                    } else {
                        upcoming.push(contest);
                    }
                });
                
                setTodayContests(today);
                setUpcomingContests(upcoming);
            } catch (err) {
                setError('Failed to fetch contests.');
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [API_URL]);

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

    const renderContestCard = (contest) => {
        const status = getContestStatus(contest.startTime, contest.duration);
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
                    className={`mt-auto block w-full text-center font-black py-3 sm:py-4 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-black/5 hover:shadow-xl active:scale-95 ${
                        isCompleted 
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
                {!user?.isVerified && (
                     <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 sm:p-4 mb-5 sm:mb-8 rounded shadow-sm" role="alert">
                        <p className="font-bold text-sm sm:text-base">Email Unverified</p>
                        <p className="text-sm leading-snug mt-1">Verify your email to receive automated 5-minute contest reminders. Check your inbox (or spam) for the link.</p>
                     </div>
                )}

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-5 sm:mb-8">
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
                        ) : todayContests.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <div className="text-gray-400 mb-4 flex justify-center"><Calendar className="w-14 h-14 opacity-50" /></div>
                                <h3 className="text-lg font-medium text-gray-900">No Contests Today</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm px-4">There are no programming contests scheduled for today. Enjoy your break!</p>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {todayContests.map(renderContestCard)}
                            </div>
                        )}
                    </div>
                </div>

                {!loading && !error && upcomingContests.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" />
                                Upcoming Contests
                            </h2>
                        </div>
                        <div className="p-3 sm:p-6">
                            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {upcomingContests.map(renderContestCard)}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
