import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Users from './pages/Users.jsx';
import Contests from './pages/Contests.jsx';
import Quotes from './pages/Quotes.jsx';

const Sidebar = ({ onLogout, open, onClose }) => {
    const location = useLocation();
    const nav = [
        { to: '/users',    icon: '👥', label: 'Users' },
        { to: '/contests', icon: '🏆', label: 'Contests' },
        { to: '/quotes',   icon: '💭', label: 'Quotes' },
    ];

    return (
        <>
            {/* Backdrop (mobile only) */}
            <div
                className={`sidebar-backdrop ${open ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside
                className={`admin-sidebar ${open ? 'open' : ''}`}
                style={{
                    width: 220, flexShrink: 0,
                    background: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    position: 'sticky', top: 0, height: '100vh',
                }}
            >
                {/* Logo */}
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                        }}>🏆</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', lineHeight: 1.2 }}>Contest Tracker</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px' }}>
                    {nav.map(({ to, icon, label }) => (
                        <NavLink key={to} to={to} onClick={onClose} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                            textDecoration: 'none', fontSize: 13, fontWeight: 600,
                            transition: 'all 0.18s',
                            background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: isActive ? '#a5b4fc' : 'var(--text-dim)',
                            border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                        })}>
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => { onClose(); onLogout(); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                        🚪 Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

const Layout = ({ onLogout, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Get current page title for mobile header
    const pageTitle = location.pathname.includes('users') ? 'Users' 
                    : location.pathname.includes('quotes') ? 'Quotes' 
                    : 'Contests';

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile top header */}
            <div className="mobile-header">
                <button className="hamburger" onClick={() => setSidebarOpen(s => !s)}>
                    {sidebarOpen ? '✕' : '☰'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🏆</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{pageTitle}</span>
                </div>
                <div style={{ width: 40 }} /> {/* spacer for centering */}
            </div>

            <Sidebar onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="admin-main" style={{ flex: 1, padding: '32px', overflowX: 'hidden', minWidth: 0 }}>
                {children}
            </main>
        </div>
    );
};

const PrivateRoute = ({ token, children }) =>
    token ? children : <Navigate to="/login" replace />;

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('adminToken'));

    const handleLogin  = (t) => { localStorage.setItem('adminToken', t); setToken(t); };
    const handleLogout = ()  => { localStorage.removeItem('adminToken'); setToken(null); };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    token ? <Navigate to="/users" replace /> : <Login onLogin={handleLogin} />
                } />
                <Route path="/users" element={
                    <PrivateRoute token={token}>
                        <Layout onLogout={handleLogout}><Users token={token} /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/contests" element={
                    <PrivateRoute token={token}>
                        <Layout onLogout={handleLogout}><Contests token={token} /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/quotes" element={
                    <PrivateRoute token={token}>
                        <Layout onLogout={handleLogout}><Quotes token={token} /></Layout>
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to={token ? '/users' : '/login'} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

