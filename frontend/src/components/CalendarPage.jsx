import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText
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
    const scrollContainerRef = useRef(null);
    const dayRefs = useRef([]);

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

    // Auto-scroll to selected date horizontally without affecting vertical page scroll
    useEffect(() => {
        const selectedIndex = weekDays.findIndex(day => day.toDateString() === currentDate.toDateString());
        if (selectedIndex !== -1 && dayRefs.current[selectedIndex] && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = dayRefs.current[selectedIndex];
            
            // Calculate horizontal offset only
            const containerWidth = container.clientWidth;
            const elementLeft = element.offsetLeft;
            const elementWidth = element.clientWidth;
            
            // Center the element horizontally in the container
            const scrollTo = elementLeft - (containerWidth / 2) + (elementWidth / 2);
            
            container.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    }, [currentDate, weekDays]);

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
        <div className="flex-1 h-[calc(100vh-73px)] lg:h-[calc(100vh-80px)] bg-[#f8fafc] p-3 sm:p-4 lg:p-6 flex flex-col overflow-hidden">

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden custom-scrollbar">
                {/* Main Calendar Section */}
                <div className="flex-[3] flex flex-col min-w-0 min-h-[500px] lg:min-h-0">
                    {/* Elegant Calendar Container with Professional Borders */}
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 relative flex flex-col flex-1 overflow-hidden">
                        {/* Decorative header gradient - Unified in flow to prevent overlap */}
                        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 shrink-0"></div>
                        
                        {/* Unified Day Columns & Header */}
                        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar" ref={scrollContainerRef}>
                            <div className="min-w-[840px] sm:min-w-[980px] lg:min-w-[1120px] flex h-full">
                                {weekDays.map((day, dayIndex) => {
                                    const dayBills = getBillsForDate(day);
                                    const isSelected = day.toDateString() === currentDate.toDateString();
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const hasPending = dayBills.some(b => b.status === 'pending');
                                    const allPaid = dayBills.length > 0 && dayBills.every(b => b.status === 'paid');
                                    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.getDay()];
                                    
                                    return (
                                        <div 
                                            key={dayIndex} 
                                            ref={el => dayRefs.current[dayIndex] = el}
                                            onClick={() => {
                                                setCurrentDate(day);
                                                setViewDate(new Date(day.getFullYear(), day.getMonth(), 1));
                                            }}
                                            className={`
                                                flex-1 min-w-[120px] sm:min-w-[140px] md:min-w-[160px] border-r border-gray-100/80 last:border-r-0 px-2 sm:px-3 py-3 sm:py-6 flex flex-col gap-3 sm:gap-4 relative transition-all duration-500 scroll-mx-4 cursor-pointer group
                                                ${isSelected ? 'bg-gradient-to-b from-green-50 to-white' : isToday ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-white hover:bg-gray-50/30'}
                                            `}
                                        >
                                            {/* Professional Column Divider */}
                                            <div className="absolute top-8 bottom-8 -right-px w-[1px] bg-gradient-to-b from-transparent via-gray-200/60 to-transparent"></div>
                                            
                                            {/* Date badge - Sticky Header for Day */}
                                            <div className={`sticky top-0 z-20 pb-4 sm:pb-5 mb-2 sm:mb-3 flex flex-col items-center gap-3 sm:gap-4 ${
                                                isSelected ? 'bg-green-50' : isToday ? 'bg-emerald-50' : 'bg-white'
                                            }`}>
                                                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] pt-3 sm:pt-4 transition-all duration-300 ${
                                                    isSelected ? 'text-green-600' : isToday ? 'text-emerald-500' : 'text-gray-300 group-hover:text-gray-400'
                                                }`}>
                                                    {dayName}
                                                </span>
                                                <div className={`
                                                    relative w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm
                                                    ${isSelected 
                                                        ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-110 ring-4 ring-green-500/10' 
                                                        : isToday 
                                                            ? 'bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200/60 text-emerald-600' 
                                                            : 'text-gray-400 bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:scale-105 group-hover:border-gray-200'
                                                    }
                                                `}>
                                                    <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter">
                                                        {day.getDate()}
                                                    </span>
                                                    
                                                    {/* Status indicator badge */}
                                                    {(hasPending || allPaid) && (
                                                        <div className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ${hasPending ? 'ring-red-500/20' : 'ring-green-500/20'}`}>
                                                            {hasPending ? (
                                                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>
                                                            ) : (
                                                                <CheckCircle2 size={12} className="text-green-500 sm:size-14" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Professional Horizontal Separator */}
                                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent"></div>
                                            </div>

                                            {/* Bills with organized elegant cards */}
                                            <div className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-y-auto custom-scrollbar pr-0.5 pt-1 sm:pt-2">
                                                {dayBills.length > 0 ? (
                                                    dayBills.map((bill) => {
                                                        const isPaid = bill.status === 'paid';
                                                        return (
                                                            <div 
                                                                key={bill.id}
                                                                onClick={() => handleBillClick(bill)}
                                                                className={`
                                                                    relative rounded-lg sm:rounded-xl p-2 sm:p-3.5 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 w-full min-w-0 overflow-hidden
                                                                    ${isPaid 
                                                                        ? 'bg-gradient-to-br from-gray-50 to-white border border-gray-100/50' 
                                                                        : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-emerald-100/50'
                                                                    }
                                                                `}
                                                            >
                                                                {/* Elegant status accent bar */}
                                                                <div className={`
                                                                    absolute top-0 left-0 right-0 h-0.5 sm:h-1 rounded-t-lg sm:rounded-t-xl
                                                                    ${isPaid ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300' : 'bg-gradient-to-r from-red-400 via-red-500 to-red-400'}
                                                                `}></div>
                                                                
                                                                {/* Status badge */}
                                                                <div className="mt-1 mb-1.5 sm:mt-1.5 sm:mb-2">
                                                                    {isPaid ? (
                                                                        <span className="inline-flex items-center gap-0.5 text-[7px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-100">
                                                                            <CheckCircle2 size={8} className="sm:size-9" /> Paid
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                                                            <AlertCircle size={8} className="sm:size-9" /> DUE
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Bill details - full width */}
                                                                <h4 className={`font-bold text-[10px] sm:text-[12px] mb-1 sm:mb-2 leading-tight ${isPaid ? 'text-gray-400 line-through' : 'text-gray-800'} break-words line-clamp-2`}>
                                                                    {bill.details}
                                                                </h4>
                                                                
                                                                {/* Organized info section */}
                                                                <div className="flex items-end justify-between gap-1 sm:gap-2">
                                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                        <p className={`text-[8px] sm:text-[10px] font-semibold ${isPaid ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                                                            {bill.category?.name}
                                                                        </p>
                                                                        <p className={`text-sm sm:text-lg font-black tracking-tight ${isPaid ? 'text-gray-300' : 'text-emerald-600'} whitespace-nowrap`}>
                                                                            ₱{new Intl.NumberFormat('en-PH').format(bill.amount)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-2 shadow-inner">
                                                            <CalendarIcon size={18} className="text-gray-300" />
                                                        </div>
                                                        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-300 uppercase tracking-widest">No Bills</p>
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
                <div className="w-full lg:w-72 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                    {/* Small Monthly Calendar - Elegant Dark */}
                    <div className="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 rounded-[1.5rem] p-5 text-white shadow-xl shadow-green-900/20 shrink-0 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="flex justify-between items-center mb-5 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <CalendarIcon size={16} className="text-emerald-300" />
                                </div>
                                <h3 className="font-bold text-sm">Overview</h3>
                            </div>
                        </div>

                        <div className="mb-5 relative z-10">
                            {/* Month & Year Display */}
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-semibold text-emerald-200">Calendar</h4>
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                    <button 
                                        onClick={handlePrevMonth}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1 min-w-[60px] text-center">
                                        {monthNames[viewDate.getMonth()].slice(0, 3)} {viewDate.getFullYear().toString().slice(-2)}
                                    </span>
                                    <button 
                                        onClick={handleNextMonth}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <span key={d} className="text-[9px] font-semibold text-emerald-400/60 mb-2">{d}</span>
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
                                                aspect-square flex flex-col items-center justify-center text-[10px] font-semibold rounded-lg transition-all cursor-pointer relative
                                                ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10'}
                                                ${isSelected ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'text-white/50'}
                                                ${hasActivity && !isSelected ? 'text-emerald-300' : ''}
                                                ${isToday && !isSelected ? 'border border-emerald-400/30 text-emerald-300' : ''}
                                            `}
                                        >
                                            {isCurrentMonth ? day : ''}
                                            {hasPending && !isSelected && (
                                                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full shadow-sm shadow-red-500/50"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-[10px] font-semibold text-emerald-200/80 relative z-10 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-300 rounded-sm"></div>
                                <span>Has Bills</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span>Unpaid</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Bills List - Due & Overdue Only */}
                    <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-lg shadow-gray-200/30 flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-5 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center shadow-sm">
                                    <AlertCircle size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Due & Overdue</h3>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Action Required</p>
                                </div>
                            </div>
                            <div className="bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                <span className="text-[10px] font-black text-red-600">
                                    {bills.filter(b => b.status === 'pending').length}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            {bills.filter(b => b.status === 'pending').length > 0 ? (
                                bills
                                    .filter(b => b.status === 'pending')
                                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                    .map((bill) => {
                                        const isOverdue = new Date(bill.due_date) < new Date().setHours(0, 0, 0, 0);
                                        return (
                                            <div 
                                                key={bill.id} 
                                                onClick={() => handleBillClick(bill)}
                                                className="group relative bg-white rounded-2xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                                            >
                                                {/* Overdue accent */}
                                                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isOverdue ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                                
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                                                            {isOverdue ? 'Overdue' : 'Due Soon'}
                                                        </span>
                                                        <h4 className="font-bold text-gray-800 text-[13px] leading-tight line-clamp-2">
                                                            {bill.details}
                                                        </h4>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-lg font-black text-gray-900 tracking-tight">
                                                            ₱{new Intl.NumberFormat('en-PH').format(bill.amount)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-500 uppercase">
                                                            {bill.category?.name || 'Bill'}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                                            {new Date(bill.due_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">All Caught Up!</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">No pending or overdue bills.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-5 mt-auto">
                            <button 
                                onClick={() => navigate('/add-bill')}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 transition-all duration-300"
                            >
                                + Add New Bill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
