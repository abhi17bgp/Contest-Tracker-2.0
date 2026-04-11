import React, { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export default function Login({ onLogin }) {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API}/admin/login`, form);
            onLogin(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, #1a1040 0%, #09090f 60%)',
            padding: 20,
        }}>
            {/* Glow orb */}
            <div style={{
                position: 'fixed', width: 400, height: 400, borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)',
                top: '20%', left: '50%', transform: 'translateX(-50%)',
                pointerEvents: 'none',
            }} />

            <div className="fade-up" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400,
                position: 'relative',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 30, boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                    }}>🏆</div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>Admin Panel</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Contest Tracker · Restricted Access</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label>Username</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="admin"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            required autoFocus
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13,
                        }}>⚠ {error}</div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}>
                        {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : '🔐 Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
                    🔒 This panel is for administrators only
                </p>
            </div>
        </div>
    );
}
