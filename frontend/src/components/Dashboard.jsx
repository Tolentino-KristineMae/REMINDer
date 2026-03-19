import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    ArrowUpRight, 
    Search,
    Bell,
    Mail
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
            <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex items-center justify-center">
                <div className="text-center text-sm text-gray-500">Loading dashboard stats...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 relative">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search dashboard..." 
                        className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-10 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-[10px] font-bold"
                    />
                </div>
                
                <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors relative">
                        <Mail className="text-gray-400" size={16} />
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors relative">
                        <Bell className="text-gray-400" size={16} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-green-950 mb-1 tracking-tight">Admin Dashboard</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manage and prioritize your bills with ease.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate('/add-bill')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={18} className="stroke-[3]" />
                        Add Bill
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[
                    { label: 'Total Amount Paid', value: formatCurrency(stats.total_paid_amount), color: 'bg-green-900', text: 'text-white', sub: 'All time' },
                    { label: 'Total Amount Unpaid', value: formatCurrency(stats.total_unpaid_amount), color: 'bg-white', text: 'text-red-600', sub: 'Pending & Overdue' },
                    { label: 'Pending Bills', value: stats.pending, color: 'bg-white', text: 'text-gray-900', sub: 'Action required' },
                    { label: 'Overdue Bills', value: stats.overdue, color: 'bg-white', text: 'text-red-600', sub: 'Immediate attention' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-6 rounded-3xl border ${stat.color === 'bg-white' ? 'border-gray-100 shadow-sm' : 'border-transparent'} relative group hover:scale-[1.02] transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-xs font-black uppercase tracking-widest ${stat.color === 'bg-green-900' ? 'text-green-100' : 'text-gray-400'}`}>{stat.label}</h3>
                            <ArrowUpRight size={20} className={stat.color === 'bg-green-900' ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <p className={`text-3xl font-black ${stat.text} mb-2 tracking-tighter`}>{stat.value}</p>
                        <span className={`${stat.label === 'Total Amount Unpaid' || stat.label === 'Overdue Bills' ? 'bg-red-50 text-red-600' : (stat.color === 'bg-green-900' ? 'bg-green-500/20 text-green-300' : 'bg-green-50 text-green-600')} text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider`}>
                            {stat.sub}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-6 min-w-0">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Bill Analytics</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-green-900"></div> Paid</div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-green-200"></div> Pending</div>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between px-4 pb-2">
                            {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 w-full max-w-[40px]">
                                    <div className="w-full flex flex-col-reverse gap-1.5 h-48 relative">
                                        <div style={{ height: `${h}%` }} className="bg-green-900 rounded-full transition-all hover:opacity-80 cursor-pointer"></div>
                                        <div style={{ height: `${100-h}%` }} className="bg-green-100 rounded-full opacity-30"></div>
                                    </div>
                                    <span className="text-gray-400 font-bold text-xs">{'SMTWTFS'[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center h-full flex flex-col justify-center min-h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-8 text-left">Settlement Progress</h3>
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 * (1 - (stats.paid / (stats.total || 1)))} className="text-green-900 transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute text-3xl font-black text-gray-900">{Math.round((stats.paid / (stats.total || 1)) * 100)}%</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-950 font-black text-sm uppercase tracking-tighter">Bills Settled</p>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{stats.paid} of {stats.total} Completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
