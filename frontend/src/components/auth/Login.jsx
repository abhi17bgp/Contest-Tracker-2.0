import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trophy, LogIn, Code, Bell, LineChart, Loader2, Mail, CheckCircle2, Terminal, Laptop } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login, API_URL, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If already logged in (e.g. another tab logged in and BroadcastChannel updated state)
    if (user) return <Navigate to="/" replace />;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const payload = { ...formData, timezone: userTimeZone };
            const res = await axios.post(`${API_URL}/auth/login`, payload);
            login(res.data.user, res.data.token);
            toast.success('Successfully logged in');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Array of CP related icons to visually represent competitive programmers
    const cpIcons = [Terminal, Code, Laptop];

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
            {/* Mobile Top Banner — visible only on small screens */}
            <div className="lg:hidden bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-6 flex flex-col items-center text-center relative overflow-hidden">
                {/* ── Mobile Floating Animation ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
                    {[Terminal, Code].map((CpIcon, i) => (
                        <div 
                            key={i} 
                            className="absolute bottom-0 animate-float-up flex items-center drop-shadow-lg bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm"
                            style={{
                                left: `${15 + (i * 40)}%`,
                                animationDelay: `${i * 2}s`,
                                animationDuration: '12s'
                            }}
                        >
                            <Mail className="w-5 h-5 text-blue-200 opacity-90" />
                            <div className="mx-2 w-6 h-[2px] bg-gradient-to-r from-blue-400/50 to-blue-200/80 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full w-2 bg-white animate-pulse"></div>
                            </div>
                            <CpIcon className="w-5 h-5 text-indigo-200 opacity-90" />
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center mb-3">
                    <Trophy className="w-11 h-11 text-yellow-300 mr-2" />
                    <span className="text-xl font-extrabold tracking-tight">Contest Tracker</span>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed max-w-xs mb-3">
                    Track contests across Codeforces, LeetCode, CodeChef &amp; more — all in one place.
                </p>
                <div className="bg-blue-600/30 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-400/30 flex items-center">
                    <Bell className="w-3 h-3 mr-2 text-yellow-300 animate-pulse" />
                    Emails & Native Push Alerts
                </div>
            </div>

            {/* Left Side: About Website — Desktop only */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white flex-col justify-center items-center px-12 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-500 opacity-30 rounded-full blur-3xl pointer-events-none"></div>

                {/* ── Floating Animation: Sending Verified Emails to CP Programmers ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden object-cover opacity-60">
                    {[...Array(6)].map((_, i) => {
                        const CpIcon = cpIcons[i % cpIcons.length];
                        return (
                            <div 
                                key={i} 
                                className="absolute bottom-0 animate-float-up flex items-center drop-shadow-2xl bg-white/5 rounded-full px-4 py-2 border border-white/10 backdrop-blur-sm"
                                style={{
                                    left: `${15 + (i * 12)}%`,
                                    animationDelay: `${i * 2.2}s`,
                                    animationDuration: `${14 + (i % 3) * 3}s`
                                }}
                            >
                                {/* Verified Email */}
                                <div className="relative flex-shrink-0">
                                    <Mail className="w-8 h-8 text-blue-200 opacity-80" />
                                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full border border-blue-800">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                
                                {/* Animated sending line */}
                                <div className="mx-3 w-8 h-[2px] bg-gradient-to-r from-blue-400/30 to-blue-200/80 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full w-2 bg-white animate-pulse shadow-[0_0_8px_white]"></div>
                                </div>

                                {/* Competitive Programmer representation */}
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
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Contest Tracker</h1>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Master Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Coding Journey</span></h1>
                    <p className="text-lg text-blue-100 mb-10 leading-relaxed font-medium">
                        Contest Tracker is your ultimate companion to keep track of programming competitions across platforms. Never miss an important event again.
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
                                <h3 className="text-xl font-bold mb-2 text-white">Smart Push Alerts</h3>
                                <p className="text-blue-100/80 leading-relaxed text-sm">Never miss a challenge! Receive automated emails <span className="font-extrabold text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-md mx-0.5">1 hr before</span> and native desktop/mobile push popups <span className="font-extrabold text-red-300 bg-red-500/30 px-2 py-0.5 rounded-md mx-0.5">15 min & 5 min before</span> the contest starts.</p>
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

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-8 bg-gray-50 relative z-20">
                <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="hidden lg:flex justify-center items-center mb-8">
                        <Trophy className="w-16 h-16 text-blue-600 mr-3" />
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                    </div>
                    <h2 className="lg:hidden text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-6">Welcome Back</h2>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-gray-700 text-sm font-bold">Password</label>
                                <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">Forgot Password?</Link>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-2 font-medium">✨ At least 6 characters long</p>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center shadow-lg shadow-blue-600/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Log In
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-600">
                        <p>Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
