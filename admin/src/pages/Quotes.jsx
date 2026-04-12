import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export default function Quotes({ token }) {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modals
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Pinning
    const [pinningId, setPinningId] = useState(null);

    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ text: '', author: '', status: '' });
    const [saving, setSaving] = useState(false);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/quotes`, authHeader(token));
            setQuotes(res.data);
        } catch (e) {
            console.error('Failed to fetch quotes:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuotes(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return quotes.filter(quote => 
            quote.text.toLowerCase().includes(q) || 
            quote.author.toLowerCase().includes(q) ||
            (quote.submittedBy?.name || '').toLowerCase().includes(q)
        );
    }, [quotes, search]);

    const stats = useMemo(() => ({
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        approved: quotes.filter(q => q.status === 'approved').length,
    }), [quotes]);

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`${API}/admin/quotes/${toDelete._id}`, authHeader(token));
            setQuotes(prev => prev.filter(q => q._id !== toDelete._id));
            setToDelete(null);
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    const handlePin = async (quote) => {
        setPinningId(quote._id);
        try {
            const res = await axios.post(`${API}/admin/quotes/${quote._id}/pin`, {}, authHeader(token));
            // res.data is the newly pinned quote. 
            // We need to locally clear featuredDate for any others and apply it to this one.
            const today = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
            setQuotes(prev => prev.map(q => {
                if (q._id === res.data._id) return { ...q, ...res.data };
                if (q.featuredDate === today) return { ...q, featuredDate: null };
                return q;
            }));
        } catch (e) {
            console.error('Failed to pin quote', e);
        } finally {
            setPinningId(null);
        }
    };

    const handleEditSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const res = await axios.put(`${API}/admin/quotes/${editing._id}`, editForm, authHeader(token));
            // Update the array with the new populated quote (submittedBy might be needed, so just fetch again or merge manually)
            // It's easier to just spread existing and overwrite with res.data, keeping populated fields if res.data doesn't populate
            setQuotes(prev => prev.map(q => q._id === editing._id ? { ...q, ...res.data } : q));
            setEditing(null);
        } catch { /* silent */ }
        finally { setSaving(false); }
    };

    const openEdit = (quote) => {
        setEditing(quote);
        setEditForm({ text: quote.text, author: quote.author, status: quote.status });
    };

    return (
        <div className="fade-up">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Quotes</div>
                    <div className="page-sub">Manage user-submitted quotes of the day</div>
                </div>
                <button className="btn btn-ghost" onClick={fetchQuotes}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon: '💭', label: 'Total Submitted', value: stats.total,    color: '#6366f1' },
                    { icon: '⏳', label: 'Pending Review',  value: stats.pending,  color: '#f59e0b' },
                    { icon: '✅', label: 'Approved',        value: stats.approved, color: '#10b981' },
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
                <input className="input" placeholder="Search text, author, or submitter..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="table-wrap">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No quotes found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th style={{width: '40%'}}>Quote</th>
                                <th>Author (credited)</th>
                                <th>Submitted By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(q => {
                                const todayStr = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
                                const isPinnedToday = q.featuredDate === todayStr;
                                
                                return (
                                <tr key={q._id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span className={`badge ${
                                                q.status === 'approved' ? 'badge-success' : 
                                                q.status === 'rejected' ? 'badge-danger' : 'badge-warn'
                                            }`}>
                                                {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                                            </span>
                                            {isPinnedToday && (
                                                <span className="badge" style={{ background: '#ec489920', color: '#ec4899', border: '1px solid #ec489944' }}>
                                                    📌 Pinned Today
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
                                            "{q.text}"
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{q.author}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            {q.submittedBy?.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                                            {q.submittedBy?.email || ''}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {new Date(q.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {!isPinnedToday && (
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ fontSize: 12, padding: '6px 12px', background: '#ec489910', color: '#ec4899', border: '1px solid #ec489930' }}
                                                    onClick={() => handlePin(q)}
                                                    disabled={pinningId === q._id}
                                                >
                                                    {pinningId === q._id ? '...' : '📌 Pin'}
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-primary"
                                                style={{ fontSize: 12, padding: '6px 12px' }}
                                                onClick={() => openEdit(q)}
                                            >✍️ Edit</button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ fontSize: 12, padding: '6px 12px' }}
                                                onClick={() => setToDelete(q)}
                                            >🗑</button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit / Review Modal */}
            {editing && (
                <div className="modal-overlay" onClick={() => setEditing(null)}>
                    <div className="confirm-modal modal-anim" style={{ maxWidth: 500, padding: 24 }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Review Quote</h3>
                        
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)' }}>QUOTE TEXT</label>
                            <textarea 
                                className="input" 
                                style={{ width: '100%', minHeight: 100, resize: 'vertical' }}
                                value={editForm.text}
                                onChange={e => setEditForm({ ...editForm, text: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)' }}>ATTRIBUTED AUTHOR</label>
                            <input 
                                className="input" 
                                style={{ width: '100%' }}
                                value={editForm.author}
                                onChange={e => setEditForm({ ...editForm, author: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)' }}>STATUS</label>
                            <select 
                                className="input" 
                                style={{ width: '100%' }}
                                value={editForm.status}
                                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>
                                {saving ? <div className="spinner" style={{ width:14, height:14 }} /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {toDelete && (
                <div className="modal-overlay" onClick={() => setToDelete(null)}>
                    <div className="confirm-modal modal-anim" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete Quote?</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                            This action cannot be undone.
                        </div>
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
