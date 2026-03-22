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
    const billsListRef = useRef(null);
    const calendarScrollRef = useRef(null);

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

    // Initial scroll to current day on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToDayColumn(currentDate);
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (billsListRef.current) {
                const container = billsListRef.current;
                const bills = container.querySelectorAll('[data-bill-id]');
                
                if (bills.length > 0) {
                    const containerHeight = container.clientHeight;
                    const containerTop = container.scrollTop;
                    const firstBill = bills[0];
                    const elementTop = firstBill.offsetTop;
                    const scrollTo = elementTop - (containerHeight / 2) + (firstBill.clientHeight / 2);
                    
                    container.scrollTo({
                        top: Math.max(0, scrollTo),
                        behavior: 'smooth'
                    });
                }
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [currentDate]);

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

    const scrollToDayColumn = (date) => {
        const dayIndex = date.getDay(); // 0 = Sunday
        const containers = document.querySelectorAll('.calendar-scroll-container');
        
        containers.forEach(container => {
            if (container) {
                const containerWidth = container.clientWidth;
                const totalWidth = container.scrollWidth;
                const dayWidth = totalWidth / 7;
                const targetPosition = dayIndex * dayWidth;
                const centerOffset = containerWidth / 2 - dayWidth / 2;
                const scrollTo = targetPosition - centerOffset;
                
                container.scrollTo({
                    left: Math.max(0, Math.min(scrollTo, totalWidth - containerWidth)),
                    behavior: 'smooth'
                });
            }
        });
        
        // Scroll bills list to top
        if (billsListRef.current) {
            billsListRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const handleSelectDate = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setCurrentDate(newDate);
        setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        
        setTimeout(() => {
            scrollToDayColumn(newDate);
        }, 150);
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
        <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Main Calendar Section */}
                <div className="flex-[3] flex flex-col min-w-0">
                    {/* Elegant Calendar Container */}
                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/40 border border-white/80 relative flex flex-col">
                        {/* Decorative header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600"></div>
                        
                        {/* Week Header */}
                        <div className="bg-gradient-to-b from-white to-gray-50/30 px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100/50 overflow-x-auto calendar-scroll-container">
                            <div className="min-w-[720px] flex justify-between items-end">
                                {weekDays.map((day, i) => {
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const isSelected = day.toDateString() === currentDate.toDateString();
                                    const dayBills = getBillsForDate(day);
                                    const hasPending = dayBills.some(b => b.status === 'pending');
                                    const allPaid = dayBills.length > 0 && dayBills.every(b => b.status === 'paid');
                                    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.getDay()];
                                    
                                    return (
                                        <div 
                                            key={i} 
                                            className={`flex flex-col items-center cursor-pointer transition-all duration-500 group`}
                                            onClick={() => {
                                                setCurrentDate(day);
                                                setViewDate(new Date(day.getFullYear(), day.getMonth(), 1));
                                                setTimeout(() => scrollToDayColumn(day), 150);
                                            }}
                                        >
                                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-4 transition-all duration-300 ${
                                                isSelected ? 'text-green-600' : isToday ? 'text-emerald-500' : 'text-gray-300 group-hover:text-gray-500'
                                            }`}>
                                                {dayName}
                                            </span>
                                            <div className={`
                                                relative w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500
                                                ${isSelected 
                                                    ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 shadow-xl shadow-green-500/25 scale-110 ring-4 ring-green-500/10' 
                                                    : isToday 
                                                        ? 'bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200/60 shadow-lg shadow-emerald-500/10' 
                                                        : 'hover:bg-gray-50 hover:scale-105'
                                                }
                                            `}>
                                                <span className={`
                                                    text-xl sm:text-2xl font-bold tracking-tight transition-all duration-300
                                                    ${isSelected ? 'text-white drop-shadow-sm' : isToday ? 'text-emerald-600' : 'text-gray-600'}
                                                `}>
                                                    {day.getDate()}
                                                </span>
                                                {/* Elegant status indicator */}
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-500/20">
                                                        {hasPending ? (
                                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>
                                                        ) : allPaid ? (
                                                            <CheckCircle2 size={12} className="text-green-500" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-sm shadow-blue-500/50"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Subtle dots for status */}
                                            <div className="flex gap-1.5 mt-4">
                                                {!isSelected && isToday && <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-500/50"></div>}
                                                {!isSelected && hasPending && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>}
                                                {!isSelected && allPaid && dayBills.length > 0 && <CheckCircle2 size={10} className="text-emerald-400" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Day Columns - Refined */}
                        <div className="flex-1 min-h-0 overflow-auto calendar-scroll-container" ref={calendarScrollRef}>
                            <div className="min-w-[720px] flex">
                                {weekDays.map((day, dayIndex) => {
                                    const dayBills = getBillsForDate(day);
                                    const isSelected = day.toDateString() === currentDate.toDateString();
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    
                                    return (
                                        <div 
                                            key={dayIndex} 
                                            className={`
                                                flex-1 min-w-[120px] sm:min-w-[160px] md:min-w-[180px] border-r border-gray-100/60 last:border-r-0 px-1.5 sm:px-3 py-2 sm:py-4 flex flex-col gap-2 sm:gap-3 relative transition-all duration-500 overflow-hidden
                                                ${isSelected ? 'bg-gradient-to-b from-green-50/80 to-white' : isToday ? 'bg-gradient-to-b from-emerald-50/30 to-white' : 'bg-white'}
                                            `}
                                        >
                                            {/* Elegant column divider */}
                                            <div className="absolute top-4 bottom-4 -right-px w-px bg-gradient-to-b from-transparent via-gray-200/50 to-transparent"></div>
                                            
                                            {/* Date badge */}
                                            <div className="text-center shrink-0">
                                                <span className={`
                                                    inline-block text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full transition-all duration-300
                                                    ${isSelected 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20' 
                                                        : isToday 
                                                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 border border-emerald-200/50' 
                                                            : 'text-gray-400 bg-gray-50 border border-gray-100'
                                                    }
                                                `}>
                                                    {day.getDate()}
                                                </span>
                                            </div>

                                            {/* Bills with organized elegant cards */}
                                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
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
                                                                        <p className={`text-[8px] sm:text-[10px] font-bold ${isPaid ? 'text-gray-400' : 'text-gray-500'} truncate`}>
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
                                                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-widest">No Bills</p>
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
                                <h3 className="font-bold text-xs uppercase tracking-wider">Overview</h3>
                            </div>
                        </div>

                        <div className="mb-5 relative z-10">
                            {/* Month & Year Display */}
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Calendar</h4>
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                    <button 
                                        onClick={handlePrevMonth}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-1 min-w-[60px] text-center">
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
                                    <span key={d} className="text-[9px] font-bold text-emerald-400/60 mb-2">{d}</span>
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
                                                aspect-square flex flex-col items-center justify-center text-[10px] font-bold rounded-lg transition-all cursor-pointer relative
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

                        <div className="flex flex-col gap-2 text-[10px] font-bold text-emerald-200/80 relative z-10 pt-3 border-t border-white/10">
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

                    {/* Sidebar Bills List - Elegant & Organized */}
                    <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-lg shadow-gray-200/30 flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg flex items-center justify-center">
                                    <FileText size={16} className="text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Bills for {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getDate()}</h3>
                            </div>
                        </div>

                        <div ref={billsListRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            {getBillsForDate(currentDate).length > 0 ? (
                                getBillsForDate(currentDate).map((bill) => {
                                    const isPaid = bill.status === 'paid';
                                    return (
                                        <div 
                                            key={bill.id} 
                                            data-bill-id={bill.id}
                                            onClick={() => handleBillClick(bill)}
                                            className="relative group"
                                        >
                                            <div className={`
                                                p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                                ${isPaid 
                                                    ? 'bg-gray-50/50 border-gray-100 opacity-70' 
                                                    : 'bg-white border border-gray-100 group-hover:border-emerald-200 group-hover:shadow-xl group-hover:shadow-emerald-900/5 cursor-pointer shadow-sm hover:-translate-y-0.5'}
                                            `}>
                                                {/* Status accent bar */}
                                                <div className={`
                                                    absolute top-0 left-0 right-0 h-1
                                                    ${isPaid ? 'bg-gradient-to-r from-gray-300 to-gray-400' : 'bg-gradient-to-r from-red-400 to-red-500'}
                                                `}></div>
                                                
                                                {/* Status badge */}
                                                <div className="mt-2 mb-3">
                                                    {!isPaid ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/20">
                                                            <AlertCircle size={10} className="stroke-[3]" />
                                                            Unpaid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                                                            <CheckCircle2 size={10} />
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Bill title */}
                                                <div className="relative z-10">
                                                    <h4 className={`font-bold text-[13px] leading-snug tracking-tight mb-3 ${isPaid ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                        {bill.details}
                                                    </h4>
                                                    
                                                    {/* Organized info row */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    {bill.category?.name || 'Bill'}
                                                                </p>
                                                                <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                                    {bill.person_in_charge?.name || 'No PIC'}
                                                                </p>
                                                            </div>
                                                            <p className={`text-lg font-black tracking-tight ${isPaid ? 'text-gray-300' : 'text-emerald-600'}`}>
                                                                ₱{new Intl.NumberFormat('en-PH').format(bill.amount)}
                                                            </p>
                                                        </div>

                                                        {/* Action button */}
                                                        <div className={`rounded-xl flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
                                                            isPaid 
                                                            ? 'w-10 h-10 bg-gray-300 shadow-gray-300/10' 
                                                            : 'px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20 group-hover:scale-105 active:scale-95 cursor-pointer'
                                                        }`}>
                                                            {isPaid ? (
                                                                <CheckCircle2 size={18} />
                                                            ) : (
                                                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
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
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                        <CalendarIcon size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No Bills This Day</p>
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
