import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { 
    Check,
    CheckCircle2, 
    ChevronLeft, 
    ExternalLink,
    FileText,
    Calendar,
    ArrowUpRight,
    MoreHorizontal,
    Plus,
    Filter,
    AlertCircle,
    Mic,
    LayoutGrid,
    LayoutList,
    Play,
    Pause,
    Volume2,
    X,
    Edit2,
    Trash2,
    Receipt,
    Users,
    Clock,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateLocal } from '../../utils/formatters';

const BillItem = React.memo(({ 
    bill, 
    editingBill, 
    editBillData, 
    setEditBillData, 
    handleSaveBill, 
    handleCancelEdit, 
    handleEditBill, 
    confirmDelete, 
    handleUploadClick, 
    categories, 
    people, 
    saving,
    isPending = true,
    toggleAudio,
    playingAudio,
    handleViewProof
}) => {
    if (editingBill === bill.id) {
        return (
            <div className="group bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 hover:border-red-200 hover:shadow-xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative overflow-hidden">
                <div className="flex-1 relative z-10 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editBillData.amount}
                                onChange={(e) => setEditBillData({ ...editBillData, amount: e.target.value })}
                                className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Due Date</label>
                            <input
                                type="date"
                                value={editBillData.due_date}
                                onChange={(e) => setEditBillData({ ...editBillData, due_date: e.target.value })}
                                className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Details</label>
                            <input
                                type="text"
                                value={editBillData.details}
                                onChange={(e) => setEditBillData({ ...editBillData, details: e.target.value })}
                                className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                            <select
                                value={editBillData.category_id}
                                onChange={(e) => setEditBillData({ ...editBillData, category_id: e.target.value })}
                                className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Person In Charge</label>
                            <select
                                value={editBillData.person_in_charge_id}
                                onChange={(e) => setEditBillData({ ...editBillData, person_in_charge_id: e.target.value })}
                                className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            >
                                <option value="">Select person</option>
                                {people.map(person => (
                                    <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:gap-3 relative z-10">
                    <button 
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-[9px] sm:text-[10px] uppercase hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleSaveBill(bill.id)}
                        disabled={saving}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-black text-[9px] sm:text-[10px] uppercase hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-1"
                    >
                        {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={12} /> Save</>}
                    </button>
                </div>
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-red-200 transition-all duration-200 flex items-stretch">
                {/* Left accent */}
                <div className="w-1 flex-shrink-0 bg-gradient-to-b from-red-400 to-rose-500 rounded-l-2xl" />

                <div className="flex-1 flex items-center gap-3 sm:gap-4 px-4 py-3.5">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                        <Receipt size={17} className="text-red-400" strokeWidth={2.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-snug truncate">{bill.details}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 whitespace-nowrap">
                                <Calendar size={10} className="text-red-400" /> {formatDateLocal(bill.due_date)}
                            </span>
                            <span className="text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap" style={{ color: bill.person_in_charge?.color || '#2563eb' }}>
                                <Users size={10} style={{ color: bill.person_in_charge?.color || '#2563eb' }} />
                                {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                            </span>
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{
                                    color: bill.category?.color || '#dc2626',
                                    backgroundColor: (bill.category?.color || '#dc2626') + '18',
                                }}
                            >
                                {bill.category?.name}
                            </span>
                        </div>
                    </div>

                    {/* Amount + actions */}
                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-red-600 leading-none">{formatCurrency(bill.amount)}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Due</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleEditBill(bill)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmDelete(bill)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                            >
                                <Trash2 size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUploadClick(bill)}
                                className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:from-green-500 hover:to-emerald-500 transition-all shadow-md shadow-green-600/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                            >
                                Settle <ArrowUpRight size={12} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Settled Item
    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex items-stretch">
            {/* Left accent */}
            <div className="w-1 flex-shrink-0 bg-gradient-to-b from-emerald-400 to-green-600 rounded-l-2xl" />

            <div className="flex-1 flex items-center gap-3 sm:gap-4 px-4 py-3.5">
                {/* Proof thumbnail or icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                    {bill.proof_of_payments?.[0]?.file_path ? (
                        <img
                            src={bill.proof_of_payments[0].file_path}
                            className="w-full h-full object-cover cursor-pointer"
                            alt="Proof"
                            onClick={() => handleViewProof(bill.proof_of_payments[0].file_path)}
                        />
                    ) : (
                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 size={17} className="text-emerald-400" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-snug truncate">{bill.details}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {bill.proof_of_payments?.[0]?.created_at && (
                            <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 size={10} /> {formatDateLocal(bill.proof_of_payments[0].created_at)}
                            </span>
                        )}
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 whitespace-nowrap">
                            <Calendar size={10} className="text-red-400" /> {formatDateLocal(bill.due_date)}
                        </span>
                        <span className="text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap" style={{ color: bill.person_in_charge?.color || '#2563eb' }}>
                            <Users size={10} style={{ color: bill.person_in_charge?.color || '#2563eb' }} />
                            {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                        </span>
                        <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                                color: bill.category?.color || '#16a34a',
                                backgroundColor: (bill.category?.color || '#16a34a') + '18',
                            }}
                        >
                            {bill.category?.name}
                        </span>
                    </div>
                </div>

                {/* Amount + actions */}
                <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-emerald-700 leading-none">{formatCurrency(bill.amount)}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Paid</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => bill.proof_of_payments?.[0]?.file_path && handleViewProof(bill.proof_of_payments[0].file_path)}
                            disabled={!bill.proof_of_payments?.[0]?.file_path}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all border ${
                                !bill.proof_of_payments?.[0]?.file_path
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-40'
                                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            }`}
                        >
                            <FileText size={13} />
                        </button>
                        <button
                            onClick={() => bill.proof_of_payments?.[0]?.voice_record_path && toggleAudio(bill.proof_of_payments[0].voice_record_path)}
                            disabled={!bill.proof_of_payments?.[0]?.voice_record_path}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all border ${
                                !bill.proof_of_payments?.[0]?.voice_record_path
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-40'
                                : playingAudio === bill.proof_of_payments?.[0]?.voice_record_path
                                ? 'bg-red-500 text-white border-red-500 shadow-md'
                                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            }`}
                            title={bill.proof_of_payments?.[0]?.voice_record_path ? 'Play voice note' : 'No voice note'}
                        >
                            {playingAudio === bill.proof_of_payments?.[0]?.voice_record_path
                                ? <Pause size={13} />
                                : <Volume2 size={13} />
                            }
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmDelete(bill)}
                            className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const SettlementsPage = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [bills, setBills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [people, setPeople] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [pendingViewMode, setPendingViewMode] = useState('list');
    const [playingAudio, setPlayingAudio] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [editingBill, setEditingBill] = useState(null);
    const [editBillData, setEditBillData] = useState({ amount: '', due_date: '', details: '', category_id: '', person_in_charge_id: '', status: 'pending' });
    const [saving, setSaving] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState('all');

    const STORAGE_BASE_URL = (() => {
        const a = import.meta.env.VITE_STORAGE_BASE_URL?.trim();
        if (a) {
            return a.replace(/\/+$/, '');
        }
        const b = import.meta.env.VITE_BACKEND_BASE_URL?.trim();
        if (b) {
            return b.replace(/\/+$/, '');
        }
        const api = import.meta.env.VITE_API_BASE_URL?.trim();
        if (api) {
            const origin = api.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
            if (origin) {
                return origin;
            }
        }
        if (import.meta.env.DEV) {
            return 'http://localhost:8000';
        }
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'http://localhost:8000';
    })();

    const buildStorageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${STORAGE_BASE_URL.replace(/\/$/, '')}/storage/${path}`;
    };

    const fetchPaidBills = React.useCallback(async () => {
        try {
            const response = await api.get('/bills/full');
            const data = response.data || {};
            let billsData = data.bills;
            let peopleData = data.people;
            
            if (billsData?.data) billsData = billsData.data;
            if (peopleData?.data) peopleData = peopleData.data;
            
            setBills(Array.isArray(billsData) ? billsData : []);
            setPeople(Array.isArray(peopleData) ? peopleData : []);
            
            // Extract unique categories from bills instead of separate API call
            const uniqueCategories = [];
            const categoryMap = new Map();
            
            if (Array.isArray(billsData)) {
                billsData.forEach(bill => {
                    if (bill.category && !categoryMap.has(bill.category.id)) {
                        categoryMap.set(bill.category.id, bill.category);
                        uniqueCategories.push(bill.category);
                    }
                });
            }
            
            setCategories(uniqueCategories);
        } catch (err) {
            console.error('Error fetching bills:', err);
            setBills([]);
            setPeople([]);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        fetchPaidBills();
    }, [fetchPaidBills]);

    useEffect(() => {
        const handleFocus = () => fetchPaidBills();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchPaidBills]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const toggleAudio = async (audioPath) => {
        if (!audioRef.current) return;
        
        const fullUrl = buildStorageUrl(audioPath);
        
        // If clicking the same audio that's already playing, stop it
        if (playingAudio === audioPath) {
            audioRef.current.pause();
            setPlayingAudio(null);
            return;
        }

        try {
            // Stop any current audio
            audioRef.current.pause();
            
            // Explicitly set the source and load it
            audioRef.current.src = fullUrl;
            audioRef.current.load();
            
            // We need to wait for a user interaction to play, which this click is.
            // But we also handle the promise returned by play().
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                setPlayingAudio(audioPath);
            }
        } catch (err) {
            console.error("Detailed audio playback error:", {
                error: err,
                url: fullUrl,
                path: audioPath
            });
            setError(`Playback failed: ${err.message || "Unknown error"}. Check if the file is public in Supabase.`);
            setPlayingAudio(null);
        }
    };

    // Removed the separate useEffect for playingAudio to avoid double-play or race conditions

    const safeBills = Array.isArray(bills) ? bills : [];
    const pendingBills = safeBills.filter(bill => bill?.status === 'pending');
    const settledBills = safeBills.filter(bill => bill?.status === 'paid');

    const peopleWithPendingBills = Array.isArray(pendingBills) 
        ? Object.values(pendingBills.reduce((acc, bill) => {
            if (bill.person_in_charge) {
                const personId = bill.person_in_charge.id;
                if (!acc[personId]) {
                    acc[personId] = {
                        ...bill.person_in_charge,
                        count: 0
                    };
                }
                acc[personId].count++;
            }
            return acc;
        }, {}))
        : [];

    const peopleWithSettledBills = Array.isArray(settledBills) 
        ? Object.values(settledBills.reduce((acc, bill) => {
            if (bill.person_in_charge) {
                const personId = bill.person_in_charge.id;
                if (!acc[personId]) {
                    acc[personId] = {
                        ...bill.person_in_charge,
                        count: 0
                    };
                }
                acc[personId].count++;
            }
            return acc;
        }, {}))
        : [];

    const filteredPendingBills = selectedPersonId === 'all' 
        ? pendingBills 
        : pendingBills.filter(b => b.person_in_charge_id === selectedPersonId);
    const filteredSettledBills = selectedPersonId === 'all' 
        ? settledBills 
        : settledBills.filter(b => b.person_in_charge_id === selectedPersonId);

    const totalSettled = filteredSettledBills.reduce((acc, b) => acc + (parseFloat(b?.amount) || 0), 0);
    const totalPending = filteredPendingBills.reduce((acc, b) => acc + (parseFloat(b?.amount) || 0), 0);

    const handleUploadClick = (bill) => {
        navigate(`/settle/${bill.id}`);
    };

    const handleViewProof = (filePath) => {
        setPreviewImage(buildStorageUrl(filePath));
    };

    const confirmDelete = (bill) => {
        setBillToDelete(bill);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!billToDelete) return;
        
        const originalBills = [...bills];
        // Optimistic update: remove from UI immediately
        setBills(prev => prev.filter(b => b.id !== billToDelete.id));
        setIsDeleteModalOpen(false);
        
        try {
            await api.delete(`/bills/${billToDelete.id}`);
            setBillToDelete(null);
        } catch (err) {
            console.error('Delete error:', err);
            // Revert on error
            setBills(originalBills);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete transaction. Please try again.';
            setError(errorMsg);
        }
    };

    const handleEditBill = (bill) => {
        setEditingBill(bill.id);
        setEditBillData({
            amount: bill.amount,
            due_date: bill.due_date,
            details: bill.details,
            category_id: bill.category_id || '',
            person_in_charge_id: bill.person_in_charge_id || '',
            status: bill.status || 'pending'
        });
    };

    const handleSaveBill = async (id) => {
        const originalBills = [...bills];
        const originalBill = bills.find(b => b.id === id);
        
        // Optimistic update
        setBills(prev => prev.map(b => {
            if (b.id === id) {
                return {
                    ...b,
                    ...editBillData,
                    // Preserve existing related objects for immediate UI consistency
                    category: categories.find(c => c.id == editBillData.category_id) || b.category,
                    person_in_charge: people.find(p => p.id == editBillData.person_in_charge_id) || b.person_in_charge
                };
            }
            return b;
        }));
        setEditingBill(null);

        try {
            const response = await api.put(`/bills/${id}`, editBillData);
            const updatedBill = response.data.data || response.data;
            
            // Sync with actual server data
            setBills(prev => prev.map(b => {
                if (b.id === id) {
                    return {
                        ...b,
                        ...updatedBill,
                        category: originalBill?.category,
                        person_in_charge: originalBill?.person_in_charge,
                        proof_of_payments: originalBill?.proof_of_payments
                    };
                }
                return b;
            }));
        } catch (err) {
            console.error('Update error:', err);
            // Revert on error
            setBills(originalBills);
            setError(err.response?.data?.message || 'Failed to update bill');
        }
    };

    const handleCancelEdit = () => {
        setEditingBill(null);
        setEditBillData({ amount: '', due_date: '', details: '', category_id: '', person_in_charge_id: '', status: 'pending' });
    };

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Image Preview Overlay */}
                {previewImage && (
                    <div 
                        className="fixed inset-0 z-50 bg-green-950/95 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setPreviewImage(null)}
                    >
                        <button 
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <img 
                            src={previewImage} 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-2 border-white/10" 
                            alt="Payment Proof" 
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Audio Player */}
                <audio 
                    ref={audioRef}
                    crossOrigin="anonymous"
                    preload="auto"
                    onEnded={() => setPlayingAudio(null)}
                    onError={(e) => {
                        console.error("Audio playback error event:", e);
                        setError("Audio stream interrupted or file inaccessible.");
                        setPlayingAudio(null);
                    }}
                    className="hidden"
                />

                {/* Person Filter Tabs */}
                {(peopleWithPendingBills.length > 0 || peopleWithSettledBills.length > 0) && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
                        <button 
                            onClick={() => setSelectedPersonId('all')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2"
                            style={{ 
                                backgroundColor: selectedPersonId === 'all' ? '#22c55e15' : 'white',
                                borderColor: selectedPersonId === 'all' ? '#22c55e' : 'transparent',
                                color: selectedPersonId === 'all' ? '#22c55e' : '#9ca3af'
                            }}
                        >
                            All
                        </button>
                        {peopleWithPendingBills.map((person, idx) => {
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

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6">
                    {/* Awaiting Settlement — Red */}
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl text-white relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Clock size={22} className="text-red-100" />
                                </div>
                                <span className="text-[10px] font-bold text-red-100 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Receipt size={10} /> {filteredPendingBills.length} bills
                                </span>
                            </div>
                            <p className="text-[11px] font-semibold text-red-200 uppercase tracking-wider mb-1">Awaiting Settlement</p>
                            <p className="text-2xl font-black tracking-tight">{formatCurrency(totalPending)}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <Clock size={12} className="text-red-200" />
                                <p className="text-[10px] text-red-200 font-medium">Pending payment</p>
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
                                    <CheckCircle2 size={10} /> {filteredSettledBills.length} bills
                                </span>
                            </div>
                            <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider mb-1">Total Settled</p>
                            <p className="text-2xl font-black tracking-tight">{formatCurrency(totalSettled)}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={12} className="text-emerald-200" />
                                <p className="text-[10px] text-emerald-200 font-medium">All time settled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Settlements */}
                {filteredPendingBills.length > 0 && (
                    <div className="bg-red-50 rounded-xl sm:rounded-2xl border border-red-100 shadow-sm overflow-hidden mb-6 sm:mb-8">
                        <div className="p-3 sm:p-4 px-4 sm:px-5 border-b border-red-50 flex items-center justify-between bg-red-50/10">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h3 className="text-xs sm:text-sm font-black text-red-900 uppercase tracking-wider">Awaiting Settlement</h3>
                                <div className="h-4 w-[1px] bg-red-200 hidden sm:block"></div>
                                <span className="text-[8px] sm:text-[9px] font-black text-red-600 bg-white px-2 sm:px-2.5 py-0.5 rounded-full uppercase border border-red-100">{filteredPendingBills.length} Items</span>
                            </div>

                            <div className="flex items-center gap-1 bg-red-50/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-red-100">
                                <button 
                                    onClick={() => setPendingViewMode('list')}
                                    className={`p-1 rounded transition-all ${pendingViewMode === 'list' ? 'bg-red-900 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                    title="List View"
                                >
                                    <LayoutList size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                                <button 
                                    onClick={() => setPendingViewMode('grid')}
                                    className={`p-1 rounded transition-all ${pendingViewMode === 'grid' ? 'bg-red-900 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-4">
                            {pendingViewMode === 'list' ? (
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    {filteredPendingBills.map((bill) => (
                                        <BillItem 
                                            key={bill.id}
                                            bill={bill}
                                            editingBill={editingBill}
                                            editBillData={editBillData}
                                            setEditBillData={setEditBillData}
                                            handleSaveBill={handleSaveBill}
                                            handleCancelEdit={handleCancelEdit}
                                            handleEditBill={handleEditBill}
                                            confirmDelete={confirmDelete}
                                            handleUploadClick={handleUploadClick}
                                            categories={categories}
                                            people={people}
                                            saving={saving}
                                            isPending={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {filteredPendingBills.map((bill) => (
                                        editingBill === bill.id ? (
                                            <div key={bill.id} className="sm:col-span-2 lg:col-span-3">
                                                <BillItem
                                                    bill={bill}
                                                    editingBill={editingBill}
                                                    editBillData={editBillData}
                                                    setEditBillData={setEditBillData}
                                                    handleSaveBill={handleSaveBill}
                                                    handleCancelEdit={handleCancelEdit}
                                                    handleEditBill={handleEditBill}
                                                    confirmDelete={confirmDelete}
                                                    handleUploadClick={handleUploadClick}
                                                    categories={categories}
                                                    people={people}
                                                    saving={saving}
                                                    isPending={true}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                key={bill.id}
                                                className="group bg-white border border-red-100 rounded-xl sm:rounded-2xl overflow-hidden hover:border-red-500 hover:shadow-xl hover:shadow-red-900/5 transition-all"
                                            >
                                            <div className="h-24 sm:h-28 lg:h-36 bg-red-50/30 relative overflow-hidden flex items-center justify-center">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/50 rounded-full flex items-center justify-center text-red-600 shadow-sm">
                                                    <Receipt size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                                                </div>
                                                <div
                                                    className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2.5 py-0.5 rounded-md text-[8px] sm:text-[10px] font-black uppercase tracking-wider"
                                                    style={{
                                                        color: bill.category?.color || '#dc2626',
                                                        backgroundColor: (bill.category?.color || '#dc2626') + '22',
                                                        border: `1px solid ${(bill.category?.color || '#dc2626')}40`,
                                                        backdropFilter: 'blur(4px)',
                                                    }}
                                                >
                                                    {bill.category?.name}
                                                </div>
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                                    <AlertCircle size={12} className="sm:w-4 sm:h-4 animate-pulse" />
                                                </div>
                                            </div>

                                            <div className="p-3 sm:p-4">
                                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                    <div className="min-w-0 flex-1">
<h4 className="font-black text-gray-900 text-xs sm:text-sm mb-1">{bill.details}</h4>
                                                        <div className="flex flex-col gap-0.5 sm:gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Due:</span>
                                                                <p className="text-[8px] sm:text-[10px] font-black text-red-500 flex items-center gap-1">
                                                                    <Calendar size={9} className="sm:w-2.5 sm:h-2.5 text-red-400" />
                                                                    {formatDateLocal(bill.due_date)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Charge:</span>
                                                                <p className="text-[8px] sm:text-[10px] font-black flex items-center gap-1" style={{ color: bill.person_in_charge?.color || '#2563eb' }}>
                                                                    <Users size={9} className="sm:w-2.5 sm:h-2.5" style={{ color: bill.person_in_charge?.color || '#2563eb' }} />
                                                                    {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-2">
                                                        <p className="text-xs sm:text-sm font-black text-red-600">{formatCurrency(bill.amount)}</p>
                                                        <p className="text-[8px] sm:text-[9px] font-bold text-red-400 uppercase tracking-widest">Pending</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditBill(bill);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                                                    >
                                                        <Edit2 size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUploadClick(bill);
                                                        }}
                                                        className="flex-[1.5] sm:flex-[2] flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                                    >
                                                        Settle <ArrowUpRight size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(bill);
                                                        }}
                                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-50 shrink-0"
                                                    >
                                                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Visual Separator */}
                <div className="flex items-center gap-3 my-8">
                    <div className="flex-1 h-[2px] bg-red-300 rounded-full"></div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Settled</span>
                    <div className="flex-1 h-[2px] bg-green-300 rounded-full"></div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4 px-4 sm:px-5 border-b border-green-50 flex items-center justify-between bg-green-50/10">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <h3 className="text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Completed Transactions</h3>
                            <div className="h-4 w-[1px] bg-green-200 hidden sm:block"></div>
                            <span className="text-[8px] sm:text-[9px] font-black text-green-600 bg-white px-2 sm:px-2.5 py-0.5 rounded-full uppercase border border-green-100">{filteredSettledBills.length} Records</span>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-green-50/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-green-100">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1 rounded transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="List View"
                            >
                                <LayoutList size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1 rounded transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-white">
                        {viewMode === 'list' ? (
                            <div className="space-y-2 sm:space-y-3">
                                {filteredSettledBills.map((bill) => (
                                    <BillItem 
                                        key={bill.id}
                                        bill={bill}
                                        editingBill={editingBill}
                                        editBillData={editBillData}
                                        setEditBillData={setEditBillData}
                                        handleSaveBill={handleSaveBill}
                                        handleCancelEdit={handleCancelEdit}
                                        handleEditBill={handleEditBill}
                                        confirmDelete={confirmDelete}
                                        handleUploadClick={handleUploadClick}
                                        categories={categories}
                                        people={people}
                                        saving={saving}
                                        isPending={false}
                                        toggleAudio={toggleAudio}
                                        playingAudio={playingAudio}
                                        handleViewProof={handleViewProof}
                                    />
                                ))}
                            </div>
                            ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {filteredSettledBills.map((bill) => (
                                    <div 
                                        key={bill.id}
                                        className="group bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all"
                                    >
                                        <div className="h-24 sm:h-28 lg:h-36 bg-gray-50 relative overflow-hidden">
                                            {bill.proof_of_payments?.[0]?.file_path ? (
                                                <img 
                                                    src={buildStorageUrl(bill.proof_of_payments[0].file_path)} 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    alt="Proof"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="text-gray-300 sm:w-8 sm:h-8 lg:w-10 lg:h-10" size={24} />
                                                </div>
                                            )}
                                            <div
                                                className="absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2.5 py-0.5 rounded-md text-[8px] sm:text-[10px] font-black uppercase"
                                                style={{
                                                    color: bill.category?.color || '#16a34a',
                                                    backgroundColor: (bill.category?.color || '#16a34a') + '22',
                                                    border: `1px solid ${(bill.category?.color || '#16a34a')}40`,
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                            >
                                                {bill.category?.name}
                                            </div>
                                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                <CheckCircle2 size={12} className="sm:w-4 sm:h-4" />
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4">
                                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-black text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 truncate">{bill.details}</h4>
                                                    <div className="flex flex-col gap-0.5 sm:gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Due:</span>
                                                            <p className="text-[8px] sm:text-[10px] font-black text-red-500 flex items-center gap-1">
                                                                <Calendar size={9} className="sm:w-2.5 sm:h-2.5 text-red-400" />
                                                                {formatDateLocal(bill.due_date)}
                                                            </p>
                                                        </div>
                                                        {bill.proof_of_payments?.[0]?.created_at && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Paid:</span>
                                                                <p className="text-[8px] sm:text-[10px] font-black text-green-600 flex items-center gap-1">
                                                                    <CheckCircle2 size={9} className="sm:w-2.5 sm:h-2.5" />
                                                                    {formatDateLocal(bill.proof_of_payments[0].created_at)}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Charge:</span>
                                                            <p className="text-[8px] sm:text-[10px] font-black text-blue-600 flex items-center gap-1">
                                                                <Users size={9} className="sm:w-2.5 sm:h-2.5 text-blue-500" />
                                                                {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                                                            </p>
                                                        </div>
                                                        {bill.proof_of_payments?.[0]?.paid_by && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">Paid By:</span>
                                                                <p className="text-[8px] sm:text-[10px] font-black text-green-600 flex items-center gap-1">
                                                                    <CheckCircle2 size={9} className="text-green-500" />
                                                                    {bill.proof_of_payments[0].paid_by}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <p className="text-xs sm:text-sm font-black text-green-900">{formatCurrency(bill.amount)}</p>
                                                    <p className="text-[8px] sm:text-[9px] font-bold text-green-600 uppercase">Settled</p>
                                                </div>
                                            </div>

                                            {bill.proof_of_payments?.[0]?.details && (
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                                                    <p className="text-xs text-gray-500 italic">&ldquo;{bill.proof_of_payments[0].details}&rdquo;</p>
                                                </div>
                                            )}

                                            {bill.proof_of_payments?.[0]?.voice_record_path ? (
                                                <div className="bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4 border border-green-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                                                <line x1="12" x2="12" y1="19" y2="22"></line>
                                                            </svg>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Voice Note</span>
                                                    </div>
                                                    <audio 
                                                        src={bill.proof_of_payments[0].voice_record_path} 
                                                        controls 
                                                        className="w-full h-8"
                                                        style={{ maxHeight: '32px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl mb-3 sm:mb-4">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Mic size={12} className="text-gray-300" />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-gray-400 italic">No voice note attached</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                                                {/* View Proof Button - Always visible */}
                                                <button 
                                                    onClick={() => bill.proof_of_payments?.[0]?.file_path && handleViewProof(bill.proof_of_payments[0].file_path)}
                                                    disabled={!bill.proof_of_payments?.[0]?.file_path}
                                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[8px] sm:text-[10px] font-black uppercase transition-all ${
                                                        !bill.proof_of_payments?.[0]?.file_path
                                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-green-600 hover:text-white'
                                                    }`}
                                                    title={bill.proof_of_payments?.[0]?.file_path ? "View Receipt" : "No Receipt Available"}
                                                >
                                                    <FileText size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">View</span>
                                                </button>

                                                {/* Delete Button - Always visible */}
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(bill);
                                                    }}
                                                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all shrink-0"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {settledBills.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">No History Found</h3>
                                <p className="text-sm text-gray-400">Completed transactions will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="fixed bottom-6 right-6 bg-red-50 border border-red-100 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-sm font-bold text-red-600">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Delete Dialog */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Delete Transaction?</h3>
                            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                                This action cannot be undone. Are you sure you want to remove <span className="font-black text-red-500">&ldquo;{billToDelete?.details}&rdquo;</span>?
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
                                    onClick={handleDelete}
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
            </main>
        </div>
    );
};

export default SettlementsPage;
