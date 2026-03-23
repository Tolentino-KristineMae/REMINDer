import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle,
    FileText,
    Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CalendarPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekStart, setWeekStart] = useState(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        return new Date(now.getFullYear(), now.getMonth(), diff);
    });
    const [bills, setBills] = useState([]);
    const [viewDate, setViewDate] = useState(new Date()); // For mini calendar view

    const fetchBills = async () => {
        try {
            const response = await api.get('/bills/dashboard');
            setBills(response.data.bills);
        } catch (err) {
            console.error('Error fetching bills:', err);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    useEffect(() => {
        const handleFocus = () => fetchBills();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const getWeekDays = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays(weekStart);

    const formatWeekRange = (start) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        const startMonth = start.toLocaleString('default', { month: 'short' });
        const endMonth = end.toLocaleString('default', { month: 'short' });
        
        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${end.getDate()}, ${end.getFullYear()}`;
        }
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    };

    const handlePrevWeek = () => {
        const prev = new Date(weekStart);
        prev.setDate(weekStart.getDate() - 7);
        setWeekStart(prev);
        setCurrentDate(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(weekStart);
        next.setDate(weekStart.getDate() + 7);
        setWeekStart(next);
        setCurrentDate(next);
    };

    const handleToday = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        const start = new Date(now.getFullYear(), now.getMonth(), diff);
        setWeekStart(start);
        setCurrentDate(now);
    };

    const handleSelectDay = (day) => {
        setCurrentDate(day);
        
        // Update week start to match the selected day
        const dayOfWeek = day.getDay();
        const diff = day.getDate() - dayOfWeek;
        const start = new Date(day.getFullYear(), day.getMonth(), diff);
        setWeekStart(start);
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Fill padding
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Fill days
        for (let i = 1; i <= lastDate; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleBillClick = (bill) => {
        if (bill.status === 'pending') {
            navigate(`/settle/${bill.id}`);
        }
    };

    const getBillsForDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return bills.filter(bill => bill.due_date.startsWith(dateStr));
    };

    const selectedDayBills = getBillsForDate(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="flex flex-col lg:flex-row gap-6 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Main Calendar Section */}
                <div className="flex-[3] flex flex-col min-w-0">
                    {/* Week Navigator Header */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/30 border border-gray-100 p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handlePrevWeek}
                                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all hover:scale-105"
                                >
                                    <ChevronLeft size={20} className="text-gray-600" />
                                </button>
                                
                                <div className="text-center min-w-[200px]">
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">
                                        {formatWeekRange(weekStart)}
                                    </h2>
                                </div>
                                
                                <button 
                                    onClick={handleNextWeek}
                                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all hover:scale-105"
                                >
                                    <ChevronRight size={20} className="text-gray-600" />
                                </button>
                            </div>

                            <button 
                                onClick={handleToday}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-green-600/20"
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    {/* Week Days Grid */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 p-4 sm:p-6 flex-1">
                        <div className="grid grid-cols-7 gap-2 sm:gap-4 h-full">
                            {weekDays.map((day, i) => {
                                const isToday = day.toDateString() === new Date().toDateString();
                                const isSelected = day.toDateString() === currentDate.toDateString();
                                const dayBills = getBillsForDate(day);
                                const hasPending = dayBills.some(b => b.status === 'pending');
                                const allPaid = dayBills.length > 0 && dayBills.every(b => b.status === 'paid');
                                
                                return (
                                    <div 
                                        key={i}
                                        onClick={() => handleSelectDay(day)}
                                        className={`
                                            flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                                            ${isSelected 
                                                ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20' 
                                                : isToday 
                                                    ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:shadow-md'
                                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {/* Day Header */}
                                        <div className={`
                                            text-center py-3 border-b
                                            ${isSelected ? 'bg-green-500 text-white' : isToday ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500'}
                                        `}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider">{dayNames[day.getDay()]}</p>
                                        </div>
                                        
                                        {/* Date Number */}
                                        <div className={`
                                            flex-1 flex flex-col items-center justify-center py-4
                                            ${isSelected ? 'bg-green-50' : 'bg-white'}
                                        `}>
                                            <span className={`
                                                text-2xl sm:text-3xl font-black
                                                ${isSelected ? 'text-green-600' : isToday ? 'text-emerald-600' : 'text-gray-700'}
                                            `}>
                                                {day.getDate()}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                                {monthNames[day.getMonth()].slice(0, 3)}
                                            </span>
                                            
                                            {/* Status Indicators */}
                                            <div className="flex items-center gap-1 mt-3">
                                                {hasPending && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-[9px] font-bold text-red-600">{dayBills.filter(b => b.status === 'pending').length}</span>
                                                    </div>
                                                )}
                                                {allPaid && dayBills.length > 0 && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Bills Preview */}
                                        <div className="border-t border-gray-100 p-2 space-y-1 max-h-[120px] overflow-y-auto">
                                            {dayBills.slice(0, 3).map((bill) => (
                                                <div 
                                                    key={bill.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBillClick(bill);
                                                    }}
                                                    className={`
                                                        text-[9px] font-bold px-2 py-1.5 rounded-lg truncate cursor-pointer transition-all
                                                        ${bill.status === 'paid' 
                                                            ? 'bg-gray-100 text-gray-500 line-through' 
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }
                                                    `}
                                                >
                                                    {bill.details}
                                                </div>
                                            ))}
                                            {dayBills.length > 3 && (
                                                <p className="text-[8px] font-bold text-gray-400 text-center">
                                                    +{dayBills.length - 3} more
                                                </p>
                                            )}
                                            {dayBills.length === 0 && (
                                                <p className="text-[8px] font-bold text-gray-300 text-center py-2">No bills</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    {/* Mini Month Calendar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </h3>
                            <div className="flex gap-1">
                                <button 
                                    onClick={handlePrevMonth}
                                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-black text-gray-400 text-center py-1">
                                    {d}
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(viewDate).map((day, i) => {
                                if (!day) return <div key={i} className="h-8" />;
                                
                                const isSelected = day.toDateString() === currentDate.toDateString();
                                const isToday = day.toDateString() === new Date().toDateString();
                                const hasBills = getBillsForDate(day).length > 0;
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectDay(day)}
                                        className={`
                                            h-8 w-full rounded-lg text-[11px] font-bold flex flex-col items-center justify-center relative transition-all
                                            ${isSelected 
                                                ? 'bg-green-600 text-white shadow-md shadow-green-600/20' 
                                                : isToday
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {day.getDate()}
                                        {hasBills && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 flex flex-col overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                                        {dayNames[currentDate.getDay()]}, {monthNames[currentDate.getMonth()]} {currentDate.getDate()}
                                    </h3>
                                    <p className="text-green-100 text-[10px] font-medium mt-0.5">
                                        {selectedDayBills.length} bill{selectedDayBills.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CalendarIcon size={20} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {selectedDayBills.length > 0 ? (
                                selectedDayBills.map((bill) => {
                                    const isPaid = bill.status === 'paid';
                                    return (
                                        <div 
                                            key={bill.id}
                                            onClick={() => handleBillClick(bill)}
                                            className={`
                                                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group
                                                ${isPaid 
                                                    ? 'bg-gray-50 border-gray-100 opacity-75' 
                                                    : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                absolute top-0 left-0 right-0 h-1 rounded-t-xl
                                                ${isPaid ? 'bg-gray-300' : 'bg-red-500'}
                                            `}></div>
                                            
                                            <div className="flex items-start justify-between mt-1">
                                                <div className="flex-1 min-w-0">
                                                    <span className={`
                                                        inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2
                                                        ${isPaid 
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                            : 'bg-red-50 text-red-600 border border-red-100'
                                                        }
                                                    `}>
                                                        {isPaid ? <><CheckCircle2 size={10} /> Paid</> : <><AlertCircle size={10} /> Due</>}
                                                    </span>
                                                    <h4 className={`font-bold text-sm leading-tight mt-2 ${isPaid ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                        {bill.details}
                                                    </h4>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <p className="text-[10px] text-gray-500">
                                                            <span className="font-bold">Charge:</span> {bill.person_in_charge?.name || 'No PIC'}
                                                        </p>
                                                        {isPaid && bill.proof_of_payments?.[0]?.paid_by && (
                                                            <p className="text-[10px] text-green-600">
                                                                <span className="font-bold">Paid By:</span> {bill.proof_of_payments[0].paid_by}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                <p className={`text-lg font-black ${isPaid ? 'text-gray-300' : 'text-emerald-600'}`}>
                                                    ₱{new Intl.NumberFormat('en-PH').format(bill.amount)}
                                                </p>
                                                {!isPaid && (
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                                        Settle
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                                        <CalendarIcon size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400">No bills for this day</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Week Summary</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-300">Pending</span>
                                </div>
                                <span className="text-sm font-black">
                                    {weekDays.reduce((acc, d) => acc + getBillsForDate(d).filter(b => b.status === 'pending').length, 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-300">Paid</span>
                                </div>
                                <span className="text-sm font-black">
                                    {weekDays.reduce((acc, d) => acc + getBillsForDate(d).filter(b => b.status === 'paid').length, 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                <span className="text-xs font-medium text-gray-300">Total Amount</span>
                                <span className="text-sm font-black text-emerald-400">
                                    ₱{new Intl.NumberFormat('en-PH').format(
                                        weekDays.reduce((acc, d) => 
                                            acc + getBillsForDate(d).reduce((sum, b) => sum + parseFloat(b.amount), 0), 0
                                        )
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
