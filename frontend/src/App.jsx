import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const VerifyEmail = React.lazy(() => import('./components/auth/VerifyEmail'));
const ForgotPassword = React.lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));

// SEO Pages
const LeetCodeContests = React.lazy(() => import('./pages/seo/LeetCodeContests'));
const CodeforcesContests = React.lazy(() => import('./pages/seo/CodeforcesContests'));
const CodechefContests = React.lazy(() => import('./pages/seo/CodechefContests'));
const BestCodingContests = React.lazy(() => import('./pages/seo/BestCodingContests'));
const HowToNeverMissContests = React.lazy(() => import('./pages/seo/HowToNeverMissContests'));

const SplashScreen = () => {
    const platforms = ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'GeeksforGeeks'];
    const features = [
        { icon: '📧', text: 'Email alerts 1h before' },
        { icon: '🔥', text: 'Push alerts 15m before' },
        { icon: '🚨', text: 'Final alert 5m before' },
        { icon: '📅', text: '14-day calendar' },
    ];

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden z-[9999]"
            style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)',
                fontFamily: "'Segoe UI', sans-serif"
            }}>
            <style>{`
                @keyframes floatUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulseLogo { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
                @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
                @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
                @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }
                @keyframes progressFill { from{width:0%} to{width:100%} }
                @keyframes featurePop {
                    from { opacity:0; transform:scale(0.8) translateY(10px) }
                    to   { opacity:1; transform:scale(1) translateY(0) }
                }
            `}</style>

            {/* Background floating orbs */}
            <div style={{ position: 'absolute', width: '32vw', height: '32vw', minWidth: '250px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(60px)', top: '10%', left: '10%', animation: 'orb1 6s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: '25vw', height: '25vw', minWidth: '200px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(50px)', bottom: '15%', right: '10%', animation: 'orb2 8s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: '18vw', height: '18vw', minWidth: '150px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', filter: 'blur(40px)', bottom: '30%', left: '20%', animation: 'orb3 7s ease-in-out infinite' }} />

            {/* Logo */}
            <div style={{ animation: 'floatUp 0.6s ease-out both' }} className="text-center mb-5 z-10 w-full px-4">
                <div style={{
                    width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px', boxShadow: '0 20px 50px rgba(79,70,229,0.4)',
                    animation: 'pulseLogo 2.5s ease-in-out infinite',
                }}>🏆</div>
                <h1 style={{
                    fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 900, margin: 0,
                    background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 50%, #fff 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s linear infinite',
                    letterSpacing: '-0.5px',
                }}>Contest Tracker</h1>
                <p className="text-indigo-200/80 mt-2 text-sm xs:text-base tracking-wide z-10 relative">
                    Never miss a coding contest again
                </p>
            </div>

            {/* Platform badges (Responsive wrap) */}
            <div style={{ animation: 'floatUp 0.6s 0.15s ease-out both' }} className="flex flex-wrap justify-center gap-2 w-full max-w-sm px-4 mb-8 z-10">
                {platforms.map((p, i) => (
                    <span key={p} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-indigo-100 text-[11px] sm:text-xs font-semibold backdrop-blur-sm shadow-sm transition-all whitespace-nowrap inline-block">
                        {p}
                    </span>
                ))}
            </div>

            {/* Feature pills (Responsive grid) */}
            <div
                style={{ animation: 'floatUp 0.6s 0.3s ease-out both' }}
                className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-10 w-[90vw] max-w-sm sm:max-w-md z-10 px-2"
            >
                {features.map(({ icon, text }, i) => (
                    <div key={i}
                        style={{
                            animation: `featurePop 0.5s ${0.4 + i * 0.1}s ease-out both`,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        className="rounded-2xl p-3 sm:p-4 flex items-center justify-center min-[400px]:justify-start gap-3 backdrop-blur-sm transform transition-transform"
                    >
                        <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
                        <span className="text-slate-300 text-xs sm:text-sm font-semibold leading-tight">{text}</span>
                    </div>
                ))}
            </div>

            {/* Progress bar + text */}
            <div style={{ animation: 'floatUp 0.6s 0.5s ease-out both' }} className="w-[80vw] max-w-xs text-center z-10">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg, #6366f1, #a78bfa, #6366f1)',
                        backgroundSize: '200% auto',
                        animation: 'progressFill 2s ease-in-out infinite, shimmer 2s linear infinite',
                    }} className="w-[100%]" />
                </div>
                <p className="text-slate-400 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-bold">
                    Loading your contests…
                </p>
            </div>
        </div>
    );
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) return <SplashScreen />;
    return user ? children : <Navigate to="/login" />;
};

import { ThemeProvider, ThemeContext } from './context/ThemeContext';

function AppContent() {
    const { theme } = React.useContext(ThemeContext);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-200">
                <React.Suspense fallback={<SplashScreen />}>
                    <Routes>
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/leetcode-contests" element={<LeetCodeContests />} />
                        <Route path="/codeforces-contests" element={<CodeforcesContests />} />
                        <Route path="/codechef-contests" element={<CodechefContests />} />
                        <Route path="/best-coding-contests" element={<BestCodingContests />} />
                        <Route path="/how-to-never-miss-contests" element={<HowToNeverMissContests />} />
                    </Routes>
                </React.Suspense>
            </div>

            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme === 'dark' ? 'dark' : 'light'}
            />
        </Router>
    );
}

import { HelmetProvider } from 'react-helmet-async';

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;