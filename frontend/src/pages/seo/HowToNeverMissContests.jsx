import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { BellRing, Mail, Smartphone, CalendarDays } from 'lucide-react';

const HowToNeverMissContests = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12 transition-colors duration-200">
            <Helmet>
                <title>How to Never Miss a Coding Contest Again | Free Tools & Guide</title>
                <meta name="description" content="Tired of missing LeetCode, Codeforces, and CodeChef contests? Learn how to automate your contest tracking and set up push notifications right to your devices." />
            </Helmet>

            <Header />

            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
                <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100 dark:border-slate-700">
                    <header className="mb-10 text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex justify-center items-center gap-3">
                            <BellRing className="w-10 h-10 text-indigo-500" />
                            How To Never Miss A Coding Contest
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-slate-400">
                            Stop checking multiple websites manually and start automating your reminders.
                        </p>
                    </header>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-slate-300">
                        <p>
                            We've all been there. You plan to participate in a Codeforces Div 2 round or a LeetCode weekly challenge, but you get busy with work, study, or life. Next thing you know, you check the site and the contest ended an hour ago.
                        </p>
                        <p>
                            Missing contests hinders your rating growth and slows your competitive programming journey. Here is exactly how you can ensure you never miss a contest again.
                        </p>

                        <div className="my-10 space-y-6">
                            {/* Step 1 */}
                            <div className="flex bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="mr-6 flex-shrink-0">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">1</div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <CalendarDays className="w-5 h-5 mr-2 text-indigo-500" />
                                        Use a Unified Dashboard
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                                        Instead of navigating to 5 different websites to check their independent schedules, use a centralized dashboard. A unified tracker consolidates APIs from LeetCode, Codeforces, CodeChef, and more into a single calendar view.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="mr-6 flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">2</div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Mail className="w-5 h-5 mr-2 text-blue-500" />
                                        Set Up Email Alerts
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                                        Configuring email alerts gives you an advanced warning. Setting an alert for exactly one hour before a contest starts gives you enough time to wrap up your current task, grab a coffee, and get your IDE ready.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="mr-6 flex-shrink-0">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl">3</div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Smartphone className="w-5 h-5 mr-2 text-emerald-500" />
                                        Enable Push Notifications
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                                        Emails can get buried. For the final warning, browser-based push notifications are essential. Getting a loud "ping" on your desktop or phone 15 minutes before exactly ensures you log into the platform in time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl mt-12 shadow-inner">
                            <h2 className="text-2xl font-bold mb-4 text-white">Let Us Do The Work For You</h2>
                            <p className="mb-6 text-blue-100">
                                We built Contest Tracker to solve exactly this problem. By creating a free account, you instantly get access to our unified contest dashboard, automated 1-hour email alerts, and optional push notifications right to your devices.
                            </p>
                            <Link to="/register" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                                Create Free Account Now
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default HowToNeverMissContests;
