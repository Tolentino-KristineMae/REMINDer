import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    Bell, 
    Mail,
    Calendar as CalendarIcon,
    Clock,
    MoreVertical,
    Plus,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CalendarPage = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [viewDate, setViewDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [bills, setBills] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await api.get('/bills/dashboard');
                setBills(response.data.bills);
            } catch (err) {
                console.error('Error fetching bills:', err);
            }
        };

        fetchBills();
    }, []);

    // Helper functions for dates
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getWeekDays = (date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays(currentDate);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setCurrentDate(newDate);
        setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    };

    const handleBillClick = (bill) => {
        if (bill.status === 'pending') {
            navigate(`/settle/${bill.id}`);
        }
    };

    const getBillsForDate = (date) => {
        const dateStr = formatDate(date);
        return bills.filter(bill => bill.due_date.startsWith(dateStr));
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex flex-col">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search calendar..." 
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
                    <h1 className="text-2xl font-black text-green-950 mb-1 tracking-tight">Calendar Overview</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Track your bill due dates and payment schedule</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-3.5 py-1.5 rounded-xl border border-green-100 shadow-sm flex flex-col items-end">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Current Month</span>
                        <span className="text-base font-black text-green-900 leading-none mt-0.5">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Main Calendar Section */}
                <div className="flex-[3] flex flex-col min-w-0">
                    {/* Week Header */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[720px] flex justify-between mb-8 px-4 sm:px-2">
                            {weekDays.map((day, i) => {
                                const isToday = day.toDateString() === new Date().toDateString();
                                const isSelected = day.toDateString() === currentDate.toDateString();
                                const dayBills = getBillsForDate(day);
                                const hasPending = dayBills.some(b => b.status === 'pending');
                                const allPaid = dayBills.length > 0 && dayBills.every(b => b.status === 'paid');
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`flex flex-col items-center cursor-pointer transition-all ${isSelected ? 'scale-110' : ''}`}
                                        onClick={() => {
                                            setCurrentDate(day);
                                            setViewDate(new Date(day.getFullYear(), day.getMonth(), 1));
                                        }}
                                    >
                                        <span className={`text-2xl sm:text-4xl font-bold mb-1 ${isSelected ? 'text-green-900' : 'text-gray-300'}`}>
                                            {day.getDate()}
                                        </span>
                                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-green-900' : 'text-gray-400'}`}>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                                        </span>
                                        <div className="flex gap-1 mt-1 min-h-[6px]">
                                            {isToday && <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>}
                                            {hasPending && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                                            {allPaid && <CheckCircle2 size={8} className="text-green-600" />}
                                        </div>
                                        {hasPending && <span className="text-[8px] font-black text-red-600 mt-1 uppercase tracking-tighter bg-red-50 px-1 rounded">Due</span>}
                                        {allPaid && <span className="text-[8px] font-bold text-green-600 mt-1 uppercase tracking-tighter">Paid</span>}
                                        <div className="h-8 w-[1px] bg-green-100 mt-2"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Simple List View per Day */}
                    <div className="flex-1 min-h-0 overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[720px] flex min-h-0">
                            {weekDays.map((day, dayIndex) => {
                                const dayBills = getBillsForDate(day);
                                return (
                                    <div 
                                        key={dayIndex} 
                                        className={`flex-1 border-l border-green-100/50 px-2 pt-2 pb-8 flex flex-col gap-3 min-w-0 ${day.toDateString() === currentDate.toDateString() ? 'bg-green-50/20' : ''}`}
                                    >
                                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-0">
                                            {dayBills.length > 0 ? (
                                                dayBills.map((bill) => {
                                                    const isPaid = bill.status === 'paid';
                                                    return (
                                                        <div 
                                                            key={bill.id}
                                                            onClick={() => handleBillClick(bill)}
                                                            className={`
                                                                relative rounded-xl p-3 border shadow-sm transition-all hover:scale-[1.02] cursor-pointer shrink-0
                                                                    ${isPaid 
                                                                        ? 'bg-gray-50 border-gray-200 opacity-80' 
                                                                        : 'bg-white border-red-100 shadow-red-100/50 border-l-4 border-l-red-500'
                                                                    }
                                                                `}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex flex-col gap-1">
                                                                    {isPaid ? (
                                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-green-600 uppercase tracking-wider">
                                                                            <CheckCircle2 size={9} /> Paid
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse shadow-md shadow-red-100">
                                                                            <AlertCircle size={9} /> DUE
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <MoreVertical size={12} className="text-gray-400" />
                                                            </div>

                                                            <h4 className={`font-bold text-[11px] mb-1 leading-tight line-clamp-2 ${isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                                {bill.details}
                                                            </h4>
                                                            
                                                            <div className="flex flex-col gap-0.5 mt-2">
                                                                <p className={`text-[9px] font-bold truncate ${isPaid ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    {bill.category?.name}
                                                                </p>
                                                                <p className={`text-[10px] font-black ${isPaid ? 'text-gray-400' : 'text-green-700'}`}>
                                                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bill.amount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-10 select-none pointer-events-none">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest -rotate-90">No Bills</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar with Small Calendar */}
                <div className="w-full lg:w-64 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                    {/* Small Monthly Calendar */}
                    <div className="bg-green-900 rounded-2xl p-4 text-white shadow-lg shadow-green-200/50 shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm">Overview</h3>
                            <button className="p-1 hover:bg-white/10 rounded">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-medium">Activity</h4>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={handlePrevMonth}
                                        className="p-0.5 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">
                                        {monthNames[viewDate.getMonth()].slice(0, 3)}
                                    </span>
                                    <button 
                                        onClick={handleNextMonth}
                                        className="p-0.5 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-0.5 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <span key={d} className="text-[9px] font-bold opacity-50 mb-1">{d}</span>
                                ))}
                                {Array.from({ length: 35 }).map((_, i) => {
                                    const day = i - firstDay + 1;
                                    const isCurrentMonth = day > 0 && day <= daysInMonth;
                                    const hasActivity = isCurrentMonth && getBillsForDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)).length > 0;
                                    const hasPending = isCurrentMonth && getBillsForDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)).some(b => b.status === 'pending');
                                    const isSelected = isCurrentMonth && 
                                        day === currentDate.getDate() && 
                                        viewDate.getMonth() === currentDate.getMonth() && 
                                        viewDate.getFullYear() === currentDate.getFullYear();
                                    const isToday = isCurrentMonth && new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();

                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => isCurrentMonth && handleSelectDate(day)}
                                            className={`
                                                aspect-square flex flex-col items-center justify-center text-[9px] font-bold rounded transition-all cursor-pointer relative
                                                ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : 'hover:bg-white/20'}
                                                ${isSelected ? 'bg-white text-green-900 shadow-md scale-105' : 'text-white/40'}
                                                ${hasActivity && !isSelected ? 'text-white underline decoration-green-400 decoration-1 underline-offset-1' : ''}
                                                ${isToday && !isSelected ? 'border border-white/30 text-white' : ''}
                                            `}
                                        >
                                            {isCurrentMonth ? day : ''}
                                            {hasPending && !isSelected && (
                                                <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full border-[0.5px] border-white"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 text-[9px] font-bold opacity-80">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                                <span>Activity</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                <span>Due Payment</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Bills List */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-gray-800 text-xs">Details</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                            {getBillsForDate(currentDate).length > 0 ? (
                                getBillsForDate(currentDate).map((bill) => {
                                    const isPaid = bill.status === 'paid';
                                    return (
                                        <div 
                                            key={bill.id} 
                                            onClick={() => handleBillClick(bill)}
                                            className="relative group mb-3 last:mb-0"
                                        >
                                            <div className={`
                                                p-4 rounded-[1.5rem] border transition-all relative overflow-hidden
                                                ${isPaid 
                                                    ? 'bg-gray-50/50 border-gray-100 opacity-75' 
                                                    : 'bg-red-50/40 border-red-100 group-hover:bg-red-50 group-hover:border-red-200 group-hover:shadow-xl group-hover:shadow-red-900/5 cursor-pointer shadow-sm'}
                                            `}>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    {!isPaid ? (
                                                        <span className="flex items-center gap-1.5 text-[8px] font-black bg-red-600 text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/20">
                                                            <AlertCircle size={10} className="stroke-[3]" />
                                                            Due
                                                        </span>
                                                    ) : (
                                                        <span className="text-[8px] font-black bg-green-50 text-green-600 px-2.5 py-1 rounded-full uppercase tracking-widest border border-green-100">
                                                            Paid
                                                        </span>
                                                    )}
                                                    
                                                    <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </div>

                                                <div className="space-y-3 relative z-10">
                                                    <h4 className={`font-black text-[13px] leading-tight tracking-tight ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {bill.details}
                                                    </h4>
                                                    
                                                    <div className="flex items-end justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    {bill.category?.name || 'Bill'}
                                                                </p>
                                                                <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">
                                                                    {bill.person_in_charge?.name || 'No PIC'}
                                                                </p>
                                                            </div>
                                                            <p className={`text-base font-black tracking-tighter ${isPaid ? 'text-gray-400' : 'text-red-600'}`}>
                                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bill.amount)}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-xl flex items-center justify-center text-white transition-all shadow-lg ${
                                                            isPaid 
                                                            ? 'w-9 h-9 bg-green-600 shadow-green-600/10' 
                                                            : 'px-4 py-2 bg-green-600 hover:bg-green-700 shadow-green-600/20 group-hover:scale-105 active:scale-95 cursor-pointer'
                                                        }`}>
                                                            {isPaid ? (
                                                                <CheckCircle2 size={18} />
                                                            ) : (
                                                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                                    Settle
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 opacity-40">
                                    <p className="text-[10px] font-bold">No Records</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
