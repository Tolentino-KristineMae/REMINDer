import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
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
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';
import UnpaidBillsByCategory from '../../components/Dashboard/UnpaidBillsByCategory';
import '../../styles/pages/Dashboard/Dashboard.css';

// ─── Settlement Card ────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

const DonutSegment = ({ offset, dash, color, delay = 0 }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.strokeDashoffset = CIRCUMFERENCE;
        const t = setTimeout(() => {
            el.style.transition = `stroke-dashoffset 1s cubic-bezier(.4,0,.2,1) ${delay}ms`;
            el.style.strokeDashoffset = offset;
        }, 60);
        return () => clearTimeout(t);
    }, [offset, delay]);

    return (
        <circle
            ref={ref}
            cx="64" cy="64" r="54"
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            style={{ strokeDashoffset: CIRCUMFERENCE }}
            transform="rotate(-90 64 64)"
        />
    );
};

const SettlementCard = ({ stats }) => {
    const total = stats.total || 1;
    const paidPct   = stats.paid    / total;
    const pendPct   = stats.pending / total;
    const overPct   = stats.overdue / total;

    // Each segment: dash = fraction * circumference, offset = -(sum of previous dashes)
    const paidDash  = paidPct  * CIRCUMFERENCE;
    const pendDash  = pendPct  * CIRCUMFERENCE;
    const overDash  = overPct  * CIRCUMFERENCE;

    // Offsets: rotate so each segment starts after the previous
    const paidOffset  = 0;
    const pendOffset  = -(paidDash);
    const overOffset  = -(paidDash + pendDash);

    const displayPct = Math.round(paidPct * 100);

    const rows = [
        {
            label: 'Paid',
            sub: 'Settled',
            count: stats.paid,
            pct: Math.round(paidPct * 100),
            color: '#10b981',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            textColor: 'text-emerald-600',
            barColor: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
            icon: <CheckCircle2 size={15} className="text-emerald-600" />,
        },
        {
            label: 'Pending',
            sub: 'Awaiting',
            count: stats.pending,
            pct: Math.round(pendPct * 100),
            color: '#f59e0b',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            textColor: 'text-amber-600',
            barColor: 'bg-gradient-to-r from-amber-400 to-amber-500',
            icon: <Clock size={15} className="text-amber-500" />,
        },
        {
            label: 'Overdue',
            sub: 'Past due',
            count: stats.overdue,
            pct: Math.round(overPct * 100),
            color: '#ef4444',
            bg: 'bg-red-50',
            border: 'border-red-100',
            textColor: 'text-red-500',
            barColor: 'bg-gradient-to-r from-red-400 to-red-500',
            icon: <AlertCircle size={15} className="text-red-500" />,
        },
    ];

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Settlement</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Bill payment overview</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-5 py-5 gap-5">
                {/* Donut chart */}
                <div className="relative w-[128px] h-[128px] mx-auto flex-shrink-0">
                    <svg viewBox="0 0 128 128" className="w-full h-full">
                        <defs>
                            <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Track */}
                        <circle cx="64" cy="64" r="54" fill="none" stroke="#f1f5f9" strokeWidth="11" />

                        {/* Segments */}
                        {stats.total > 0 ? (
                            <>
                                <DonutSegment dash={paidDash}  offset={paidOffset}  color="#10b981" delay={0}   />
                                <DonutSegment dash={pendDash}  offset={pendOffset}  color="#f59e0b" delay={120} />
                                <DonutSegment dash={overDash}  offset={overOffset}  color="#ef4444" delay={240} />
                            </>
                        ) : (
                            <circle cx="64" cy="64" r="54" fill="none" stroke="#e2e8f0" strokeWidth="11" strokeDasharray="4 6" />
                        )}

                        {/* Inner shadow ring */}
                        <circle cx="64" cy="64" r="48" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </svg>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[28px] font-black text-gray-900 leading-none tracking-tight">{displayPct}</span>
                        <span className="text-[11px] font-bold text-emerald-500 leading-none mt-0.5">% paid</span>
                        <span className="text-[9px] text-gray-400 font-medium mt-1">{stats.total} total</span>
                    </div>
                </div>

                {/* Stat rows */}
                <div className="flex flex-col gap-2.5 flex-1">
                    {rows.map((r) => (
                        <div
                            key={r.label}
                            className={`${r.bg} ${r.border} border rounded-2xl px-3.5 py-3 flex flex-col gap-2`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                                        {r.icon}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-800 leading-none">{r.label}</p>
                                        <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">{r.sub}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-black ${r.textColor} leading-none`}>{r.count}</span>
                                    <span className={`text-[10px] font-bold ${r.textColor} opacity-70 ml-1`}>{r.pct}%</span>
                                </div>
                            </div>
                            {/* Mini progress bar */}
                            <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${r.barColor} rounded-full transition-all duration-700`}
                                    style={{ width: `${r.pct}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
// ────────────────────────────────────────────────────────────────────────────

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
    const [historicalData, setHistoricalData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardRes = await api.get('/bills/dashboard');
                const { stats: statsData, categories: categoriesData, historical: historicalDataRes } = dashboardRes.data || {};
                
                setStats({
                    total: statsData?.total || 0,
                    paid: statsData?.paid || 0,
                    pending: statsData?.pending || 0,
                    overdue: statsData?.overdue || 0,
                    total_amount: statsData?.total_amount || 0,
                    total_paid_amount: statsData?.total_paid_amount || 0,
                    total_unpaid_amount: statsData?.total_unpaid_amount || 0,
                });
                
                setCategories(categoriesData || []);
                setHistoricalData(historicalDataRes || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-3 sm:p-4 lg:p-6 relative">
            {/* Stats Grid - 2x2 on Mobile, 4 columns on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6">
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
                {/* Categories Analytics Card with Chart */}
                <div className="xl:col-span-9 space-y-6 w-full overflow-hidden">
                    <UnpaidBillsByCategory categories={categories} historicalData={historicalData} />
                </div>

                {/* Settlement Card */}
                <div className="xl:col-span-3 w-full">
                    <SettlementCard stats={stats} />
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
