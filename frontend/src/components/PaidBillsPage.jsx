import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    CheckCircle2, 
    Search, 
    Bell, 
    Mail, 
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
    Trash,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaidBillsPage = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [playingAudio, setPlayingAudio] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // For inline image viewer
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

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

    const buildStorageUrl = (path) => `${STORAGE_BASE_URL.replace(/\/$/, '')}/storage/${path}`;

    useEffect(() => {
        fetchPaidBills();
    }, []);

    const fetchPaidBills = async () => {
        try {
            const response = await api.get('/bills/dashboard');
            // Fetch all bills so we can see both paid and pending for settlement
            setBills(response.data.bills);
        } catch (err) {
            console.error('Error fetching bills:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const toggleAudio = (audioPath) => {
        if (playingAudio === audioPath) {
            audioRef.current.pause();
            setPlayingAudio(null);
        } else {
            setPlayingAudio(audioPath);
            // The audio tag will auto-load the new src and play via the effect
        }
    };

    useEffect(() => {
        if (playingAudio && audioRef.current) {
            audioRef.current.play().catch(err => console.error("Playback failed:", err));
        }
    }, [playingAudio]);

    const pendingBills = bills.filter(bill => 
        bill.status === 'pending' && (
        bill.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.category?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const settledBills = bills.filter(bill => 
        bill.status === 'paid' && (
        bill.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.category?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
        
        setDeleting(true);
        try {
            await api.delete(`/bills/${billToDelete.id}`);
            setBills(prev => prev.filter(b => b.id !== billToDelete.id));
            setIsDeleteModalOpen(false);
            setBillToDelete(null);
        } catch (err) {
            console.error('Error deleting bill:', err);
            setError('Failed to delete transaction. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex flex-col relative min-w-0">
            {/* Image Preview Overlay (Lightbox) */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[9999] bg-green-950/95 backdrop-blur-xl flex items-center justify-center p-6 transition-all animate-in fade-in duration-300"
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
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-2 border-white/10 animate-in zoom-in-95 duration-300" 
                        alt="Payment Proof" 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Audio Player (Hidden) */}
            <audio 
                ref={audioRef}
                src={playingAudio ? buildStorageUrl(playingAudio) : ""}
                onEnded={() => setPlayingAudio(null)}
                className="hidden"
            />
            
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search settlements..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-green-950 mb-1 tracking-tight">Settlements</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Submit and view your payment proof records</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="bg-white px-3.5 py-1.5 rounded-xl border border-green-100 shadow-sm flex flex-col items-end w-full sm:w-auto">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Settled Amount</span>
                        <span className="text-base font-black text-green-900 leading-none mt-0.5">{formatCurrency(settledBills.reduce((acc, b) => acc + parseFloat(b.amount), 0))}</span>
                    </div>
                    <div className="bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-100 shadow-sm flex flex-col items-end w-full sm:w-auto">
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Awaiting Proof</span>
                        <span className="text-base font-black text-red-600 leading-none mt-0.5">{formatCurrency(pendingBills.reduce((acc, b) => acc + parseFloat(b.amount), 0))}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 min-h-0">
                {/* Pending Settlements Section */}
                {pendingBills.length > 0 && (
                    <div className="bg-white rounded-[1.5rem] border border-red-100 shadow-sm overflow-hidden flex flex-col shrink-0">
                        <div className="p-4 px-5 border-b border-red-50 flex items-center justify-between bg-red-50/10">
                            <div className="flex items-center gap-3">
                                <h3 className="font-black text-red-950 text-sm uppercase tracking-wider">Awaiting Settlement Proof</h3>
                                <div className="h-4 w-[1px] bg-red-200"></div>
                                <span className="text-[9px] font-black text-red-600 bg-white px-2.5 py-0.5 rounded-full uppercase border border-red-100">{pendingBills.length} Items</span>
                            </div>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[300px] custom-scrollbar p-4">
                            <div className="flex flex-col gap-3">
                                {pendingBills.map((bill) => (
                                    <div 
                                        key={bill.id}
                                        className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden"
                                    >
                                        {/* Subtle background glow on hover */}
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        <div className="flex items-center gap-4 flex-1 relative z-10">
                                            <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                                                <Plus size={20} className="stroke-[2.5]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-gray-900 text-sm mb-1 truncate group-hover:text-red-700 transition-colors">{bill.details}</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                        <Calendar size={12} className="text-red-400" />
                                                        {new Date(bill.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </div>
                                                    <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                    <span className="text-[10px] font-black text-red-600/70 uppercase tracking-widest bg-red-50/50 px-2 py-0.5 rounded-md border border-red-100/50">
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
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUploadClick(bill);
                                                }}
                                                className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Settle Now
                                                <ArrowUpRight size={14} className="stroke-[3]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction History Section */}
                <div className="bg-white rounded-[1.5rem] border border-green-100 shadow-sm overflow-hidden flex flex-col flex-1">
                    <div className="p-4 px-5 border-b border-green-50 flex items-center justify-between bg-green-50/10">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-green-950 text-sm uppercase tracking-wider">Completed Transactions</h3>
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
                                title="Large View"
                            >
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-green-50/5">
                        {viewMode === 'list' ? (
                            <div className="space-y-3">
                                {settledBills.map((bill) => (
                                    <div 
                                        key={bill.id}
                                        className="group bg-white border border-green-50 rounded-[1.25rem] p-3.5 px-4 hover:border-green-500 hover:shadow-lg hover:shadow-green-900/5 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-green-950 text-sm mb-0.5 truncate leading-tight">{bill.details}</h4>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black text-gray-400 flex items-center gap-1 uppercase tracking-widest leading-none">
                                                            <Calendar size={10} className="text-green-600" /> {new Date(bill.due_date).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-green-100 leading-none">
                                                            {bill.category?.name}
                                                        </span>
                                                        <span className="text-[9px] font-black text-green-950 uppercase tracking-widest flex items-center gap-1 leading-none">
                                                            <Users size={10} className="text-green-600" /> {bill.person_in_charge?.name || 'No PIC'}
                                                        </span>
                                                    </div>
                                                    {bill.proof_of_payments?.[0]?.details && (
                                                        <p className="text-[10px] text-gray-500 italic font-medium leading-tight">"{bill.proof_of_payments[0].details}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pr-2">
                                            <div className="text-right">
                                                <p className="text-base font-black text-green-950 leading-none">{formatCurrency(bill.amount)}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 leading-none">Amount Paid</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {bill.proof_of_payments?.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        {bill.proof_of_payments[0].voice_record_path && (
                                                            <button 
                                                                onClick={() => toggleAudio(bill.proof_of_payments[0].voice_record_path)}
                                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border shadow-sm ${
                                                                    playingAudio === bill.proof_of_payments[0].voice_record_path 
                                                                    ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                                                                    : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
                                                                }`}
                                                                title={playingAudio === bill.proof_of_payments[0].voice_record_path ? "Pause Voice Note" : "Play Voice Note"}
                                                            >
                                                                {playingAudio === bill.proof_of_payments[0].voice_record_path ? <Pause size={14} fill="currentColor" /> : <Mic size={14} />}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleViewProof(bill.proof_of_payments[0].file_path)}
                                                            className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all border border-green-100 shadow-sm"
                                                            title="View Receipt Image"
                                                        >
                                                            <FileText size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(bill);
                                                    }}
                                                    className="w-9 h-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {settledBills.map((bill) => (
                                    <div 
                                        key={bill.id}
                                        className="group bg-white rounded-[1.5rem] border border-green-50 shadow-sm hover:border-green-500 hover:shadow-xl hover:shadow-green-900/10 transition-all overflow-hidden flex flex-col"
                                    >
                                        {/* Image Preview Area */}
                                        <div className="h-32 bg-gray-100 relative group/img overflow-hidden">
                                            {bill.proof_of_payments?.[0]?.file_path ? (
                                                <img 
                                                    src={buildStorageUrl(bill.proof_of_payments[0].file_path)} 
                                                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-green-50">
                                                    <FileText className="text-green-200" size={32} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-black text-green-900 uppercase tracking-widest shadow-sm">
                                                {bill.category?.name}
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-black text-green-950 text-xs leading-tight mb-0.5 truncate">{bill.details}</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                                                        <Calendar size={10} className="text-green-600" /> {new Date(bill.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-green-900 leading-none mb-0.5">{formatCurrency(bill.amount)}</p>
                                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter leading-none">Settled</p>
                                                </div>
                                            </div>

                                            {bill.proof_of_payments?.[0]?.details && (
                                                <div className="bg-green-50 p-3 rounded-xl mb-4 border border-green-100 flex-1">
                                                    <p className="text-[10px] text-green-800 font-bold italic leading-relaxed">
                                                        Note: "{bill.proof_of_payments[0].details}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2.5 pt-3 border-t border-green-50">
                                                {bill.proof_of_payments?.[0]?.voice_record_path && (
                                                    <button 
                                                        onClick={() => toggleAudio(bill.proof_of_payments[0].voice_record_path)}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border ${
                                                            playingAudio === bill.proof_of_payments[0].voice_record_path 
                                                            ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                                                            : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600 hover:text-white'
                                                        }`}
                                                    >
                                                        {playingAudio === bill.proof_of_payments[0].voice_record_path ? <><Pause size={12} fill="currentColor" /> Playing</> : <><Mic size={12} /> Voice Note</>}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleViewProof(bill.proof_of_payments[0].file_path)}
                                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all border border-green-100"
                                                >
                                                    View Proof
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(bill);
                                                    }}
                                                    className="w-9 h-9 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100 shrink-0"
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
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="w-16 h-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-inner">
                                    <FileText className="text-green-200" size={32} />
                                </div>
                                <h3 className="text-base font-black text-green-950 mb-1 uppercase tracking-tighter">No History Found</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed transactions will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-50 border border-red-100 p-3 rounded-lg shadow-2xl flex items-center gap-2.5 animate-slide-up z-50">
                    <AlertCircle className="text-red-500" size={14} />
                    <p className="text-red-600 text-[9px] font-bold">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-green-950/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Transaction?</h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                This action cannot be undone. Are you sure you want to remove <span className="text-red-500 font-bold">"{billToDelete?.details}"</span>?
                            </p>
                        </div>
                        <div className="flex border-t border-gray-50">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-5 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-5 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors border-l border-gray-50 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaidBillsPage;
