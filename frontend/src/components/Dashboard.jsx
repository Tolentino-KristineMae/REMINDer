import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    Wallet,
    Receipt,
    Clock,
    AlertCircle,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        total_amount: 0,
        total_paid_amount: 0,
        total_unpaid_amount: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/bills/stats');
                const data = response.data;
                setStats({
                    total: data.total || 0,
                    paid: data.paid || 0,
                    pending: data.pending || 0,
                    overdue: data.overdue || 0,
                    total_amount: data.total_amount || 0,
                    total_paid_amount: data.total_paid_amount || 0,
                    total_unpaid_amount: data.total_unpaid_amount || 0,
                });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex items-center justify-center">
                <div className="text-center text-sm text-gray-500">Loading dashboard stats...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 relative">

            {/* Stats Grid - Organized Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
                {/* Card 1: Total Paid */}
                <div className="bg-gradient-to-br from-green-700 to-green-900 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={22} className="text-green-200" />
                            </div>
                            <span className="text-[10px] font-bold text-green-200 bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp size={10} /> Paid
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-green-200/80 uppercase tracking-wider mb-1">Total Paid</p>
                        <p className="text-2xl font-black tracking-tight">{formatCurrency(stats.total_paid_amount)}</p>
                        <p className="text-[10px] text-green-300/70 mt-2 font-medium">All time earnings</p>
                    </div>
                </div>

                {/* Card 2: Total Unpaid */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                                <Receipt size={22} className="text-red-500" />
                            </div>
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={10} /> Unpaid
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Unpaid</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(stats.total_unpaid_amount)}</p>
                        <p className="text-[10px] text-red-500 mt-2 font-medium">Pending & Overdue</p>
                    </div>
                </div>

                {/* Card 3: Pending Bills */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock size={22} className="text-amber-500" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <Clock size={10} /> Pending
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending Bills</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.pending}</p>
                        <p className="text-[10px] text-amber-600 mt-2 font-medium">Requires action</p>
                    </div>
                </div>

                {/* Card 4: Overdue Bills */}
                <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                                <AlertCircle size={22} className="text-red-500" />
                            </div>
                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={10} /> Overdue
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Overdue Bills</p>
                        <p className="text-2xl font-black text-red-600 tracking-tight">{stats.overdue}</p>
                        <p className="text-[10px] text-red-500 mt-2 font-medium">Immediate attention</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-6 min-w-0">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 min-h-[420px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Bill Analytics</h3>
                                    <p className="text-xs text-gray-400 font-medium">Weekly overview</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                                    <div className="w-3 h-3 rounded-full bg-green-900"></div> Paid
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                                    <div className="w-3 h-3 rounded-full bg-green-200"></div> Pending
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between px-4 pb-4">
                            {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 w-full max-w-[50px] group">
                                    <div className="w-full flex flex-col-reverse gap-1.5 h-52 relative">
                                        <div 
                                            style={{ height: `${h}%` }} 
                                            className="bg-gradient-to-t from-green-800 to-green-600 rounded-t-lg transition-all duration-500 group-hover:opacity-80 cursor-pointer shadow-lg shadow-green-900/20"
                                        ></div>
                                        <div 
                                            style={{ height: `${100-h}%` }} 
                                            className="bg-green-50 rounded-t-lg opacity-40"
                                        ></div>
                                        {/* Hover value tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                    <span className="text-gray-400 font-bold text-xs">{['S','M','T','W','T','F','S'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Settlement</h3>
                                <p className="text-xs text-gray-400 font-medium">Progress overview</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative w-40 h-40 mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <defs>
                                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#15803d" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                    <circle 
                                        cx="80" cy="80" r="70" 
                                        stroke="url(#progressGrad)" 
                                        strokeWidth="12" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray={439.8} 
                                        strokeDashoffset={439.8 * (1 - (stats.paid / (stats.total || 1)))} 
                                        className="transition-all duration-1000 ease-out drop-shadow-lg" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-gray-900">{Math.round((stats.paid / (stats.total || 1)) * 100)}%</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Complete</span>
                                </div>
                            </div>
                            
                            <div className="w-full space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span className="text-xs font-bold text-gray-600">Settled</span>
                                    </div>
                                    <span className="text-sm font-black text-green-700">{stats.paid}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-amber-600" />
                                        <span className="text-xs font-bold text-gray-600">Pending</span>
                                    </div>
                                    <span className="text-sm font-black text-amber-700">{stats.pending}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-600" />
                                        <span className="text-xs font-bold text-gray-600">Overdue</span>
                                    </div>
                                    <span className="text-sm font-black text-red-700">{stats.overdue}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
