import React from 'react';
import { Bell } from 'lucide-react';

const PushPromptModal = ({ showPushPrompt, setShowPushPrompt, isBrave, handlePushToggle }) => {
    if (!showPushPrompt) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPushPrompt(false)}
        >
            <div
                className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden
                           translate-y-0 animate-[slideUp_0.35s_cubic-bezier(0.32,0.72,0,1)]"
                onClick={e => e.stopPropagation()}
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
            >
                {/* Mobile drag handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Bell className="w-6 h-6 text-yellow-300 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold tracking-tight leading-tight">Never Miss a Contest!</h3>
                            <p className="text-blue-100 text-xs mt-0.5">Instant alerts sent directly to your screen</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 pt-5 pb-4">
                    {/* Alert tiers */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                            <span className="text-2xl block mb-1">📧</span>
                            <p className="text-[11px] font-bold text-blue-800 leading-tight">Email</p>
                            <p className="text-[10px] text-blue-600 mt-0.5">1 hr before</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                            <span className="text-2xl block mb-1">🔥</span>
                            <p className="text-[11px] font-bold text-amber-800 leading-tight">Push Alert</p>
                            <p className="text-[10px] text-amber-600 mt-0.5">15 min before</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                            <span className="text-2xl block mb-1">🚨</span>
                            <p className="text-[11px] font-bold text-red-800 leading-tight">Final Alert</p>
                            <p className="text-[10px] text-red-600 mt-0.5">5 min before</p>
                        </div>
                    </div>

                    {/* Brave warning */}
                    {isBrave && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">🦁</span>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Brave Browser:</strong> Go to <code className="bg-amber-100 px-1 rounded">brave://settings/privacy</code> → enable <strong>"Use Google services for push messaging"</strong> first.
                            </p>
                        </div>
                    )}

                    {/* Note about 2-step flow */}
                    <p className="text-[11px] text-gray-400 text-center mb-4">
                        Clicking "Enable" will show a browser permission prompt — tap <strong>Allow</strong> there too.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={async () => {
                                setShowPushPrompt(false);
                                await handlePushToggle();
                            }}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-4 sm:py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center text-base sm:text-sm"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Enable Alerts!
                        </button>
                        <button
                            onClick={() => setShowPushPrompt(false)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-bold py-4 sm:py-3 rounded-xl transition-all text-base sm:text-sm"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushPromptModal;
