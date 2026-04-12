import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

const NotificationBanner = ({ user, isPushEnabled, handlePushToggle, isBrave, alertText }) => {
    if (!user?.isVerified) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-8 rounded-2xl shadow-sm flex items-start" role="alert">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl mr-4 flex-shrink-0">
                    <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 text-base sm:text-lg tracking-tight">Email Verification Required</h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm sm:text-base mt-1 leading-relaxed">
                        Please verify your email to activate <span className="font-extrabold text-amber-900 dark:text-amber-100 bg-amber-500/20 px-2 py-0.5 rounded-md mx-0.5">automated 1-hour contest reminders</span>. Check your inbox (or spam) for the verification link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 mb-8 rounded-2xl shadow-sm flex items-start" role="alert">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl mr-4 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-base sm:text-lg tracking-tight">Notifications Active</h3>
                <p className="text-emerald-700 dark:text-emerald-300 text-sm sm:text-base mt-1 leading-relaxed">
                    You are all set! You will receive automated emails <span className="font-extrabold text-emerald-900 dark:text-emerald-100 bg-emerald-500/20 px-2 py-0.5 rounded-md mx-0.5">1 hour before</span> any contest starts. Good luck with your coding!
                </p>
                <button
                    onClick={handlePushToggle}
                    className={`mt-4 px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm flex items-center text-white ${isPushEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                    <Bell className={`w-4 h-4 mr-2 ${!isPushEnabled && 'text-yellow-300 animate-pulse'}`} />
                    {isPushEnabled ? `Disable ${alertText}` : `Enable ${alertText}`}
                </button>
                {isBrave && !isPushEnabled && (
                    <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-2 flex items-start">
                        <span className="mr-1.5 text-base">🦁</span>
                        <span><strong>Brave User?</strong> Go to <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">brave://settings/privacy</code> → enable <strong>"Use Google services for push messaging"</strong> first.</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationBanner;
