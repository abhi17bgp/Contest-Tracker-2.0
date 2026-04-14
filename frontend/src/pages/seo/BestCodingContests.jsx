import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { Trophy, Code2, Cpu, GraduationCap, CheckCircle } from 'lucide-react';

const BestCodingContests = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12 transition-colors duration-200">
            <Helmet>
                <title>Best Coding Contests & Platforms for Competitive Programming</title>
                <meta name="description" content="Discover the best coding platforms for competitive programming. Compare LeetCode, Codeforces, CodeChef and others to find the best fit for your skill level." />
            </Helmet>
            
            <Header />

            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
                <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100 dark:border-slate-700">
                    <header className="mb-10 text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex justify-center items-center gap-3">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                            Best Platforms for Coding Contests
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-slate-400">
                            A comprehensive guide to the top competitive programming website.
                        </p>
                    </header>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-slate-300">
                        <p>
                            Whether you're practicing for technical interviews, trying to improve your problem-solving skills, or aiming for global leaderboards, participating in coding contests is one of the best ways to grow as a software engineer. But with so many platforms available, which one should you choose?
                        </p>
                        
                        <div className="my-10 space-y-8">
                            {/* LeetCode */}
                            <section className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                                    <Code2 className="w-6 h-6 mr-2 text-yellow-500" />
                                    1. LeetCode
                                </h2>
                                <p className="mb-4 text-sm sm:text-base">
                                    <strong>Best for:</strong> Technical interview preparation and structured learning.
                                </p>
                                <p className="mb-4">
                                    LeetCode is arguably the most popular platform for preparing for FAANG interviews. They host weekly and biweekly contests that focus on practical algorithmic problems similar to what you'd see in real interviews.
                                </p>
                                <Link to="/leetcode-contests" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    View upcoming LeetCode contests &rarr;
                                </Link>
                            </section>

                            {/* Codeforces */}
                            <section className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                                    <Cpu className="w-6 h-6 mr-2 text-red-500" />
                                    2. Codeforces
                                </h2>
                                <p className="mb-4 text-sm sm:text-base">
                                    <strong>Best for:</strong> Hardcore competitive programmers and math-heavy algorithms.
                                </p>
                                <p className="mb-4">
                                    Codeforces is the premier destination for competitive programming purists. Supported by ITMO University, it features a robust rating system (from Newbie to Legendary Grandmaster) and highly challenging, original problems requiring strong mathematical and logical foundations.
                                </p>
                                <Link to="/codeforces-contests" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    View upcoming Codeforces contests &rarr;
                                </Link>
                            </section>

                            {/* CodeChef */}
                            <section className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                                    <GraduationCap className="w-6 h-6 mr-2 text-orange-500" />
                                    3. CodeChef
                                </h2>
                                <p className="mb-4 text-sm sm:text-base">
                                    <strong>Best for:</strong> Beginners growing into advanced competitors.
                                </p>
                                <p className="mb-4">
                                    CodeChef hosts regular "Starters" for beginners and previously hosted longer format challenges. It is very popular in India and provides a supportive environment for learning, with detailed editorials provided after each contest.
                                </p>
                                <Link to="/codechef-contests" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    View upcoming CodeChef contests &rarr;
                                </Link>
                            </section>
                        </div>

                        <h2>Conclusion</h2>
                        <p>
                            Choosing the right platform depends entirely on your goals. If you're job hunting, focus on LeetCode. If you want to become a world-class algorithm designer, Codeforces is your best bet!
                        </p>

                        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Never miss a contest!</h3>
                            <p className="mb-4">
                                Trying to keep track of schedules across multiple platforms can be overwhelming. Use our free tool to track all upcoming contests in one place and get automatic push notifications before they begin.
                            </p>
                            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
            
            <Footer />
        </div>
    );
};

export default BestCodingContests;
