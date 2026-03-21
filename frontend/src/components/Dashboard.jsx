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
    FileText
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
    const [categories, setCategories] = useState([]);
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
                
                // Fetch categories
                const catResponse = await api.get('/categories');
                const cats = catResponse.data.categories || catResponse.data || [];
                
                // Get bills to count by category (current month only)
                const billsResponse = await api.get('/bills');
                const bills = billsResponse.data.bills || billsResponse.data || [];
                
                // Get current month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                
                // Filter bills for current month only
                const monthlyBills = bills.filter(bill => {
                    const dueDate = new Date(bill.due_date);
                    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
                });
                
                // Count bills per category for current month
                const categoryCounts = cats.map(cat => ({
                    name: cat.name,
                    count: monthlyBills.filter(b => b.category_id === cat.id || b.category?.id === cat.id).length,
                    color: cat.color || '#22c55e'
                })).filter(c => c.count > 0);
                
                setCategories(categoryCounts.length > 0 ? categoryCounts : [
                    { name: 'Utilities', count: 12, color: '#3B82F6' },
                    { name: 'Rent', count: 3, color: '#8B5CF6' },
                    { name: 'Internet', count: 2, color: '#06B6D4' },
                    { name: 'Insurance', count: 4, color: '#F59E0B' },
                    { name: 'Subscriptions', count: 8, color: '#EC4899' },
                ]);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                // Fallback demo categories
                setCategories([
                    { name: 'Utilities', count: 12, color: '#3B82F6' },
                    { name: 'Rent', count: 3, color: '#8B5CF6' },
                    { name: 'Internet', count: 2, color: '#06B6D4' },
                    { name: 'Insurance', count: 4, color: '#F59E0B' },
                    { name: 'Subscriptions', count: 8, color: '#EC4899' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            currencyDisplay: 'symbol'
        }).format(amount).replace('PHP', '₱');
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-6">
                {/* Card 1: Total Paid - Green Theme (Success/Positive) */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
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
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
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
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
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
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-6 min-w-0">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 min-h-[420px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Categories Analytics</h3>
                                    <p className="text-xs text-gray-400 font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Vertical Category List */}
                        <div className="flex-1 space-y-3">
                            {categories.map((cat, i) => {
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
                            })}
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

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Settlement</h3>
                                    <p className="text-xs text-gray-400 font-medium">Payment status</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            {/* Circular Progress */}
                            <div className="relative w-36 h-36 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <defs>
                                        <linearGradient id="settleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                    {/* Background circles */}
                                    <circle cx="72" cy="72" r="60" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                                    <circle cx="72" cy="72" r="45" stroke="#fef3c7" strokeWidth="10" fill="none" />
                                    <circle cx="72" cy="72" r="30" stroke="#fee2e2" strokeWidth="10" fill="none" />
                                    {/* Progress indicator */}
                                    <circle 
                                        cx="72" cy="72" r="60" 
                                        stroke="url(#settleGrad)" 
                                        strokeWidth="10" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray={377} 
                                        strokeDashoffset={377 * (1 - (stats.paid / (stats.total || 1)))} 
                                        className="transition-all duration-1000 ease-out drop-shadow-lg" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-gray-900">{Math.round((stats.paid / (stats.total || 1)) * 100)}%</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Settled</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex justify-center gap-4 mb-6">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-semibold text-gray-500">Paid</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-amber-300" />
                                    <span className="text-[10px] font-semibold text-gray-500">Pending</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-300" />
                                    <span className="text-[10px] font-semibold text-gray-500">Overdue</span>
                                </div>
                            </div>
                            
                            {/* Status Cards */}
                            <div className="space-y-2.5 mt-auto">
                                {/* Paid */}
                                <div className="group p-3.5 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-100 hover:shadow-md hover:shadow-green-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Paid</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Settled bills</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-green-600">{stats.paid}</p>
                                            <p className="text-[9px] text-green-500 font-semibold">{stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pending */}
                                <div className="group p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-100 hover:shadow-md hover:shadow-amber-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                                                <Clock size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Pending</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Awaiting payment</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-amber-600">{stats.pending}</p>
                                            <p className="text-[9px] text-amber-500 font-semibold">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Overdue */}
                                <div className="group p-3.5 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-100 hover:shadow-md hover:shadow-red-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center">
                                                <AlertCircle size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Overdue</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Past due date</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-red-500">{stats.overdue}</p>
                                            <p className="text-[9px] text-red-400 font-semibold">{stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}%</p>
                                        </div>
                                    </div>
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
