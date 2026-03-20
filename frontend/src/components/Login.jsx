import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ShieldCheck, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Axios errors: err.response?.data may contain { message: ... } from Laravel
            const msg =
                err?.response?.data?.message ||
                'Invalid login details. Please try again.';
            console.error('Login failed:', err);
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <div className="max-w-3xl w-full flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Left Side - Form */}
                <div className="flex-1 p-8 sm:p-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-green-600/20">
                            R
                        </div>
                        <span className="text-2xl font-black text-gray-800 tracking-tighter">REMINDer</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Sign In</h2>
                    <p className="text-gray-400 text-xs mb-6">Enter your credentials to access the console</p>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-100 font-bold text-xs mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-sm"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                                <span className="text-[10px] text-gray-500 font-medium">Keep me signed in</span>
                            </label>
                            <a href="#" className="text-[10px] font-bold text-green-600 hover:text-green-700">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 mt-2"
                        >
                            Access Admin Portal
                        </button>
                        <p className="text-center mt-4">
                            <Link
                                to="/deployment-status"
                                className="text-[10px] font-bold text-gray-400 hover:text-green-600 uppercase tracking-wider"
                            >
                                Deployment &amp; Supabase status
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Right Side - Visual */}
                <div className="hidden md:block w-5/12 bg-green-900 p-10 relative overflow-hidden">
                    <div className="relative z-10 text-white h-full flex flex-col justify-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="text-white" size={20} />
                        </div>
                        <h2 className="text-3xl font-bold mb-3 leading-tight">Admin<br />Console</h2>
                        <p className="text-green-100/60 text-[11px] leading-relaxed mb-8">
                            Authorized access only. This portal allows for secure bill management, payment tracking, and financial reporting.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                <span className="text-[10px] font-bold text-green-100">Secure Encryption</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                <span className="text-[10px] font-bold text-green-100">Audit Logs Enabled</span>
                            </div>
                        </div>
                    </div>
                    {/* Abstract shapes */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-800 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-700 rounded-full blur-3xl opacity-30"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
