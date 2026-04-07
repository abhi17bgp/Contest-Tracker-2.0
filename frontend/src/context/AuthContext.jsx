import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const CHANNEL_NAME = 'contest_tracker_auth';

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

    const channelRef = useRef(null);

    // ── BroadcastChannel: for UPDATE_USER (profile/email verify) ──────────
    // BroadcastChannel only reaches tabs that are ALREADY open.
    // It does NOT deliver messages to tabs opened LATER (no message persistence).
    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') return;

        channelRef.current = new BroadcastChannel(CHANNEL_NAME);

        channelRef.current.onmessage = ({ data }) => {
            if (data.type === 'UPDATE_USER') {
                // Directly update state — do NOT call setUser() to avoid re-broadcasting
                setUserState(data.payload.user);
            }
        };

        return () => {
            channelRef.current?.close();
        };
    }, []);

    // ── storage event: for LOGIN / LOGOUT cross-tab sync ──────────────────
    // The native 'storage' event fires in every SAME-ORIGIN tab/window when
    // localStorage is changed from ANOTHER tab — covers new tabs too, since
    // any tab reading localStorage on mount will see the updated value.
    useEffect(() => {
        const handleStorageChange = async (event) => {
            if (event.key !== 'token') return;

            if (event.newValue) {
                // Token appeared in another tab → login
                try {
                    const res = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${event.newValue}` }
                    });
                    setUserState(res.data);
                } catch {
                    setUserState(null);
                }
            } else {
                // Token removed in another tab → logout
                setUserState(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [API_URL]);

    // ── On mount: restore session from token in localStorage ───────────────
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserState(res.data);
                } catch (error) {
                    console.error('Token invalid or expired', error);
                    localStorage.removeItem('token');
                    setUserState(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, [API_URL]);

    // ── Public auth actions ────────────────────────────────────────────────

    /** Login: sets token in localStorage (fires storage event in other tabs) */
    const login = (userData, token) => {
        localStorage.setItem('token', token);   // ← other tabs receive 'storage' event
        setUserState(userData);
    };

    /** Logout: removes token (fires storage event in other tabs) */
    const logout = () => {
        localStorage.removeItem('token');       // ← other tabs receive 'storage' event
        setUserState(null);
    };

    /**
     * Update user data (profile edit, email verification, etc.)
     * Uses BroadcastChannel since this doesn't change the token in localStorage.
     */
    const setUser = (userData) => {
        setUserState(userData);
        try {
            channelRef.current?.postMessage({ type: 'UPDATE_USER', payload: { user: userData } });
        } catch (_) { /* channel may be closed */ }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};
