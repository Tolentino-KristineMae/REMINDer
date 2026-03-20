import React, { useState } from 'react';
import api from '../api/axios';

const Setup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/create-user', { name, email, password });
            setMessage('Account created! You can now login.');
            setError('');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Failed to create account. Please try again.';
            console.error('Account creation failed:', err);
            setError(msg);
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Setup Account</h2>
                
                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl border border-green-100 font-bold text-sm mb-6">
                        {message}
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-100 font-bold text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-sm"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-sm"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 mt-4"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Setup;
