import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { API_URL } = useContext(AuthContext);
    
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await axios.post(`${API_URL}/auth/verify-email`, { token });
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        verify();
    }, [token, API_URL]);

    return (
        <div className="flex justify-center items-start sm:items-center min-h-screen bg-gray-50 py-8 px-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md text-center my-auto">
                {status === 'verifying' && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Verifying your email...</h2>
                    </div>
                )}
                {status === 'success' && (
                    <div>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your account is now fully verified. You will receive automated contest reminders.</p>
                        <Link to="/login" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition">Go to Login</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">The verification link is invalid or has expired.</p>
                        <Link to="/login" className="text-blue-600 font-medium hover:underline">Return to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
