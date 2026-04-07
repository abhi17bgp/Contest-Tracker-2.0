import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { API_URL } = useContext(AuthContext);

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email });
            toast.success('Password reset link sent to your email');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to process request');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <KeyRound className="w-12 h-12 text-blue-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Forgot Password?</h2>
                    <p className="text-gray-600 text-sm mt-2 text-center">Enter your email address and we'll send you a link to reset your password.</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email address"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">
                        Send Reset Link
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-600 font-medium text-sm hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
