import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trophy, UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const { API_URL } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }
        try {
            await axios.post(`${API_URL}/auth/register`, { 
                name: formData.name, 
                email: formData.email, 
                password: formData.password 
            });
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-start sm:items-center min-h-screen bg-gray-50 py-8 px-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md my-auto">
                <div className="flex justify-center items-center mb-5">
                    <Trophy className="w-9 h-9 text-blue-600 mr-2" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Join Contest Tracker</h2>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
                        <p className="text-[10px] text-gray-400 mb-2 font-medium">✨ At least 6 characters long</p>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            required
                            minLength="6"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Create a password"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition flex justify-center items-center">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Register
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <p>Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
