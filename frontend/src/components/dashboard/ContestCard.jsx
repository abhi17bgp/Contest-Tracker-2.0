import React from 'react';
import { Clock, Activity, ExternalLink } from 'lucide-react';

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

const getContestStatus = (startTime, durationInSeconds, currentTime) => {
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
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                border: 'border-emerald-200 dark:border-emerald-800/50',
                badge: 'bg-emerald-500',
                text: 'text-emerald-700 dark:text-emerald-300',
                accent: 'text-emerald-500 dark:text-emerald-400'
            };
        case 'Starting Soon':
            return {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                border: 'border-amber-200 dark:border-amber-800/50',
                badge: 'bg-amber-500',
                text: 'text-amber-700 dark:text-amber-300',
                accent: 'text-amber-500 dark:text-amber-400'
            };
        case 'Completed':
            return {
                bg: 'bg-gray-50 dark:bg-slate-800/50',
                border: 'border-gray-200 dark:border-slate-700',
                badge: 'bg-gray-400 dark:bg-slate-600',
                text: 'text-gray-500 dark:text-slate-400',
                accent: 'text-gray-400 dark:text-slate-500'
            };
        default:
            return {
                bg: 'bg-white dark:bg-slate-800',
                border: 'border-gray-200 dark:border-slate-700',
                badge: 'bg-blue-600 dark:bg-blue-500',
                text: 'text-gray-700 dark:text-slate-200',
                accent: 'text-blue-500 dark:text-blue-400'
            };
    }
};

const ContestCard = ({ contest, forceCompleted = false, currentTime, userLocale, userTimeZone }) => {
    const status = forceCompleted ? 'Completed' : getContestStatus(contest.startTime, contest.duration, currentTime);
    const styles = getStatusStyles(status);
    const isCompleted = status === 'Completed';

    return (
        <div
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

            <h3 className={`font-black text-lg sm:text-xl leading-tight mb-4 line-clamp-2 min-h-[3.5rem] ${isCompleted ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`} title={contest.name}>
                {contest.name}
            </h3>

            <div className="space-y-2 sm:space-y-3 mb-5">
                <div className="flex items-center text-xs sm:text-sm font-bold bg-black/5 dark:bg-white/5 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                    <Clock className={`w-4 h-4 mr-2 flex-shrink-0 ${styles.accent}`} />
                    <span className="text-gray-700 dark:text-slate-300 leading-snug">
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
                <div className="flex items-center text-xs sm:text-sm font-bold bg-black/5 dark:bg-white/5 p-2.5 sm:p-3 rounded-xl transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                    <Activity className={`w-4 h-4 mr-2 flex-shrink-0 text-indigo-500 dark:text-indigo-400`} />
                    <span className="text-gray-700 dark:text-slate-300">Duration: {formatDuration(contest.duration)}</span>
                </div>
            </div>

            <a
                href={isCompleted ? undefined : contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto block w-full text-center font-black py-3 sm:py-4 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl active:scale-95 ${isCompleted
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-gray-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white'
                    }`}
            >
                {!isCompleted && <ExternalLink className="w-4 h-4 mr-2" />}
                {isCompleted ? 'Contest Ended' : 'Join Contest'}
            </a>
        </div>
    );
};

export default ContestCard;
