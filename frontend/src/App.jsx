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

const SplashScreen = () => {
    const platforms = ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'GeeksforGeeks'];
    const features = [
        { icon: '📧', text: 'Email alerts 1 hour before' },
        { icon: '🔥', text: 'Push alerts 15 min before' },
        { icon: '🚨', text: 'Final alert 5 min before' },
        { icon: '📅', text: '14-day contest calendar' },
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden',
            animation: 'splashFadeIn 0.5s ease-out',
            zIndex: 9999,
        }}>
            <style>{`
                @keyframes splashFadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes floatUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
                @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
                @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
                @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }
                @keyframes badgeSlide {
                    0%   { opacity:0; transform:translateX(-20px) }
                    15%  { opacity:1; transform:translateX(0) }
                    85%  { opacity:1; transform:translateX(0) }
                    100% { opacity:0; transform:translateX(20px) }
                }
                @keyframes progressFill { from{width:0%} to{width:100%} }
                @keyframes featurePop {
                    from { opacity:0; transform:scale(0.8) translateY(10px) }
                    to   { opacity:1; transform:scale(1) translateY(0) }
                }
                .platform-badge {
                    animation: badgeSlide 1.2s ease-in-out infinite;
                }
            `}</style>

            {/* Background floating orbs */}
            <div style={{ position:'absolute', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(60px)', top:'10%', left:'10%', animation:'orb1 6s ease-in-out infinite' }} />
            <div style={{ position:'absolute', width:'250px', height:'250px', borderRadius:'50%', background:'rgba(139,92,246,0.12)', filter:'blur(50px)', bottom:'15%', right:'10%', animation:'orb2 8s ease-in-out infinite' }} />
            <div style={{ position:'absolute', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(59,130,246,0.1)', filter:'blur(40px)', bottom:'30%', left:'20%', animation:'orb3 7s ease-in-out infinite' }} />

            {/* Logo */}
            <div style={{ animation:'floatUp 0.6s ease-out both', textAlign:'center', marginBottom:'24px' }}>
                <div style={{
                    width:'88px', height:'88px', borderRadius:'24px', margin:'0 auto 16px',
                    background:'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'44px', boxShadow:'0 20px 50px rgba(79,70,229,0.4)',
                    animation:'pulse 2.5s ease-in-out infinite',
                }}>🏆</div>
                <h1 style={{
                    fontSize:'clamp(22px,5vw,32px)', fontWeight:900, margin:0,
                    background:'linear-gradient(90deg, #fff 0%, #a5b4fc 50%, #fff 100%)',
                    backgroundSize:'200% auto',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    animation:'shimmer 3s linear infinite',
                    letterSpacing:'-0.5px',
                }}>Contest Tracker</h1>
                <p style={{ color:'#94a3b8', fontSize:'13px', marginTop:'6px', letterSpacing:'0.05em' }}>
                    Never miss a coding contest again
                </p>
            </div>

            {/* Rotating platform badge */}
            <div style={{ animation:'floatUp 0.6s 0.15s ease-out both', marginBottom:'32px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {platforms.map((p, i) => (
                    <span key={p} className="platform-badge" style={{
                        position: i === 0 ? 'relative' : 'absolute',
                        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
                        borderRadius:'100px', padding:'6px 18px',
                        color:'#c7d2fe', fontSize:'13px', fontWeight:700,
                        backdropFilter:'blur(10px)',
                        animationDelay: `${i * 1.2}s`,
                        display: i === 0 ? 'block' : 'none',
                    }}>{p}</span>
                ))}
                <div style={{ display:'flex', gap:'8px' }}>
                    {platforms.map((p, i) => (
                        <span key={p} style={{
                            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                            borderRadius:'100px', padding:'5px 12px',
                            color:'rgba(167,183,255,0.7)', fontSize:'11px', fontWeight:600,
                        }}>{p}</span>
                    ))}
                </div>
            </div>

            {/* Feature pills */}
            <div style={{
                animation:'floatUp 0.6s 0.3s ease-out both',
                display:'grid', gridTemplateColumns:'1fr 1fr',
                gap:'10px', marginBottom:'36px',
                width:'min(380px, 90vw)',
            }}>
                {features.map(({ icon, text }, i) => (
                    <div key={i} style={{
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(255,255,255,0.1)',
                        borderRadius:'14px', padding:'12px 14px',
                        display:'flex', alignItems:'center', gap:'10px',
                        animation:`featurePop 0.5s ${0.4 + i * 0.1}s ease-out both`,
                    }}>
                        <span style={{ fontSize:'20px', flexShrink:0 }}>{icon}</span>
                        <span style={{ color:'#cbd5e1', fontSize:'12px', fontWeight:600, lineHeight:1.3 }}>{text}</span>
                    </div>
                ))}
            </div>

            {/* Progress bar + text */}
            <div style={{ animation:'floatUp 0.6s 0.5s ease-out both', width:'min(280px, 80vw)', textAlign:'center' }}>
                <div style={{ height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'99px', overflow:'hidden', marginBottom:'12px' }}>
                    <div style={{
                        height:'100%', borderRadius:'99px',
                        background:'linear-gradient(90deg, #6366f1, #a78bfa, #6366f1)',
                        backgroundSize:'200% auto',
                        animation:'progressFill 2.5s ease-in-out infinite, shimmer 2s linear infinite',
                    }} />
                </div>
                <p style={{ color:'#64748b', fontSize:'11px', margin:0, letterSpacing:'0.08em', textTransform:'uppercase' }}>
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

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;