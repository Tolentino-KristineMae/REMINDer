import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';
import { 
    Plus, 
    Wallet2,
    Clock,
    CheckCircle2,
    Trash2,
    FileText,
    Pause,
    Volume2,
    LayoutGrid,
    LayoutList,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    X,
    User,
    Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateLocal } from '../../utils/formatters';
import '../../styles/pages/Utangs/DebtsPage.css';

const DebtsPage = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [debts, setDebts] = useState([]);
    const [stats, setStats] = useState({
        pending_count: 0,
        pending_total: 0,
        paid_count: 0,
        paid_total: 0
    });
    const [peopleWithDebts, setPeopleWithDebts] = useState([]);
    const [pendingViewMode, setPendingViewMode] = useState('list');
    const [paidViewMode, setPaidViewMode] = useState('list');
    const [playingAudio, setPlayingAudio] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [activeTab, setActiveTab] = useState('owed'); // 'owed' or 'mine'
    const [selectedPersonId, setSelectedPersonId] = useState('all');

    const fetchData = useCallback(async () => {
        try {
            const params = {
                type: activeTab,
                person_id: selectedPersonId
            };
            
            const [debtsRes, statsRes] = await Promise.all([
                api.get('/debts', { params }),
                api.get('/debts/stats', { params })
            ]);
            
            const debtsData = debtsRes.data?.debts || [];
            setDebts(debtsData);
            setStats(statsRes.data?.stats || {});
            setPeopleWithDebts(statsRes.data?.people_with_debts || []);
        } catch (err) {
            console.error('Error fetching debts:', err);
        }
    }, [activeTab, selectedPersonId]);

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
            setPlayingAudio(null);
        }
    };

    // Filter debts by status for display
    const pendingDebts = debts.filter(d => d.status === 'pending');
    const paidDebts = debts.filter(d => d.status === 'paid');

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-8">{/* Image Preview Overlay */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={24} /></button>
                    <img src={previewImage} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Proof" onClick={e => e.stopPropagation()} />
                </div>
            )}

            <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />

            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Person Filter + Tab switcher on same row */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Person pills (only for Owed) */}
                    {activeTab === 'owed' && peopleWithDebts.length > 0 && (
                        <>
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
                            {peopleWithDebts.map((person, idx) => {
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
                        </>
                    )}

                    {/* Spacer pushes tab to the right */}
                    <div className="flex-1" />

                    {/* Siningilin / Bayarin tab — right side, same row */}
                    <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm flex-shrink-0">
                        <button 
                            onClick={() => {
                                setActiveTab('owed');
                                setSelectedPersonId('all');
                            }} 
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'owed' ? 'bg-green-900 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Siningilin
                        </button>
                        <button 
                            onClick={() => setActiveTab('mine')} 
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'mine' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Bayarin
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Total to Collect / Total to Pay — Red */}
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Clock size={22} className="text-red-100" />
                                </div>
                                <span className="text-[10px] font-bold text-red-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <ArrowDownRight size={10} /> {stats.pending_count} bills
                                </span>
                            </div>
                            <p className="text-[11px] font-semibold text-red-200 uppercase tracking-wider mb-1">
                                {activeTab === 'mine' ? 'Total to Pay' : 'Total to Collect'}
                            </p>
                            <p className="text-xl sm:text-2xl font-black tracking-tight">{formatCurrency(stats.pending_total)}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <Clock size={12} className="text-red-200" />
                                <p className="text-[10px] text-red-200 font-medium">Pending settlement</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Settled — Green */}
                    <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <CheckCircle2 size={22} className="text-emerald-100" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={10} /> {stats.paid_count} bills
                                </span>
                            </div>
                            <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider mb-1">Total Settled</p>
                            <p className="text-xl sm:text-2xl font-black tracking-tight">{formatCurrency(stats.paid_total)}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={12} className="text-emerald-200" />
                                <p className="text-[10px] text-emerald-200 font-medium">All time settled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
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
                        
                        {/* View Mode Toggle for Pending */}
                        <div className="flex items-center gap-1 bg-red-50/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-red-100">
                            <button 
                                onClick={() => setPendingViewMode('list')}
                                className={`p-1 rounded transition-all ${pendingViewMode === 'list' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                title="List View"
                            >
                                <LayoutList size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                                onClick={() => setPendingViewMode('grid')}
                                className={`p-1 rounded transition-all ${pendingViewMode === 'grid' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                        </div>
                    </div>
                    {pendingDebts.length > 0 ? (
                        <div className={pendingViewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"}>
                            {pendingDebts.map(debt => (
                                <div
                                    key={debt.id}
                                    className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-red-500/8 hover:border-red-200 transition-all duration-200 ${pendingViewMode === 'grid' ? '' : 'flex items-stretch'}`}
                                >
                                    {/* Left accent bar (list only) */}
                                    {pendingViewMode === 'list' && (
                                        <div className="w-1 flex-shrink-0 bg-gradient-to-b from-red-400 to-rose-500 rounded-l-2xl" />
                                    )}

                                    {/* Grid top banner */}
                                    {pendingViewMode === 'grid' && (
                                        <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />
                                    )}

                                    <div className={`flex-1 ${pendingViewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4' : 'flex flex-col p-5'}`}>
                                        {/* Top row: icon + info */}
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Icon avatar */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                                                <Wallet2 size={18} className="text-red-400" />
                                            </div>

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0">
                                                {/* Badges */}
                                                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                    {debt.is_my_debt ? (
                                                        <span className="text-[9px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">My Utang</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Owed to Me</span>
                                                    )}
                                                    {debt.person_in_charge && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1" style={{ color: debt.person_in_charge.color || '#2563eb', backgroundColor: (debt.person_in_charge.color || '#2563eb') + '15' }}>
                                                            <User size={9} /> {debt.person_in_charge.first_name} {debt.person_in_charge.last_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm leading-snug break-words">{debt.title || debt.description}</p>
                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                                                    <Clock size={10} /> {formatDateLocal(debt.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount + actions — stacks below on mobile, inline on sm+ */}
                                        <div className={`flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-50 sm:mt-0 sm:pt-0 sm:border-t-0 ${pendingViewMode === 'list' ? 'sm:flex-shrink-0' : 'mt-4 pt-4 border-t border-gray-50'}`}>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Amount</p>
                                                <p className="text-base font-black text-gray-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/edit-debt/${debt.id}`)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-all border border-gray-100 hover:border-blue-100"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(debt)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 hover:border-red-100"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/settle-debt/${debt.id}`)}
                                                    className="h-9 px-3 sm:px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:from-green-500 hover:to-emerald-500 transition-all shadow-md shadow-green-600/20 flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                                                >
                                                    Bayad <ArrowUpRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl py-16 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                                <Wallet2 size={32} />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">No Active Records</p>
                        </div>
                    )}
                </section>

                {/* Paid History Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 border border-green-200 shadow-sm">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-gray-900 leading-tight">Settlement History</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed personal settlements</p>
                            </div>
                        </div>
                        
                        {/* View Mode Toggle for Paid */}
                        <div className="flex items-center gap-1 bg-green-100/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-green-200">
                            <button 
                                onClick={() => setPaidViewMode('list')}
                                className={`p-1 rounded transition-all ${paidViewMode === 'list' ? 'bg-green-700 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="List View"
                            >
                                <LayoutList size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                                onClick={() => setPaidViewMode('grid')}
                                className={`p-1 rounded transition-all ${paidViewMode === 'grid' ? 'bg-green-700 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                        </div>
                    </div>
                    {paidDebts.length > 0 ? (
                        <div className={paidViewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"}>
                            {paidDebts.map(debt => (
                                <div
                                    key={debt.id}
                                    className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-emerald-500/8 hover:border-emerald-200 transition-all duration-200 ${paidViewMode === 'grid' ? '' : 'flex items-stretch'}`}
                                >
                                    {/* Left accent bar (list only) */}
                                    {paidViewMode === 'list' && (
                                        <div className="w-1 flex-shrink-0 bg-gradient-to-b from-emerald-400 to-green-600 rounded-l-2xl" />
                                    )}

                                    {/* Grid top banner */}
                                    {paidViewMode === 'grid' && (
                                        <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-600" />
                                    )}

                                    <div className={`flex-1 ${paidViewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4' : 'flex flex-col p-5'}`}>
                                        {/* Top row: icon + info */}
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon avatar / proof thumbnail */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                                            {debt.proof_image_path ? (
                                                <img
                                                    src={debt.proof_image_path}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    alt="Proof"
                                                    onClick={() => setPreviewImage(debt.proof_image_path)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main info */}
                                        <div className="flex-1 min-w-0">
                                            {/* Badges */}
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                {debt.is_my_debt ? (
                                                    <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wider">My Utang</span>
                                                ) : (
                                                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Owed to Me</span>
                                                )}
                                                {debt.person_in_charge && (
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1" style={{ color: debt.person_in_charge.color || '#2563eb', backgroundColor: (debt.person_in_charge.color || '#2563eb') + '15' }}>
                                                        <User size={9} /> {debt.person_in_charge.first_name} {debt.person_in_charge.last_name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm leading-snug break-words">{debt.title || debt.description}</p>
                                            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Paid {formatDateLocal(debt.paid_at)}
                                            </p>
                                            {debt.payment_details && (
                                                <p className="text-[10px] text-gray-400 italic mt-1 break-words">
                                                    &ldquo;{debt.payment_details}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                        </div>

                                        {/* Amount + actions — stacks below on mobile */}
                                        <div className={`flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-50 sm:mt-0 sm:pt-0 sm:border-t-0 ${paidViewMode === 'list' ? 'sm:flex-shrink-0' : 'mt-4 pt-4 border-t border-gray-50'}`}>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Settled</p>
                                                <p className="text-base font-black text-emerald-700 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => toggleAudio(debt.proof_voice_path)}
                                                    disabled={!debt.proof_voice_path}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${!debt.proof_voice_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-40 cursor-not-allowed' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'}`}
                                                >
                                                    {playingAudio === debt.proof_voice_path ? <Pause size={14} /> : <Volume2 size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => setPreviewImage(debt.proof_image_path)}
                                                    disabled={!debt.proof_image_path}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${!debt.proof_image_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-40 cursor-not-allowed' : 'bg-white border-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'}`}
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(debt)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 hover:border-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl py-16 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">No Settlement History</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/add-debt')}
                className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-900 text-white rounded-2xl shadow-2xl shadow-green-900/40 flex items-center justify-center hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 group z-40 border-4 border-white"
                title="Add New Utang"
            >
                <Plus size={28} strokeWidth={3} className="group-hover:stroke-[3.5]" />
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                    New Utang
                </span>
            </button>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Delete Utang?</h3>
                        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                            This action cannot be undone. Are you sure you want to remove <span className="font-black text-red-500">&ldquo;{debtToDelete?.title || debtToDelete?.description}&rdquo;</span>?
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



