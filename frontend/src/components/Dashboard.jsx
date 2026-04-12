import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CheckCircle2, Activity, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from './Header';

// Custom Hooks & Components
import useContests from '../hooks/useContests';
import ContestCard from './dashboard/ContestCard';
import QuoteCard from './dashboard/QuoteCard';
import NotificationBanner from './dashboard/NotificationBanner';
import PushPromptModal from './dashboard/PushPromptModal';

const Dashboard = () => {
    const { API_URL, user } = useContext(AuthContext);
    
    // Extracted Contests Logic
    const {
        allContests, activeContests, upcomingContests, endedContests,
        loading, error, currentTime, userTimeZone, userLocale
    } = useContests(API_URL);

    const [showEnded, setShowEnded] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    
    const prevIsVerifiedRef = useRef(user?.isVerified);
    const promptShownRef = useRef(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && user?.isVerified) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsPushEnabled(true);
                    } else if (!promptShownRef.current && Notification.permission === 'default') {
                        promptShownRef.current = true;
                        setTimeout(() => {
                            if (Notification.permission === 'default') {
                                setShowPushPrompt(true);
                            }
                        }, 3000);
                    }
                });
            });
        }
    }, [user?.isVerified]);

    useEffect(() => {
        if (loading || user === null) return;
        if (prevIsVerifiedRef.current === false && user.isVerified === true) {
            toast.success(
                '🎉 Email verified! You will now receive automated contest reminders 1 hour before they start.',
                { autoClose: 6000 }
            );
        }
        prevIsVerifiedRef.current = user.isVerified;
    }, [user?.isVerified, loading, user]);

    const publicVapidKey = 'BCy8Yy9wK4OwS9w_KDmqNfDjsLFQ2QwkER1kufsc-Sj5th4d3t2205YNuLxvghyLsrR3m8L7ikD4Mt60ApgBkT0';

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
        setShowPushPrompt(false);

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
                if (Notification.permission === 'denied') {
                    toast.error(
                        '🚫 Notifications are blocked. To fix: click the 🔒 lock icon in Chrome\'s address bar → "Site settings" → "Notifications" → set to "Allow", then try again.',
                        { autoClose: 12000 }
                    );
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error(
                        '🔔 Permission not granted. Click the 🔒 lock in the address bar → "Site settings" → "Notifications" → "Allow".',
                        { autoClose: 10000 }
                    );
                    return;
                }
                const toastId = toast.loading(`Finalizing ${alertText.toLowerCase()}, please wait...`);

                try {
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                    });

                    const token = localStorage.getItem('token');
                    await axios.post(`${API_URL}/auth/push-subscribe`, { 
                        subscription: subscription.toJSON() 
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setIsPushEnabled(true);
                    toast.update(toastId, { render: `Secure ${alertText.toLowerCase()} enabled!`, type: "success", isLoading: false, autoClose: 5000 });
                } catch (subErr) {
                    console.error('Push subscription failed:', subErr);
                    let errMsg = 'Failed to complete subscription. ';
                    if (subErr.message?.includes('registration')) {
                        errMsg += 'Service Worker registration lost. Try refreshing the page.';
                    } else if (subErr.response?.status === 401) {
                        errMsg += 'Session expired. Please log in again.';
                    } else {
                        errMsg += 'Please check your connection and try again.';
                    }
                    toast.update(toastId, { render: errMsg, type: "error", isLoading: false, autoClose: 8000 });
                }
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12 transition-colors duration-200">
            <Header />

            <PushPromptModal 
                showPushPrompt={showPushPrompt} 
                setShowPushPrompt={setShowPushPrompt} 
                isBrave={isBrave} 
                handlePushToggle={handlePushToggle} 
            />

            <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
                <QuoteCard />

                <NotificationBanner 
                    user={user} 
                    isPushEnabled={isPushEnabled} 
                    handlePushToggle={handlePushToggle} 
                    isBrave={isBrave} 
                    alertText={alertText} 
                />

                {/* Today's Active Contests */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-5 sm:mb-6">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            Today's Contests
                        </h2>
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-medium px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
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
                            <div className="text-center py-16 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                <div className="text-gray-400 mb-4 flex justify-center"><Calendar className="w-14 h-14 opacity-50" /></div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Active Contests Right Now</h3>
                                <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mt-2 text-sm px-4">
                                    {endedContests.length > 0
                                        ? "All of today's contests have ended. Check upcoming contests below!"
                                        : "There are no programming contests scheduled for today. Enjoy your break!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {activeContests.map(c => <ContestCard key={c._id} contest={c} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ended Today (collapsible) */}
                {!loading && !error && endedContests.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-5 sm:mb-6">
                        <button
                            onClick={() => setShowEnded(!showEnded)}
                            className="w-full p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <span className="flex items-center text-base sm:text-lg font-semibold text-gray-500 dark:text-slate-400">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                                Ended Today
                                <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {endedContests.length}
                                </span>
                            </span>
                            <span className="flex items-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                                {showEnded ? 'Hide' : 'Show'}
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showEnded ? 'rotate-180' : ''}`} />
                            </span>
                        </button>

                        {showEnded && (
                            <div className="px-3 sm:px-6 pb-3 sm:pb-6 border-t border-gray-100 dark:border-slate-700 pt-4">
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {endedContests.map(c => <ContestCard key={c._id} contest={c} forceCompleted={true} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Upcoming (Future days) */}
                {!loading && !error && upcomingContests.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                Upcoming Contests
                            </h2>
                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                                Next 14 days
                            </span>
                        </div>
                        <div className="p-3 sm:p-6">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingContests.map(c => <ContestCard key={c._id} contest={c} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
