import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { API_URL, user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await axios.post(`${API_URL}/auth/verify-email`, { token });

                // ✅ Fetch the latest user profile and update across tabs
                const authToken = localStorage.getItem('token');
                if (authToken) {
                    try {
                        const meRes = await axios.get(`${API_URL}/auth/me`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        setUser(meRes.data);
                    } catch (e) {}
                }

                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        verify();
    }, [token, API_URL]);

    // Auto-redirect countdown after success
    useEffect(() => {
        if (status !== 'success') return;

        if (countdown === 0) {
            navigate(user ? '/' : '/login');
            return;
        }

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown, navigate, user]);

    return (
        <div className="flex justify-center items-start sm:items-center min-h-screen bg-gray-50 py-8 px-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-3xl shadow-xl text-center my-auto overflow-hidden relative">

                {/* Verifying */}
                {status === 'verifying' && (
                    <div className="py-4">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying your email</h2>
                        <p className="text-gray-500 text-sm">Please wait a moment...</p>
                    </div>
                )}

                {/* Success */}
                {status === 'success' && (
                    <div className="py-4">
                        {/* Animated checkmark circle */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    <CheckCircle className="w-14 h-14 text-emerald-500" />
                                </div>
                                {/* Ripple rings */}
                                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                                Email Verified! 🎉
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Your account is fully active. You'll now receive contest reminders 5 minutes before they start.
                            </p>
                        </div>

                        {/* Countdown pill */}
                        <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                            <span>Redirecting in {countdown}s</span>
                            <span className="ml-2 w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center text-xs font-black">
                                {countdown}
                            </span>
                        </div>

                        <Link
                            to={user ? '/' : '/login'}
                            className="flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 sm:py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            {user ? 'Go to Dashboard' : 'Go to Login'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className="py-4">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            The verification link is invalid or has expired. Please request a new one.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Link
                                to="/login"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
