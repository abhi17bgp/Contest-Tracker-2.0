import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Unlock } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { API_URL } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { token, password });
            toast.success('Password has been reset successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <Unlock className="w-12 h-12 text-blue-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">✨ At least 6 characters long</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="New password"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength="6"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
