import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, CreditCard, Landmark, CheckCircle } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Registration failed. Please try again.';
            console.error('Registration failed:', err);
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full flex bg-white rounded-3xl shadow-2xl overflow-hidden flex-row-reverse">
                {/* Right Side - Form */}
                <div className="flex-1 p-12">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">BillPay</span>
                    </div>

                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-8">Start managing your bills today</p>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>

                        <div className="flex items-start">
                            <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1" required />
                            <label className="ml-2 block text-sm text-gray-700">I agree to the <a href="#" className="text-green-600 font-semibold">Terms of Service</a> and <a href="#" className="text-green-600 font-semibold">Privacy Policy</a></label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                        >
                            Create Account
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-8">
                            Already have an account? <Link to="/login" className="font-bold text-green-600 hover:text-green-500">Sign In</Link>
                        </p>
                    </form>
                </div>

                {/* Left Side - Visual */}
                <div className="hidden lg:block lg:w-[45%] bg-green-600 p-12 relative overflow-hidden">
                    <div className="relative z-10 text-white h-full flex flex-col">
                        <h2 className="text-5xl font-bold mb-6">Join Us!</h2>
                        <h3 className="text-4xl font-bold mb-8">Master your finances with BillPay</h3>
                        
                        <div className="space-y-8 flex-grow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <CheckCircle className="text-green-300" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1 text-white">Bill Reminders</h4>
                                    <p className="text-green-100">Never miss a payment again with our smart due date notifications.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-green-300" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1 text-white">Secure Proofs</h4>
                                    <p className="text-green-100">Safely upload and store your payment receipts for future reference.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Landmark className="text-green-300" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-1 text-white">Expense Tracking</h4>
                                    <p className="text-green-100">Analyze your spending patterns across different categories like BPI, Spay, etc.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="flex -space-x-3 mb-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-10 h-10 rounded-full border-2 border-green-600" alt="Avatar" />
                                ))}
                                <div className="w-10 h-10 rounded-full bg-green-500 border-2 border-green-600 flex items-center justify-center text-xs font-bold">+10k</div>
                            </div>
                            <p className="text-green-100 text-sm font-medium">Trusted by over 10,000+ users worldwide</p>
                        </div>
                    </div>
                    {/* Abstract shapes */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/30 rounded-full -ml-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-700/30 rounded-full -mr-48 -mb-48 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
