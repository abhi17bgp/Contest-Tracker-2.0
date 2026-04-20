import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const PLATFORMS = ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'GeeksforGeeks', 'Custom'];

const platformColor = (p = '') => {
    const pl = p.toLowerCase();
    if (pl.includes('codeforces'))    return { bg: 'rgba(239,68,68,0.15)',    text: '#ef4444' };
    if (pl.includes('codechef'))      return { bg: 'rgba(245,158,11,0.15)',   text: '#f59e0b' };
    if (pl.includes('atcoder'))       return { bg: 'rgba(148,163,184,0.15)',  text: '#94a3b8' };
    if (pl.includes('leetcode'))      return { bg: 'rgba(234,179,8,0.15)',    text: '#eab308' };
    if (pl.includes('geeksforgeeks')) return { bg: 'rgba(34,197,94,0.15)',    text: '#22c55e' };
    return { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' };
};

const fmtDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const EMPTY_FORM = { name: '', platform: 'Codeforces', customPlatform: '', startTime: '', durationHours: '', durationMins: '', url: '' };

export default function Contests({ token }) {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');
    const [resetTarget, setResetTarget] = useState(null);  // contest to reset
    const [resetFlags, setResetFlags] = useState({ notified: false, pushNotified: false, finalPushNotified: false });
    const [resetting, setResetting] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchContests = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/contests`, authHeader(token));
            setContests(res.data);
            setLastRefreshed(new Date());
        } catch { /* silent */ }
        finally { if (!silent) setLoading(false); }
    };

    useEffect(() => {
        fetchContests();
        // Auto-refresh every 30s to pick up cron flag changes
        const interval = setInterval(() => fetchContests(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const filtered = useMemo(() => {
        let list = contests;
        if (filter !== 'All') list = list.filter(c => c.platform.toLowerCase().includes(filter.toLowerCase()));
        if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
        return list;
    }, [contests, filter, search]);

    const stats = useMemo(() => ({
        total: contests.length,
        emailSent: contests.filter(c => c.notified).length,
        pushSent: contests.filter(c => c.pushNotified).length,
    }), [contests]);

    const handleSync = async () => {
        setSyncing(true); setSyncMsg('');
        try {
            await axios.post(`${API}/admin/sync`, {}, authHeader(token));
            setSyncMsg('✅ Sync complete!');
            await fetchContests();
        } catch (e) {
            setSyncMsg('❌ Sync failed: ' + (e.response?.data?.message || e.message));
        } finally { setSyncing(false); }
    };

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditTarget({});
    };

    const openEdit = (c) => {
        const dt = new Date(c.startTime);
        const pad = n => String(n).padStart(2, '0');
        const isKnown = PLATFORMS.slice(0, -1).includes(c.platform); // exclude 'Custom'
        const localStr = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        setForm({
            name: c.name,
            platform: isKnown ? c.platform : 'Custom',
            customPlatform: isKnown ? '' : c.platform,
            startTime: localStr,
            durationHours: String(Math.floor(c.duration / 3600)),
            durationMins: String(Math.floor((c.duration % 3600) / 60)),
            url: c.url,
        });
        setEditTarget(c);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const durationSecs = (parseInt(form.durationHours || 0) * 3600) + (parseInt(form.durationMins || 0) * 60);
        const resolvedPlatform = form.platform === 'Custom' ? (form.customPlatform.trim() || 'Custom') : form.platform;
        const payload = {
            name: form.name.trim(),
            platform: resolvedPlatform,
            startTime: new Date(form.startTime).toISOString(),
            duration: durationSecs,
            url: form.url.trim(),
        };
        try {
            if (editTarget._id) {
                const res = await axios.put(`${API}/admin/contests/${editTarget._id}`, payload, authHeader(token));
                setContests(prev => prev.map(c => c._id === editTarget._id ? res.data : c));
            } else {
                const res = await axios.post(`${API}/admin/contests`, payload, authHeader(token));
                setContests(prev => [res.data, ...prev]);
            }
            setEditTarget(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const openResetModal = (c) => {
        setResetTarget(c);
        setResetFlags({ 
            notified: c.notified || false, 
            pushNotified: c.pushNotified || false, 
            finalPushNotified: c.finalPushNotified || false 
        });
    };

    const handleResetFlags = async () => {
        if (!resetTarget) return;
        setResetting(true);
        try {
            const patch = {
                notified: resetFlags.notified,
                pushNotified: resetFlags.pushNotified,
                finalPushNotified: resetFlags.finalPushNotified
            };
            const res = await axios.put(`${API}/admin/contests/${resetTarget._id}`,
                { ...resetTarget, ...patch },
                authHeader(token));
            setContests(prev => prev.map(x => x._id === resetTarget._id ? res.data : x));
            setResetTarget(null);
        } catch { /* silent */ }
        finally { setResetting(false); }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`${API}/admin/contests/${toDelete._id}`, authHeader(token));
            setContests(prev => prev.filter(c => c._id !== toDelete._id));
            setToDelete(null);
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    const FlagDot = ({ val }) => (
        <span className={`badge ${val ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 10 }}>
            {val ? '✅' : '❌'}
        </span>
    );

    return (
        <div className="fade-up">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Contests</div>
                    <div className="page-sub">Manage the 14-day contest schedule</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {lastRefreshed && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Last updated: {lastRefreshed.toLocaleTimeString()} · auto-refreshes every 30s
                        </span>
                    )}
                    <button className="btn btn-ghost" onClick={() => fetchContests()}>🔄 Refresh</button>
                    <button className="btn btn-warn" onClick={handleSync} disabled={syncing}>
                        {syncing ? <><div className="spinner" style={{ width:14, height:14 }} /> Syncing…</> : '⚡ Sync from CLIST'}
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>＋ Add Contest</button>
                </div>
            </div>

            {syncMsg && (
                <div style={{
                    marginBottom: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                    background: syncMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${syncMsg.startsWith('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: syncMsg.startsWith('✅') ? '#10b981' : '#ef4444',
                }}>{syncMsg}</div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon:'📅', label:'Total Contests', value: stats.total,    color:'#6366f1' },
                    { icon:'📧', label:'Email Sent',     value: stats.emailSent, color:'#10b981' },
                    { icon:'🔔', label:'Push Sent',      value: stats.pushSent,  color:'#f59e0b' },
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

            {/* Filters row */}
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                <div className="search-wrap" style={{ maxWidth: 280 }}>
                    <span className="search-icon">🔍</span>
                    <input className="input" placeholder="Search contests…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['All', 'Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'GeeksforGeeks'].map(p => (
                        <button key={p} onClick={() => setFilter(p)}
                            className={`btn ${filter === p ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: 11, padding: '5px 12px' }}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="table-wrap">
                {loading ? (
                    <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>No contests found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Platform</th>
                                <th>Contest Name</th>
                                <th>Start Time</th>
                                <th>Duration</th>
                                <th style={{ textAlign:'center' }}>Email</th>
                                <th style={{ textAlign:'center' }}>15m Push</th>
                                <th style={{ textAlign:'center' }}>5m Push</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, i) => {
                                const pc = platformColor(c.platform);
                                const started = new Date(c.startTime) < new Date();
                                return (
                                    <tr key={c._id}>
                                        <td style={{ color:'var(--text-muted)', width:40 }}>{i+1}</td>
                                        <td>
                                            <span className="badge" style={{ background: pc.bg, color: pc.text }}>{c.platform}</span>
                                        </td>
                                        <td style={{ maxWidth:220 }}>
                                            <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}
                                                title={c.name}>{c.name}</div>
                                            {started && <span style={{ fontSize:10, color:'var(--text-muted)' }}>Ended</span>}
                                        </td>
                                        <td style={{ fontSize:12, color:'var(--text-dim)', whiteSpace:'nowrap' }}>
                                            {new Date(c.startTime).toLocaleString('en-IN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                                        </td>
                                        <td style={{ fontSize:12 }}>{fmtDuration(c.duration)}</td>
                                        <td style={{ textAlign:'center' }}><FlagDot val={c.notified} /></td>
                                        <td style={{ textAlign:'center' }}><FlagDot val={c.pushNotified} /></td>
                                        <td style={{ textAlign:'center' }}><FlagDot val={c.finalPushNotified} /></td>
                                        <td>
                                            <div style={{ display:'flex', gap:6 }}>
                                                <button className="btn btn-ghost" style={{ fontSize:11, padding:'5px 10px' }}
                                                    onClick={() => openEdit(c)}>✏️ Edit</button>
                                                <button className="btn btn-warn" style={{ fontSize:11, padding:'5px 10px' }}
                                                    onClick={() => openResetModal(c)}
                                                    title="Manage notification flags">⚙️ Flags</button>
                                                <button className="btn btn-danger" style={{ fontSize:11, padding:'5px 10px' }}
                                                    onClick={() => setToDelete(c)}>🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add / Edit Modal */}
            {editTarget !== null && (
                <div className="modal-overlay" onClick={() => setEditTarget(null)}>
                    <div className="modal modal-anim" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">{editTarget._id ? '✏️ Edit Contest' : '➕ Add Contest'}</div>
                        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <div>
                                <label>Contest Name</label>
                                <input className="input" required value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    placeholder="e.g. Codeforces Round 1000" />
                            </div>
                            <div>
                                <label>Platform</label>
                                <select className="select" value={form.platform}
                                    onChange={e => setForm({...form, platform: e.target.value, customPlatform: ''})}>
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p === 'Custom' ? '✏️ Custom (type below)' : p}</option>)}
                                </select>
                            </div>

                            {/* Custom platform name input — only shown when 'Custom' is selected */}
                            {form.platform === 'Custom' && (
                                <div>
                                    <label>Custom Platform Name</label>
                                    <input
                                        className="input"
                                        required
                                        placeholder="e.g. My Platform, HackerCup, …"
                                        value={form.customPlatform}
                                        onChange={e => setForm({...form, customPlatform: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                            )}
                            <div>
                                <label>Start Time (your local time)</label>
                                <input className="input" type="datetime-local" required value={form.startTime}
                                    onChange={e => setForm({...form, startTime: e.target.value})} />
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <div>
                                    <label>Duration — Hours</label>
                                    <input className="input" type="number" min="0" placeholder="2"
                                        value={form.durationHours} onChange={e => setForm({...form, durationHours: e.target.value})} />
                                </div>
                                <div>
                                    <label>Duration — Minutes</label>
                                    <input className="input" type="number" min="0" max="59" placeholder="30"
                                        value={form.durationMins} onChange={e => setForm({...form, durationMins: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label>Contest URL</label>
                                <input className="input" type="url" required value={form.url}
                                    onChange={e => setForm({...form, url: e.target.value})}
                                    placeholder="https://codeforces.com/contest/..." />
                            </div>
                            <div style={{ display:'flex', gap:10, marginTop:4 }}>
                                <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }}
                                    onClick={() => setEditTarget(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} disabled={saving}>
                                    {saving ? <><div className="spinner" style={{ width:14, height:14 }} /> Saving…</> : '💾 Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Flags Modal */}
            {resetTarget && (
                <div className="modal-overlay" onClick={() => setResetTarget(null)}>
                    <div className="modal modal-anim" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-title">⚙️ Manage Notification Flags</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Toggle flags on or off for:
                            <strong style={{ color: 'var(--text)', display: 'block', marginTop: 4 }}>{resetTarget.name}</strong>
                        </div>

                        {/* Checkboxes */}
                        {[
                            { key: 'notified',          label: '📧 Email (1-hour reminder)',     color: '#10b981' },
                            { key: 'pushNotified',      label: '🔥 Push (15-min alert)',         color: '#f59e0b' },
                            { key: 'finalPushNotified', label: '🚨 Final Push (5-min alert)',    color: '#ef4444' },
                        ].map(({ key, label, color }) => (
                            <label key={key} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                                background: resetFlags[key] ? color + '18' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${resetFlags[key] ? color + '40' : 'var(--border)'}`,
                                transition: 'all 0.15s',
                                textTransform: 'none', fontSize: 13, fontWeight: 600, letterSpacing: 0, color: 'var(--text)',
                            }}>
                                <input type="checkbox" checked={resetFlags[key]}
                                    onChange={() => setResetFlags(prev => ({ ...prev, [key]: !prev[key] }))}
                                    style={{ width: 16, height: 16, accentColor: color, cursor: 'pointer' }} />
                                {label}
                                {Boolean(resetTarget[key]) !== Boolean(resetFlags[key]) && (
                                    <span className="badge" style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(255,255,255,0.1)' }}>changed</span>
                                )}
                            </label>
                        ))}

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => setResetTarget(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                                onClick={handleResetFlags} disabled={resetting}>
                                {resetting
                                    ? <div className="spinner" style={{ width: 14, height: 14 }} />
                                    : `💾 Save Flags`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {toDelete && (
                <div className="modal-overlay" onClick={() => setToDelete(null)}>
                    <div className="confirm-modal modal-anim" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize:36, marginBottom:10 }}>🗑️</div>
                        <div style={{ fontSize:15, fontWeight:800, marginBottom:8 }}>Delete Contest?</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{toDelete.platform}</div>
                        <div style={{ fontSize:13, fontWeight:600, marginBottom:20, color:'var(--text)' }}>{toDelete.name}</div>
                        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
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
