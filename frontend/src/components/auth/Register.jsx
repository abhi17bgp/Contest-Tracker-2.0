import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trophy, UserPlus, Code, Bell, LineChart, Loader2, Mail, CheckCircle2, Terminal, Laptop } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { API_URL, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If already logged in
    if (user) return <Navigate to="/" replace />;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setIsLoading(true);
        try {
            let country = 'Unknown';
            try {
                const ipRes = await axios.get('https://ipapi.co/json/');
                if (ipRes.data && ipRes.data.country_name) {
                    country = ipRes.data.country_name;
                }
            } catch (err) {
                // Silently ignore IP lookup failures
            }

            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            await axios.post(`${API_URL}/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                timezone: userTimeZone,
                country
            });
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const cpIcons = [Terminal, Code, Laptop];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 flex-col lg:flex-row">
            {/* Mobile Top Banner — visible only on small screens */}
            <div className="lg:hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white px-5 pt-7 pb-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    {[Terminal, Code].map((CpIcon, i) => (
                        <div
                            key={i}
                            className="absolute bottom-0 flex flex-col items-center justify-end"
                            style={{
                                left: `${15 + (i * 40)}%`,
                                animation: `floatUp 12s ease-in-out infinite`,
                                animationDelay: `${i * 2}s`
                            }}
                        >
                            <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                                <Mail className="w-5 h-5 text-blue-200" />
                                <div className="mx-2 w-6 h-[2px] bg-white/50 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-2 bg-white animate-pulse" />
                                </div>
                                <CpIcon className="w-5 h-5 text-indigo-200" />
                            </div>
                        </div>
                    ))}
                    <style>{`
                        @keyframes floatUp {
                            0% { transform: translateY(100%) scale(0.9); opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { transform: translateY(-100vh) scale(1.1); opacity: 0; }
                        }
                    `}</style>
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center mb-2">
                    <Trophy className="w-10 h-10 text-yellow-300 mr-2 drop-shadow-lg" />
                    <span className="text-2xl font-extrabold tracking-tight">Contest Tracker</span>
                </div>
                <p className="relative z-10 text-blue-100 text-sm leading-relaxed max-w-xs mb-5">
                    One place to track all coding contests. We'll make sure you never forget to join one! 🏆
                </p>

                {/* Feature Cards */}
                <div className="relative z-10 w-full max-w-sm space-y-3">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center text-left backdrop-blur-sm">
                        <span className="text-2xl mr-3 flex-shrink-0">🗓️</span>
                        <div>
                            <p className="font-bold text-sm text-white">All Contests, One Screen</p>
                            <p className="text-blue-200 text-xs leading-snug mt-0.5">Codeforces, LeetCode, CodeChef, AtCoder & more — sorted by time, no searching needed.</p>
                        </div>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center text-left backdrop-blur-sm">
                        <span className="text-2xl mr-3 flex-shrink-0">📧</span>
                        <div>
                            <p className="font-bold text-sm text-white">Email Reminder</p>
                            <p className="text-blue-200 text-xs leading-snug mt-0.5">We send you an email <strong className="text-yellow-300">1 hour before</strong> the contest so you can prepare — just like a calendar reminder.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Side: About Website — Desktop only */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white flex-col justify-center items-center px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-500 opacity-30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="absolute inset-0 pointer-events-none overflow-hidden object-cover opacity-60">
                    {[...Array(6)].map((_, i) => {
                        const CpIcon = cpIcons[i % cpIcons.length];
                        return (
                            <div
                                key={i}
                                className="absolute bottom-0 flex items-center drop-shadow-2xl bg-white/5 rounded-full px-4 py-2 border border-white/10 backdrop-blur-sm"
                                style={{
                                    left: `${15 + (i * 12)}%`,
                                    animation: `floatUp ${14 + (i % 3) * 3}s ease-in-out infinite`,
                                    animationDelay: `${i * 2.2}s`,
                                }}
                            >
                                <div className="relative flex-shrink-0">
                                    <Mail className="w-8 h-8 text-blue-200 opacity-80" />
                                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full border border-blue-800">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div className="mx-3 w-8 h-[2px] bg-gradient-to-r from-blue-400/30 to-blue-200/80 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full w-2 bg-white animate-pulse shadow-[0_0_8px_white]"></div>
                                </div>
                                <div className="flex-shrink-0 relative">
                                    <CpIcon className="w-8 h-8 text-indigo-300 opacity-90" />
                                    <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-900 border border-blue-500 p-0.5">
                                        <Code className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center ">
                        <Trophy className="w-20 h-20 text-blue-300 mb-6 mr-2 drop-shadow-lg" />
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Join The Community</h1>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Master Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Coding Journey</span></h1>
                    <p className="text-lg text-blue-100 mb-10 leading-relaxed font-medium">
                        Create an account to stay ahead of the competition. Tracking your contests has never been this beautiful or reliable.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start group">
                            <div className="bg-blue-600/40 p-4 rounded-xl mr-5 backdrop-blur-sm border border-blue-500/30 group-hover:bg-blue-500/50 transition-colors">
                                <Code className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Multiple Platforms</h3>
                                <p className="text-blue-100/80 leading-relaxed">Track Codeforces, LeetCode, CodeChef, and GeeksforGeeks all in one unified, beautiful dashboard.</p>
                            </div>
                        </div>
                        <div className="flex items-start group">
                            <div className="bg-blue-600/40 p-4 rounded-xl mr-5 backdrop-blur-sm border border-blue-500/30 group-hover:bg-blue-500/50 transition-colors">
                                <Bell className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Reminders on Your Screen 🔔</h3>
                                <p className="text-blue-100/80 leading-relaxed text-sm">We remind you like a friend would — an <span className="font-extrabold text-yellow-300">email 1 hour before</span>, and a popup on your screen <span className="font-extrabold text-orange-300">15 minutes</span> and <span className="font-extrabold text-red-300">5 minutes</span> before the contest starts. No app download needed.</p>
                            </div>
                        </div>
                        <div className="flex items-start group">
                            <div className="bg-blue-600/40 p-4 rounded-xl mr-5 backdrop-blur-sm border border-blue-500/30 group-hover:bg-blue-500/50 transition-colors">
                                <LineChart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Unified Dashboard</h3>
                                <p className="text-blue-100/80 leading-relaxed">View all major competitive programming contests in one place, sorted by time and filtered by platform for your convenience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-8 bg-gray-50 dark:bg-slate-900 relative z-20 transition-colors duration-200">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                    {/* Add loading spinner overlay for mobile responsiveness / loading state */}
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300">
                            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white pb-2">Creating Account...</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400 text-center px-4">Setting up your unified dashboard</p>
                        </div>
                    )}

                    <div className="hidden lg:flex justify-center items-center mb-8">
                        <Trophy className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-3" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Create Account</h2>
                    </div>
                    <h2 className="lg:hidden text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight text-center mb-6 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                        Join Now
                    </h2>

                    <form onSubmit={onSubmit} className="space-y-4 relative">
                        <div>
                            <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-700 text-gray-900 dark:text-slate-100"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-700 text-gray-900 dark:text-slate-100"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold">Password</label>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1.5 font-medium"> At least 6 characters long</p>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-700 text-gray-900 dark:text-slate-100"
                                placeholder="Create a password"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-700 text-gray-900 dark:text-slate-100"
                                placeholder="Confirm your password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center shadow-lg shadow-blue-600/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Register
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center text-gray-600 dark:text-slate-400">
                        <p>Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors ml-1">Log in here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
