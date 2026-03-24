import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    Wallet,
    Receipt,
    Clock,
    AlertCircle,
    TrendingUp,
    CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/bills/dashboard');
                const { stats: statsData, categories: categoriesData } = response.data || {};
                
                setStats({
                    total: statsData?.total || 0,
                    paid: statsData?.paid || 0,
                    pending: statsData?.pending || 0,
                    overdue: statsData?.overdue || 0,
                    total_amount: statsData?.total_amount || 0,
                    total_paid_amount: statsData?.total_paid_amount || 0,
                    total_unpaid_amount: statsData?.total_unpaid_amount || 0,
                });
                
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex items-center justify-center">
                <div className="text-center text-sm text-gray-500">Loading dashboard stats...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-3 sm:p-4 lg:p-6 relative">
            {/* Stats Grid - Optimized for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 lg:gap-5 mb-4 sm:mb-6">
                {/* Card 1: Total Paid - Green Theme (Success/Positive) */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={22} className="text-emerald-100" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={10} /> Paid
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider mb-1">Total Paid</p>
                        <p className="text-2xl font-black tracking-tight">{formatCurrency(stats.total_paid_amount)}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp size={12} className="text-emerald-200" />
                            <p className="text-[10px] text-emerald-200 font-medium">All time settled</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Total Unpaid - Orange/Amber Theme (Warning) */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Receipt size={22} className="text-orange-100" />
                            </div>
                            <span className="text-[10px] font-bold text-orange-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={10} /> Unpaid
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-orange-100 uppercase tracking-wider mb-1">Total Unpaid</p>
                        <p className="text-2xl font-black tracking-tight">{formatCurrency(stats.total_unpaid_amount)}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <Clock size={12} className="text-orange-100" />
                            <p className="text-[10px] text-orange-100 font-medium">Pending & Overdue</p>
                        </div>
                    </div>
                </div>

                {/* Card 3: Pending Bills - Blue Theme (Info/Progress) */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Clock size={22} className="text-blue-100" />
                            </div>
                            <span className="text-[10px] font-bold text-blue-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Clock size={10} /> Pending
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider mb-1">Pending Bills</p>
                        <p className="text-2xl font-black tracking-tight">{stats.pending}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <AlertCircle size={12} className="text-blue-100" />
                            <p className="text-[10px] text-blue-100 font-medium">Awaiting payment</p>
                        </div>
                    </div>
                </div>

                {/* Card 4: Overdue Bills - Red Theme (Danger/Critical) */}
                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <AlertCircle size={22} className="text-red-100" />
                            </div>
                            <span className="text-[10px] font-bold text-red-100 bg-red-600/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={10} /> Overdue
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-red-100 uppercase tracking-wider mb-1">Overdue Bills</p>
                        <p className="text-2xl font-black tracking-tight">{stats.overdue}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <AlertCircle size={12} className="text-red-200" />
                            <p className="text-[10px] text-red-100 font-medium">Needs immediate action</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Categories Analytics Card */}
                <div className="xl:col-span-9 space-y-6 min-w-0">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-indigo-100 shadow-lg shadow-indigo-100/30 min-h-[380px] sm:min-h-[420px] flex flex-col relative overflow-hidden">
                        {/* Gradient accent bar like Overview */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Categories Analytics</h3>
                                    <p className="text-xs text-indigo-500 font-semibold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Vertical Category List */}
                        <div className="flex-1 space-y-3">
                            {categories.length > 0 ? (
                                categories.map((cat, i) => {
                                    const maxCount = Math.max(...categories.map(c => c.count));
                                    const percentage = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                                    const totalBills = categories.reduce((sum, c) => sum + c.count, 0);
                                    const catPercentage = totalBills > 0 ? Math.round((cat.count / totalBills) * 100) : 0;
                                    
                                    return (
                                        <div key={i} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: cat.color }}
                                                    />
                                                    <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{cat.count}</span>
                                                    <span className="text-[10px] text-gray-400">bills</span>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{catPercentage}%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                                                    style={{ 
                                                        width: `${percentage}%`,
                                                        backgroundColor: cat.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-60">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-300">
                                        <TrendingUp size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-indigo-900/40 uppercase tracking-widest">No Category Data</p>
                                    <p className="text-xs text-indigo-900/30 mt-1">Add bills to see analytics</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-500">Total Bills</span>
                                <span className="text-lg font-black text-gray-900">{categories.reduce((sum, c) => sum + c.count, 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settlement Card */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-emerald-100 shadow-lg shadow-emerald-100/30 h-full flex flex-col relative overflow-hidden">
                        {/* Gradient accent bar like Overview */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600"></div>
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Settlement</h3>
                                    <p className="text-xs text-emerald-600 font-semibold">Payment status</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            {/* Modern Circular Progress */}
                            <div className="relative w-40 h-40 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <defs>
                                        <linearGradient id="settleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    {/* Outer glow ring */}
                                    <circle cx="80" cy="80" r="72" stroke="transparent" strokeWidth="1" fill="none" />
                                    
                                    {/* Background track */}
                                    <circle 
                                        cx="80" cy="80" r="68" 
                                        stroke="#f1f5f9" 
                                        strokeWidth="12" 
                                        fill="none" 
                                    />
                                    
                                    {/* Progress ring */}
                                    <circle 
                                        cx="80" cy="80" r="68" 
                                        stroke="url(#settleGrad)" 
                                        strokeWidth="12" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray={427.3} 
                                        strokeDashoffset={427.3 * (1 - (stats.paid / (stats.total || 1)))} 
                                        filter="url(#glow)"
                                        className="transition-all duration-1000 ease-out" 
                                    />
                                </svg>
                                
                                {/* Center content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-4xl font-black text-gray-900 tracking-tight">{Math.round((stats.paid / (stats.total || 1)) * 100)}</span>
                                        <span className="text-lg font-bold text-emerald-500">%</span>
                                    </div>
                                    <div className="mt-1 px-2 py-0.5 bg-emerald-50 rounded-full">
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Settled</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modern Legend */}
                            <div className="flex justify-center gap-6 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm" />
                                    <span className="text-[11px] font-semibold text-gray-600">Paid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-sm" />
                                    <span className="text-[11px] font-semibold text-gray-600">Pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-300 to-red-400 shadow-sm" />
                                    <span className="text-[11px] font-semibold text-gray-600">Overdue</span>
                                </div>
                            </div>
                            
                            {/* Status Cards - Modern Design */}
                            <div className="space-y-3 mt-auto">
                                {/* Paid */}
                                <div className="group p-4 bg-gradient-to-r from-green-50 to-green-100/30 rounded-2xl border border-green-100 hover:shadow-lg hover:shadow-green-500/15 hover:scale-[1.01] transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
                                                <CheckCircle2 size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Paid</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Settled bills</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-green-600">{stats.paid}</p>
                                            <p className="text-[10px] text-green-500 font-bold">{stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-1.5 bg-green-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-700" 
                                            style={{ width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Pending */}
                                <div className="group p-4 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-2xl border border-amber-100 hover:shadow-lg hover:shadow-amber-500/15 hover:scale-[1.01] transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                                                <Clock size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Pending</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Awaiting payment</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-amber-600">{stats.pending}</p>
                                            <p className="text-[10px] text-amber-500 font-bold">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" 
                                            style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Overdue */}
                                <div className="group p-4 bg-gradient-to-r from-red-50 to-red-100/30 rounded-2xl border border-red-100 hover:shadow-lg hover:shadow-red-500/15 hover:scale-[1.01] transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
                                                <AlertCircle size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Overdue</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Past due date</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-red-500">{stats.overdue}</p>
                                            <p className="text-[10px] text-red-400 font-bold">{stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-1.5 bg-red-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700" 
                                            style={{ width: `${stats.total > 0 ? (stats.overdue / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Add Bill */}
            <button
                onClick={() => navigate('/add-bill')}
                className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl shadow-green-500/40 flex items-center justify-center hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 group z-40 border-4 border-white"
                title="Add New Bill"
            >
                <Plus size={32} className="group-hover:stroke-[3]" />
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                    Quick Add Bill
                </span>
            </button>
        </div>
    );
};

export default Dashboard;
