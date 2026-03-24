import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
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
    Trash2,
    Users,
    Clock,
    Receipt,
    Sparkles,
    TrendingUp,
    Edit2,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateLocal } from '../utils/formatters';

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
            <div className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
                <div className="flex-1 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editBillData.amount}
                                onChange={(e) => setEditBillData({ ...editBillData, amount: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Due Date</label>
                            <input
                                type="date"
                                value={editBillData.due_date}
                                onChange={(e) => setEditBillData({ ...editBillData, due_date: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Details</label>
                            <input
                                type="text"
                                value={editBillData.details}
                                onChange={(e) => setEditBillData({ ...editBillData, details: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                            <select
                                value={editBillData.category_id}
                                onChange={(e) => setEditBillData({ ...editBillData, category_id: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Person In Charge</label>
                            <select
                                value={editBillData.person_in_charge_id}
                                onChange={(e) => setEditBillData({ ...editBillData, person_in_charge_id: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold focus:border-green-500 focus:outline-none"
                            >
                                <option value="">Select person</option>
                                {people.map(person => (
                                    <option key={person.id} value={person.id}>{person.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <button 
                        type="button"
                        onClick={() => handleSaveBill(bill.id)}
                        disabled={saving}
                        className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition-all border border-green-100"
                    >
                        <Check size={14} />
                    </button>
                    <button 
                        type="button"
                        onClick={handleCancelEdit}
                        className="w-9 h-9 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-gray-500 hover:text-white transition-all border border-gray-100"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 flex-1 relative z-10">
                    <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                        <Receipt size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-red-700 transition-colors">{bill.details}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                <Calendar size={12} className="text-red-400" />
                                Due: {formatDateLocal(bill.due_date)}
                            </div>
                            <span className="hidden sm:block h-1 w-1 bg-gray-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-blue-600 flex items-center gap-1 whitespace-nowrap">
                                <Users size={10} className="text-blue-500" />
                                {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                            </span>
                            <span className="hidden sm:block h-1 w-1 bg-gray-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-red-600/70 uppercase tracking-widest bg-red-50/50 px-2 py-0.5 rounded-md border border-red-100/50 whitespace-nowrap">
                                {bill.category?.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                        <p className="text-base font-black text-red-600 leading-none mb-1.5 tracking-tighter">{formatCurrency(bill.amount)}</p>
                        <div className="flex items-center justify-start sm:justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount Due</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <button 
                        type="button"
                        onClick={() => handleEditBill(bill)}
                        className="w-9 h-9 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => confirmDelete(bill)}
                        className="w-9 h-9 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleUploadClick(bill)}
                        className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
                    >
                        Settle
                        <ArrowUpRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        );
    }

    // Settled Item
    return (
        <div className="group bg-white border border-green-50 rounded-[1.25rem] p-3.5 px-4 hover:border-green-500 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
                    <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-green-950 text-sm mb-1.5 line-clamp-2 leading-tight">{bill.details}</h4>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Due:</span>
                                <span className="text-[9px] font-black text-red-500 flex items-center gap-1 whitespace-nowrap">
                                    <Calendar size={10} className="text-red-400" /> 
                                    {formatDateLocal(bill.due_date)}
                                </span>
                            </div>
                            {bill.proof_of_payments?.[0]?.created_at && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Paid:</span>
                                    <span className="text-[9px] font-black text-green-600 flex items-center gap-1 whitespace-nowrap">
                                        <CheckCircle2 size={10} /> 
                                        {formatDateLocal(bill.proof_of_payments[0].created_at)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Charge:</span>
                                <span className="text-[9px] font-black text-blue-600 flex items-center gap-1 whitespace-nowrap">
                                    <Users size={10} className="text-blue-500" /> 
                                    {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Category:</span>
                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {bill.category?.name}
                                </span>
                            </div>
                            {bill.proof_of_payments?.[0]?.voice_record_path && (
                                <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                                    <Mic size={10} className="text-red-500" />
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-tight">Voice Note Attached</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                    <p className="text-base font-black text-green-900">{formatCurrency(bill.amount)}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Paid</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Voice Note Button - Always visible, disabled if no audio */}
                    <button 
                        onClick={() => bill.proof_of_payments?.[0]?.voice_record_path && toggleAudio(bill.proof_of_payments[0].voice_record_path)}
                        disabled={!bill.proof_of_payments?.[0]?.voice_record_path}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                            !bill.proof_of_payments?.[0]?.voice_record_path
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
                            : playingAudio === bill.proof_of_payments[0].voice_record_path 
                                ? 'bg-red-500 text-white border-red-500' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600'
                        }`}
                        title={bill.proof_of_payments?.[0]?.voice_record_path ? "Play Voice Note" : "No Voice Note Available"}
                    >
                        {playingAudio === bill.proof_of_payments?.[0]?.voice_record_path ? <Pause size={14} /> : <Volume2 size={14} />}
                    </button>

                    {/* View Proof Button - Always visible, disabled if no file */}
                    <button 
                        onClick={() => bill.proof_of_payments?.[0]?.file_path && handleViewProof(bill.proof_of_payments[0].file_path)}
                        disabled={!bill.proof_of_payments?.[0]?.file_path}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                            !bill.proof_of_payments?.[0]?.file_path
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600'
                        }`}
                        title={bill.proof_of_payments?.[0]?.file_path ? "View Receipt" : "No Receipt Available"}
                    >
                        <FileText size={14} />
                    </button>

                    {/* Delete Button - Always visible and active */}
                    <button 
                        type="button"
                        onClick={() => confirmDelete(bill)}
                        className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        title="Delete Transaction"
                    >
                        <Trash2 size={14} />
                    </button>
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
            
            const catRes = await api.get('/categories');
            const catResData = catRes.data || {};
            let catData = catResData.categories;
            if (catData?.data) catData = catData.data;
            setCategories(Array.isArray(catData) ? catData : []);
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

    const totalSettled = settledBills.reduce((acc, b) => acc + (parseFloat(b?.amount) || 0), 0);
    const totalPending = pendingBills.reduce((acc, b) => acc + (parseFloat(b?.amount) || 0), 0);

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
            <main className="max-w-7xl mx-auto px-6 py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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

                {/* Pending Settlements */}
                {pendingBills.length > 0 && (
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden mb-8">
                        <div className="p-4 px-5 border-b border-red-50 flex items-center justify-between bg-red-50/10">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black text-red-900 uppercase tracking-wider">Awaiting Settlement Proof</h3>
                                <div className="h-4 w-[1px] bg-red-200"></div>
                                <span className="text-[9px] font-black text-red-600 bg-white px-2.5 py-0.5 rounded-full uppercase border border-red-100">{pendingBills.length} Items</span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-red-50/50 p-1 rounded-xl border border-red-100">
                                <button 
                                    onClick={() => setPendingViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all ${pendingViewMode === 'list' ? 'bg-red-900 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                    title="List View"
                                >
                                    <LayoutList size={14} />
                                </button>
                                <button 
                                    onClick={() => setPendingViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-all ${pendingViewMode === 'grid' ? 'bg-red-900 text-white shadow-md' : 'text-gray-400 hover:bg-red-100'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            {pendingViewMode === 'list' ? (
                                <div className="flex flex-col gap-3">
                                    {pendingBills.map((bill) => (
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pendingBills.map((bill) => (
                                        <div 
                                            key={bill.id}
                                            className="group bg-white border border-red-50 rounded-2xl overflow-hidden hover:border-red-500 hover:shadow-xl hover:shadow-red-900/5 transition-all"
                                        >
                                            <div className="h-36 bg-red-50/30 relative overflow-hidden flex items-center justify-center">
                                                <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-red-600 shadow-sm">
                                                    <Receipt size={32} />
                                                </div>
                                                <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                    {bill.category?.name}
                                                </div>
                                                <div className="absolute top-3 right-3 w-8 h-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                                    <AlertCircle size={16} className="animate-pulse" />
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-black text-gray-900 text-sm mb-1 truncate">{bill.details}</h4>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due:</span>
                                                                <p className="text-[10px] font-black text-red-500 flex items-center gap-1">
                                                                    <Calendar size={11} className="text-red-400" />
                                                                    {formatDateLocal(bill.due_date)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Charge:</span>
                                                                <p className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                                                                    <Users size={11} className="text-blue-500" />
                                                                    {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-black text-red-600">{formatCurrency(bill.amount)}</p>
                                                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Pending</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditBill(bill);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUploadClick(bill);
                                                        }}
                                                        className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                                    >
                                                        Settle <ArrowUpRight size={12} strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(bill);
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-50 shrink-0"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                    <div className="p-4 px-5 border-b border-green-50 flex items-center justify-between bg-green-50/10">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black text-green-900 uppercase tracking-wider">Completed Transactions</h3>
                            <div className="h-4 w-[1px] bg-green-200"></div>
                            <span className="text-[9px] font-black text-green-600 bg-white px-2.5 py-0.5 rounded-full uppercase border border-green-100">{settledBills.length} Total Records</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-green-50/50 p-1 rounded-xl border border-green-100">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="List View"
                            >
                                <LayoutList size={14} />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-green-50/5">
                        {viewMode === 'list' ? (
                            <div className="space-y-3">
                                {settledBills.map((bill) => (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {settledBills.map((bill) => (
                                    <div 
                                        key={bill.id}
                                        className="group bg-white border border-green-50 rounded-2xl overflow-hidden hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all"
                                    >
                                        <div className="h-36 bg-gray-50 relative overflow-hidden">
                                            {bill.proof_of_payments?.[0]?.file_path ? (
                                                <img 
                                                    src={buildStorageUrl(bill.proof_of_payments[0].file_path)} 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    alt="Proof"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="text-gray-300" size={40} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black text-gray-900 uppercase">
                                                {bill.category?.name}
                                            </div>
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-black text-gray-900 text-sm mb-1 truncate">{bill.details}</h4>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due:</span>
                                                            <p className="text-[10px] font-black text-red-500 flex items-center gap-1">
                                                                <Calendar size={11} className="text-red-400" />
                                                                {formatDateLocal(bill.due_date)}
                                                            </p>
                                                        </div>
                                                        {bill.proof_of_payments?.[0]?.created_at && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Paid:</span>
                                                                <p className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                                                    <CheckCircle2 size={11} />
                                                                    {formatDateLocal(bill.proof_of_payments[0].created_at)}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Charge:</span>
                                                            <p className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                                                                <Users size={11} className="text-blue-500" />
                                                                {bill.person_in_charge ? `${bill.person_in_charge.first_name} ${bill.person_in_charge.last_name}` : 'No PIC'}
                                                            </p>
                                                        </div>
                                                        {bill.proof_of_payments?.[0]?.paid_by && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Paid By:</span>
                                                                <p className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                                                    <CheckCircle2 size={11} className="text-green-500" />
                                                                    {bill.proof_of_payments[0].paid_by}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {bill.proof_of_payments?.[0]?.voice_record_path && (
                                                            <div className="flex items-center gap-2 mt-1 bg-red-50 w-fit px-2.5 py-1 rounded-lg border border-red-100 animate-pulse">
                                                                <Mic size={12} className="text-red-500" />
                                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">Audio Proof Attached</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-green-900">{formatCurrency(bill.amount)}</p>
                                                    <p className="text-[9px] font-bold text-green-600 uppercase">Settled</p>
                                                </div>
                                            </div>

                                            {bill.proof_of_payments?.[0]?.details && (
                                                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                                                    <p className="text-xs text-gray-500 italic line-clamp-2">&ldquo;{bill.proof_of_payments[0].details}&rdquo;</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                                {/* Voice Note Button - Always visible */}
                                                <button 
                                                    onClick={() => bill.proof_of_payments?.[0]?.voice_record_path && toggleAudio(bill.proof_of_payments[0].voice_record_path)}
                                                    disabled={!bill.proof_of_payments?.[0]?.voice_record_path}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                        !bill.proof_of_payments?.[0]?.voice_record_path
                                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                                        : playingAudio === bill.proof_of_payments[0].voice_record_path 
                                                            ? 'bg-red-500 text-white' 
                                                            : 'bg-gray-50 text-gray-600 hover:bg-green-600 hover:text-white'
                                                    }`}
                                                    title={bill.proof_of_payments?.[0]?.voice_record_path ? "Play Voice Note" : "No Voice Note Available"}
                                                >
                                                    {playingAudio === bill.proof_of_payments?.[0]?.voice_record_path ? <><Pause size={12} /> Playing</> : <><Mic size={12} /> Voice</>}
                                                </button>

                                                {/* View Proof Button - Always visible */}
                                                <button 
                                                    onClick={() => bill.proof_of_payments?.[0]?.file_path && handleViewProof(bill.proof_of_payments[0].file_path)}
                                                    disabled={!bill.proof_of_payments?.[0]?.file_path}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                        !bill.proof_of_payments?.[0]?.file_path
                                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-green-600 hover:text-white'
                                                    }`}
                                                    title={bill.proof_of_payments?.[0]?.file_path ? "View Receipt" : "No Receipt Available"}
                                                >
                                                    <FileText size={12} /> View
                                                </button>

                                                {/* Delete Button - Always visible */}
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(bill);
                                                    }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all shrink-0"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 size={14} />
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
