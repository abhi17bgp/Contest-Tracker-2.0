import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const Avatar = ({ name }) => {
    const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    return (
        <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: color + '22', border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color,
        }}>{initials}</div>
    );
};

export default function Users({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/users`, authHeader(token));
            setUsers(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }, [users, search]);

    const stats = useMemo(() => ({
        total:   users.length,
        verified: users.filter(u => u.isVerified).length,
        pushEnabled: users.filter(u => u.pushSubscriptions?.length > 0).length,
    }), [users]);

    const handleToggleVerify = async (user) => {
        setTogglingId(user._id);
        try {
            const res = await axios.patch(`${API}/admin/users/${user._id}`, { isVerified: !user.isVerified }, authHeader(token));
            setUsers(prev => prev.map(u => u._id === user._id ? res.data : u));
        } catch { /* silent */ }
        finally { setTogglingId(null); }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`${API}/admin/users/${toDelete._id}`, authHeader(token));
            setUsers(prev => prev.filter(u => u._id !== toDelete._id));
            setToDelete(null);
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    return (
        <div className="fade-up">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Users</div>
                    <div className="page-sub">Manage all registered accounts</div>
                </div>
                <button className="btn btn-ghost" onClick={fetchUsers}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon: '👥', label: 'Total Users',     value: stats.total,       color: '#6366f1' },
                    { icon: '✅', label: 'Verified',         value: stats.verified,    color: '#10b981' },
                    { icon: '🔔', label: 'Push Enabled',     value: stats.pushEnabled, color: '#f59e0b' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
                        <div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="search-wrap" style={{ marginBottom: 16, maxWidth: 340 }}>
                <span className="search-icon">🔍</span>
                <input className="input" placeholder="Search by name or email…"
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="table-wrap">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No users found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Push Subs</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <tr key={u._id}>
                                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Avatar name={u.name} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name || '—'}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warn'}`}>
                                            {u.isVerified ? '✅ Verified' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.pushSubscriptions?.length ? 'badge-primary' : 'badge-gray'}`}>
                                            {u.pushSubscriptions?.length || 0} sub{u.pushSubscriptions?.length !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className={`btn ${u.isVerified ? 'btn-warn' : 'btn-success'}`}
                                                style={{ fontSize: 12, padding: '6px 12px' }}
                                                disabled={togglingId === u._id}
                                                onClick={() => handleToggleVerify(u)}
                                            >
                                                {togglingId === u._id ? <div className="spinner" style={{ width:14, height:14 }} /> : (u.isVerified ? '🔒 Unverify' : '✅ Verify')}
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ fontSize: 12, padding: '6px 12px' }}
                                                onClick={() => setToDelete(u)}
                                            >🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {toDelete && (
                <div className="modal-overlay" onClick={() => setToDelete(null)}>
                    <div className="confirm-modal modal-anim" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete User?</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                            <strong style={{ color: 'var(--text)' }}>{toDelete.name}</strong>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>{toDelete.email}</div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button className="btn btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? <div className="spinner" style={{ width:14, height:14 }} /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
