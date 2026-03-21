import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    ChevronLeft, 
    ChevronRight, 
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
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex flex-col">

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Main Calendar Section */}
                <div className="flex-[3] flex flex-col min-w-0">
                    {/* Modern Calendar Container */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        {/* Week Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-5">
                            <div className="min-w-[720px] flex justify-between">
                                {weekDays.map((day, i) => {
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const isSelected = day.toDateString() === currentDate.toDateString();
                                    const dayBills = getBillsForDate(day);
                                    const hasPending = dayBills.some(b => b.status === 'pending');
                                    const allPaid = dayBills.length > 0 && dayBills.every(b => b.status === 'paid');
                                    
                                    return (
                                        <div 
                                            key={i} 
                                            className={`flex flex-col items-center cursor-pointer transition-all duration-300 group`}
                                            onClick={() => {
                                                setCurrentDate(day);
                                                setViewDate(new Date(day.getFullYear(), day.getMonth(), 1));
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-600 transition-colors">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                                            </span>
                                            <div className={`
                                                relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                                                ${isSelected 
                                                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 scale-110' 
                                                    : isToday 
                                                        ? 'bg-gray-100 border-2 border-green-400/50' 
                                                        : 'hover:bg-gray-50'
                                                }
                                            `}>
                                                <span className={`
                                                    text-base sm:text-xl font-black transition-all
                                                    ${isSelected ? 'text-white' : isToday ? 'text-green-600' : 'text-gray-700'}
                                                `}>
                                                    {day.getDate()}
                                                </span>
                                                {/* Status indicators */}
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                                                        {hasPending ? (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        ) : allPaid ? (
                                                            <CheckCircle2 size={10} className="text-green-500" />
                                                        ) : (
                                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1 mt-2">
                                                {!isSelected && isToday && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>}
                                                {!isSelected && hasPending && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                                                {!isSelected && allPaid && dayBills.length > 0 && <CheckCircle2 size={8} className="text-green-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Day Columns */}
                        <div className="flex-1 min-h-0">
                            <div className="min-w-[720px] flex min-h-[400px]">
                                {weekDays.map((day, dayIndex) => {
                                    const dayBills = getBillsForDate(day);
                                    const isSelected = day.toDateString() === currentDate.toDateString();
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    
                                    return (
                                        <div 
                                            key={dayIndex} 
                                            className={`
                                                flex-1 border-r border-gray-100 last:border-r-0 px-3 py-4 flex flex-col gap-3 min-w-0 relative transition-all duration-300
                                                ${isSelected ? 'bg-green-50/50' : isToday ? 'bg-blue-50/20' : 'bg-white'}
                                            `}
                                        >
                                            {/* Column separator */}
                                            <div className="absolute top-0 bottom-0 -right-px w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                                            
                                            {/* Date label */}
                                            <div className="text-center mb-2">
                                                <span className={`
                                                    text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                                                    ${isSelected ? 'bg-green-100 text-green-700' : isToday ? 'bg-blue-100 text-blue-600' : 'text-gray-400 bg-gray-50'}
                                                `}>
                                                    {day.getDate()}
                                                </span>
                                            </div>

                                            {/* Bills list */}
                                            <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
                                                {dayBills.length > 0 ? (
                                                    dayBills.map((bill) => {
                                                        const isPaid = bill.status === 'paid';
                                                        return (
                                                            <div 
                                                                key={bill.id}
                                                                onClick={() => handleBillClick(bill)}
                                                                className={`
                                                                    relative rounded-2xl p-4 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg
                                                                    ${isPaid 
                                                                        ? 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200' 
                                                                        : 'bg-white border border-gray-200 hover:border-green-300 hover:shadow-green-100/50'
                                                                    }
                                                                `}
                                                            >
                                                                {/* Status bar */}
                                                                <div className={`
                                                                    absolute top-0 left-0 right-0 h-1 rounded-t-2xl
                                                                    ${isPaid ? 'bg-gradient-to-r from-gray-300 to-gray-400' : 'bg-gradient-to-r from-red-400 to-red-500'}
                                                                `}></div>
                                                                
                                                                <div className="flex justify-between items-start mb-3 mt-1">
                                                                    {isPaid ? (
                                                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full">
                                                                            <CheckCircle2 size={10} /> Paid
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/20">
                                                                            <AlertCircle size={10} /> DUE
                                                                        </span>
                                                                    )}
                                                                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                                                                        <MoreVertical size={14} />
                                                                    </button>
                                                                </div>

                                                                <h4 className={`font-bold text-sm mb-2 leading-tight line-clamp-2 ${isPaid ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                                    {bill.details}
                                                                </h4>
                                                                
                                                                <div className="flex flex-col gap-2 mt-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className={`text-[10px] font-bold truncate ${isPaid ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                            {bill.category?.name}
                                                                        </p>
                                                                    </div>
                                                                    <p className={`text-lg font-black tracking-tight ${isPaid ? 'text-gray-400' : 'text-green-600'}`}>
                                                                        ₱{new Intl.NumberFormat('en-PH').format(bill.amount)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                                            <CalendarIcon size={20} className="text-gray-300" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Bills</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
