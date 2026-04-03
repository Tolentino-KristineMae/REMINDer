import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    Wallet2,
    Clock,
    CheckCircle2,
    Trash2,
    FileText,
    Mic,
    Play,
    Pause,
    Volume2,
    LayoutGrid,
    LayoutList,
    AlertCircle,
    ArrowUpRight,
    X,
    TrendingUp,
    User,
    Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateLocal } from '../utils/formatters';

const DebtsPage = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [playingAudio, setPlayingAudio] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [activeTab, setActiveTab] = useState('owed'); // 'owed' or 'mine'
    const [selectedPersonId, setSelectedPersonId] = useState('all');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/debts');
            // Ensure we handle both wrapped and unwrapped data
            const debtsData = response.data?.debts || response.data?.data || (Array.isArray(response.data) ? response.data : []);
            setDebts(debtsData);
        } catch (err) {
            console.error('Error fetching debts:', err);
            setError('Failed to load utangs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = (debt) => {
        setDebtToDelete(debt);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!debtToDelete) return;
        setDeleting(true);
        
        const originalDebts = [...debts];
        setDebts(prev => prev.filter(d => d.id !== debtToDelete.id));
        setIsDeleteModalOpen(false);

        try {
            await api.delete(`/debts/${debtToDelete.id}`);
            setDebtToDelete(null);
        } catch (err) {
            console.error('Delete error:', err);
            setDebts(originalDebts);
            setError('Failed to delete utang');
        } finally {
            setDeleting(false);
        }
    };

    const toggleAudio = async (audioPath) => {
        if (!audioRef.current) return;
        if (playingAudio === audioPath) {
            audioRef.current.pause();
            setPlayingAudio(null);
            return;
        }
        try {
            audioRef.current.src = audioPath;
            await audioRef.current.play();
            setPlayingAudio(audioPath);
        } catch (err) {
            console.error("Playback failed:", err);
            setError("Could not play audio");
            setPlayingAudio(null);
        }
    };

    // Filter debts based on active tab and status
    const filteredDebts = Array.isArray(debts) ? debts.filter(d => {
        const isMine = d.is_my_debt;
        if (activeTab === 'mine') return isMine;
        return !isMine;
    }) : [];

    // Further filter by person if in 'owed' tab
    const personFilteredDebts = activeTab === 'owed' && selectedPersonId !== 'all'
        ? filteredDebts.filter(d => d.person_in_charge_id?.toString() === selectedPersonId.toString())
        : filteredDebts;

    const pendingDebts = personFilteredDebts.filter(d => d.status === 'pending');
    const paidDebts = personFilteredDebts.filter(d => d.status === 'paid');

    // Get unique people from 'owed' debts for the person tabs (only unpaid)
    const peopleWithOwedDebts = Array.isArray(debts) 
        ? Object.values(debts.reduce((acc, debt) => {
            if (!debt.is_my_debt && debt.person_in_charge && (debt.status === 'pending' || debt.status === 'overdue')) {
                const personId = debt.person_in_charge.id;
                if (!acc[personId]) {
                    acc[personId] = {
                        ...debt.person_in_charge,
                        count: 0
                    };
                }
                acc[personId].count += 1;
            }
            return acc;
        }, {}))
        : [];

    const calculateTotal = (debtList) => {
        return debtList.reduce((sum, d) => {
            const amount = parseFloat(d.amount);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    };

    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            {/* Image Preview Overlay */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={24} /></button>
                    <img src={previewImage} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Proof" onClick={e => e.stopPropagation()} />
                </div>
            )}

            <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />

            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Header & Main Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex bg-white border border-gray-100 p-1.5 rounded-xl sm:rounded-[1.5rem] shadow-sm">
                            <button 
                                onClick={() => {
                                    setActiveTab('owed');
                                    setSelectedPersonId('all');
                                }} 
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'owed' ? 'bg-green-900 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                Siningilin
                            </button>
                            <button 
                                onClick={() => setActiveTab('mine')} 
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'mine' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                Bayarin
                            </button>
                        </div>

                        <div className="flex bg-white border border-gray-100 p-1 rounded-xl sm:p-1.5 shadow-sm">
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <LayoutList size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/add-debt')} 
                        className="bg-green-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] w-full sm:w-auto"
                    >
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} /> <span className="sm:hidden">New</span><span className="hidden sm:inline">New Entry</span>
                    </button>
                </div>

                {/* Person Filter Tabs (Only for Owed) */}
                {activeTab === 'owed' && peopleWithOwedDebts.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button 
                            onClick={() => setSelectedPersonId('all')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2"
                            style={{ 
                                backgroundColor: selectedPersonId === 'all' ? '#22c55e15' : 'white',
                                borderColor: selectedPersonId === 'all' ? '#22c55e' : 'transparent',
                                color: selectedPersonId === 'all' ? '#22c55e' : '#9ca3af'
                            }}
                        >
                            All Persons
                        </button>
                        {peopleWithOwedDebts.map((person, idx) => {
                            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'];
                            const personColor = person.color || colors[idx % colors.length];
                            const isSelected = selectedPersonId === person.id;
                            return (
                                <button 
                                    key={person.id}
                                    onClick={() => setSelectedPersonId(person.id)}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2"
                                    style={{ 
                                        backgroundColor: isSelected ? personColor + '15' : 'white',
                                        borderColor: isSelected ? personColor : 'transparent',
                                        color: isSelected ? personColor : '#9ca3af'
                                    }}
                                >
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: personColor + '20', color: personColor }}>
                                        {person.count}
                                    </div>
                                    {person.first_name} {person.last_name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-amber-200 transition-all">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                                <Clock size={16} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-50 text-amber-600 rounded-full">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">{pendingDebts.length}</span>
                            </div>
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">
                            {activeTab === 'mine' ? 'Total to Pay' : 'Total to Collect'}
                        </p>
                        <p className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(calculateTotal(pendingDebts))}</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-green-200 transition-all">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                                <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-green-50 text-green-600 rounded-full">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">{paidDebts.length}</span>
                            </div>
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">Total Settled</p>
                        <p className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(calculateTotal(paidDebts))}</p>
                    </div>
                </div>

                {/* Pending Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-gray-900 leading-tight">
                                    {activeTab === 'mine' ? 'My Unpaid Utangs' : 'Active Collections'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {activeTab === 'mine' ? 'Personal financial obligations' : 'Outstanding debts from others'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {pendingDebts.length > 0 ? (
                        <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                            {pendingDebts.map(debt => (
                                <div 
                                    key={debt.id} 
                                    className={`group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300 ${viewMode === 'list' ? "p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6" : ""}`}
                                >
                                    {viewMode === 'grid' && (
                                        <div className="h-40 bg-amber-50/30 flex items-center justify-center border-b border-amber-50 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                                            <Wallet2 size={48} className="text-amber-200 relative z-10" />
                                        </div>
                                    )}
                                    <div className={viewMode === 'grid' ? "p-6" : "flex-1"}>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {debt.is_my_debt ? (
                                                <span className="text-[9px] font-black bg-gray-900 text-white px-3 py-1 rounded-lg uppercase tracking-wider">My Utang</span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-green-600 text-white px-3 py-1 rounded-lg uppercase tracking-wider">Owed to Me</span>
                                            )}
                                            {debt.person_in_charge && (
                                                <span className="text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5" style={{ color: debt.person_in_charge.color || '#2563eb', backgroundColor: (debt.person_in_charge.color || '#2563eb') + '15' }}>
                                                    <User size={10} /> {debt.person_in_charge.first_name} {debt.person_in_charge.last_name}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-gray-900 text-base mb-2 group-hover:text-amber-600 transition-colors">{debt.description}</h4>
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDateLocal(debt.created_at)}</span>
                                        </div>
                                        {viewMode === 'grid' && (
                                            <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                                    <p className="text-xl font-black text-gray-900">{formatCurrency(debt.amount)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => navigate(`/edit-debt/${debt.id}`)} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-all border border-transparent hover:border-blue-100"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(debt)} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/settle-debt/${debt.id}`)} 
                                                        className="bg-green-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 active:scale-95"
                                                    >
                                                        Bayad <ArrowUpRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Balance</p>
                                                <p className="text-lg sm:text-xl font-black text-gray-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => navigate(`/edit-debt/${debt.id}`)} 
                                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-all border border-gray-100"
                                                >
                                                    <Pencil size={18} className="sm:w-5 sm:h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(debt)} 
                                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                                >
                                                    <Trash2 size={18} className="sm:w-5 sm:h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/settle-debt/${debt.id}`)} 
                                                    className="bg-green-900 text-white h-10 sm:h-12 px-4 sm:px-8 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 flex items-center gap-2 sm:gap-3 active:scale-95"
                                                >
                                                    Bayad <span className="hidden sm:inline">Time</span> <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                                <Wallet2 size={40} />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">No Active Records</p>
                        </div>
                    )}
                </section>

                {/* Paid History Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-gray-900 leading-tight">Settlement History</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed personal settlements</p>
                            </div>
                        </div>
                    </div>
                    {paidDebts.length > 0 ? (
                        <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                            {paidDebts.map(debt => (
                                <div 
                                    key={debt.id} 
                                    className={`group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:border-green-400 hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-300 ${viewMode === 'list' ? "p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6" : ""}`}
                                >
                                    {viewMode === 'grid' && (
                                        <div className="h-40 bg-gray-50 relative overflow-hidden group/img">
                                            {debt.proof_image_path ? (
                                                <img src={debt.proof_image_path} className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-500" alt="Proof" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                                                    <FileText size={48} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors" />
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl transform scale-90 group-hover/img:scale-100 transition-transform">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        </div>
                                    )}
                                    <div className={viewMode === 'grid' ? "p-6" : "flex-1"}>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {debt.is_my_debt ? (
                                                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-lg uppercase tracking-wider">My Utang</span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-lg uppercase tracking-wider">Owed to Me</span>
                                            )}
                                            {debt.person_in_charge && (
                                                <span className="text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5" style={{ color: debt.person_in_charge.color || '#2563eb', backgroundColor: (debt.person_in_charge.color || '#2563eb') + '15' }}>
                                                    <User size={10} /> {debt.person_in_charge.first_name} {debt.person_in_charge.last_name}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-gray-900 text-base mb-2">{debt.description}</h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Paid {formatDateLocal(debt.paid_at)}</span>
                                            </div>
                                            {debt.payment_details && (
                                                <p className="text-[10px] font-bold text-gray-500 italic bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 leading-relaxed">
                                                    &ldquo;{debt.payment_details}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                        {viewMode === 'grid' && (
                                            <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-50">
                                                <p className="text-xl font-black text-green-900">{formatCurrency(debt.amount)}</p>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => toggleAudio(debt.proof_voice_path)} 
                                                        disabled={!debt.proof_voice_path} 
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${!debt.proof_voice_path ? 'bg-gray-50 text-gray-200 border-gray-50 cursor-not-allowed opacity-50' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-green-600 hover:text-white hover:border-green-600'}`}
                                                    >
                                                        {playingAudio === debt.proof_voice_path ? <Pause size={16} /> : <Volume2 size={16} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => setPreviewImage(debt.proof_image_path)} 
                                                        disabled={!debt.proof_image_path} 
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${!debt.proof_image_path ? 'bg-gray-50 text-gray-200 border-gray-50 cursor-not-allowed opacity-50' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-green-600 hover:text-white hover:border-green-600'}`}
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(debt)} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Settled</p>
                                                <p className="text-lg sm:text-xl font-black text-green-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleAudio(debt.proof_voice_path)} 
                                                    disabled={!debt.proof_voice_path} 
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl border transition-all ${!debt.proof_voice_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-50' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white border-red-500 shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 hover:border-green-100'}`}
                                                >
                                                    {playingAudio === debt.proof_voice_path ? <Pause size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
                                                </button>
                                                <button 
                                                    onClick={() => setPreviewImage(debt.proof_image_path)} 
                                                    disabled={!debt.proof_image_path} 
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl border transition-all ${!debt.proof_image_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-50' : 'bg-white border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 hover:border-green-100'}`}
                                                >
                                                    <FileText size={18} className="sm:w-5 sm:h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(debt)} 
                                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                                >
                                                    <Trash2 size={18} className="sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">No Settlement History</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Delete Utang?</h3>
                        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                            This action cannot be undone. Are you sure you want to remove <span className="font-black text-red-500">&ldquo;{debtToDelete?.description}&rdquo;</span>?
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={deleting}
                                className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center"
                            >
                                {deleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtsPage;
