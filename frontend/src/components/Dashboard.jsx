import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    ArrowUpRight,
    Wallet,
    Receipt,
    Clock,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CheckCircle2,
    XCircle
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
                {[
                    { 
                        label: 'Total Amount Paid', 
                        value: formatCurrency(stats.total_paid_amount), 
                        color: 'from-green-600 to-green-800',
                        bgPattern: 'bg-green-900',
                        text: 'text-white',
                        textMuted: 'text-green-200',
                        icon: <Wallet size={24} />,
                        iconBg: 'bg-green-500/20',
                        sub: 'All time'
                    },
                    { 
                        label: 'Total Amount Unpaid', 
                        value: formatCurrency(stats.total_unpaid_amount), 
                        color: 'from-red-50 to-white',
                        bgPattern: 'bg-white',
                        text: 'text-red-600',
                        textMuted: 'text-red-400',
                        icon: <Receipt size={24} />,
                        iconBg: 'bg-red-100',
                        border: 'border-red-100',
                        sub: 'Pending & Overdue'
                    },
                    { 
                        label: 'Pending Bills', 
                        value: stats.pending, 
                        color: 'from-white to-gray-50',
                        bgPattern: 'bg-white',
                        text: 'text-gray-900',
                        textMuted: 'text-gray-500',
                        icon: <Clock size={24} />,
                        iconBg: 'bg-amber-100',
                        border: 'border-gray-100',
                        sub: 'Action required'
                    },
                    { 
                        label: 'Overdue Bills', 
                        value: stats.overdue, 
                        color: 'from-red-50 to-white',
                        bgPattern: 'bg-white',
                        text: 'text-red-600',
                        textMuted: 'text-red-400',
                        icon: <AlertCircle size={24} />,
                        iconBg: 'bg-red-100',
                        border: 'border-red-100',
                        sub: 'Immediate attention'
                    }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bgPattern} p-5 rounded-2xl border ${stat.border || 'border-transparent'} relative group hover:scale-[1.02] hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300`}>
                        {/* Background Decorative Element */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-30 rounded-bl-[100px] -z-10 transition-all duration-300 group-hover:opacity-40`} />
                        
                        {/* Icon */}
                        <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mb-4 ${stat.bgPattern === 'bg-white' ? 'text-gray-700' : 'text-white'}`}>
                            {stat.icon}
                        </div>
                        
                        {/* Label */}
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${stat.textMuted} mb-1`}>{stat.label}</h3>
                        
                        {/* Value */}
                        <p className={`text-2xl font-black ${stat.text} mb-3 tracking-tight`}>{stat.value}</p>
                        
                        {/* Sub Badge */}
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                            stat.label === 'Total Amount Unpaid' || stat.label === 'Overdue Bills' 
                                ? 'bg-red-100 text-red-600' 
                                : stat.bgPattern === 'bg-green-900'
                                    ? 'bg-green-500/30 text-green-200'
                                    : 'bg-gray-100 text-gray-600'
                        }`}>
                            {stat.label === 'Total Amount Unpaid' || stat.label === 'Overdue Bills' ? (
                                <XCircle size={12} />
                            ) : stat.label === 'Total Amount Paid' ? (
                                <CheckCircle2 size={12} />
                            ) : (
                                <Clock size={12} />
                            )}
                            {stat.sub}
                        </span>
                    </div>
                ))}
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
