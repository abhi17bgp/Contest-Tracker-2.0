import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../context/AuthContext';
import useContests from '../../hooks/useContests';
import ContestCard from '../../components/dashboard/ContestCard';
import Header from '../../components/Header';
import { Calendar, Activity, CheckCircle2 } from 'lucide-react';
import Footer from '../../components/Footer';

const PlatformContests = ({ platformKey, pageTitle, metaDescription, h1, subtitle }) => {
    const { API_URL } = useContext(AuthContext);
    const { allContests, activeContests, upcomingContests, endedContests, loading, error, currentTime, userTimeZone, userLocale } = useContests(API_URL);

    // Filter by platform
    const filterContests = (contests) => contests.filter(c => c.platform.toLowerCase().includes(platformKey.toLowerCase()));

    const active = filterContests(activeContests);
    const upcoming = filterContests(upcomingContests);
    const ended = filterContests(endedContests);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12 transition-colors duration-200">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
            </Helmet>
            
            <Header />

            <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        {h1}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-500 bg-red-50 rounded-lg">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Active Contests */}
                        {active.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
                                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                                        <Activity className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                                        Active {platformKey} Contests
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {active.map(c => <ContestCard key={c._id} contest={c} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Contests */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
                            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                                    <Calendar className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                                    Upcoming {platformKey} Contests
                                </h2>
                            </div>
                            <div className="p-4 sm:p-6">
                                {upcoming.length === 0 ? (
                                    <p className="text-gray-500 dark:text-slate-400 text-center py-8">No upcoming {platformKey} contests scheduled right now.</p>
                                ) : (
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {upcoming.map(c => <ContestCard key={c._id} contest={c} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ended Contests */}
                        {ended.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8 opacity-80">
                                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-3 text-gray-500" />
                                        Recently Ended {platformKey} Contests
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {ended.slice(0, 6).map(c => <ContestCard key={c._id} contest={c} forceCompleted={true} currentTime={currentTime} userLocale={userLocale} userTimeZone={userTimeZone} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default PlatformContests;
