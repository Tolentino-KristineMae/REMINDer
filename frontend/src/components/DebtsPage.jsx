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
    TrendingUp
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

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/debts');
            setDebts(response.data.debts || []);
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this utang record?')) return;
        try {
            await api.delete(`/debts/${id}`);
            setDebts(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete utang');
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

    const pendingDebts = debts.filter(d => d.status === 'pending');
    const paidDebts = debts.filter(d => d.status === 'paid');

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

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm">
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <LayoutList size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                        <button 
                            onClick={() => navigate('/add-debt')} 
                            className="bg-green-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 flex items-center gap-3 active:scale-[0.98]"
                        >
                            <Plus size={18} strokeWidth={3} /> New Utang
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-amber-200 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                                <Clock size={20} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-wider">{pendingDebts.length} Pending</span>
                            </div>
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Unpaid</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(pendingDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0))}</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-green-200 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-wider">{paidDebts.length} Settled</span>
                            </div>
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Settled</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(paidDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0))}</p>
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
                                <h2 className="text-lg font-black text-gray-900 leading-tight">Active Utangs</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unsettled personal obligations</p>
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
                                        <div className="flex items-center gap-2 mb-3">
                                            {debt.is_my_debt ? (
                                                <span className="text-[9px] font-black bg-gray-900 text-white px-3 py-1 rounded-lg uppercase tracking-wider">My Utang</span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-green-600 text-white px-3 py-1 rounded-lg uppercase tracking-wider">Owed to Me</span>
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
                                                        onClick={() => handleDelete(debt.id)} 
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
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                                                <p className="text-xl font-black text-gray-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleDelete(debt.id)} 
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/settle-debt/${debt.id}`)} 
                                                    className="bg-green-900 text-white h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 flex items-center gap-3 active:scale-95"
                                                >
                                                    Bayad Time <ArrowUpRight size={16} />
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
                                <h2 className="text-lg font-black text-gray-900 leading-tight">Bayad History</h2>
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
                                        <div className="flex items-center gap-2 mb-3">
                                            {debt.is_my_debt ? (
                                                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-lg uppercase tracking-wider">My Utang</span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-lg uppercase tracking-wider">Owed to Me</span>
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
                                                        onClick={() => handleDelete(debt.id)} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Settled</p>
                                                <p className="text-xl font-black text-green-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleAudio(debt.proof_voice_path)} 
                                                    disabled={!debt.proof_voice_path} 
                                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${!debt.proof_voice_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-50' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white border-red-500 shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 hover:border-green-100'}`}
                                                >
                                                    {playingAudio === debt.proof_voice_path ? <Pause size={20} /> : <Volume2 size={20} />}
                                                </button>
                                                <button 
                                                    onClick={() => setPreviewImage(debt.proof_image_path)} 
                                                    disabled={!debt.proof_image_path} 
                                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${!debt.proof_image_path ? 'bg-gray-50 text-gray-200 border-gray-50 opacity-50' : 'bg-white border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 hover:border-green-100'}`}
                                                >
                                                    <FileText size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(debt.id)} 
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                                >
                                                    <Trash2 size={20} />
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
        </div>
    );
};

export default DebtsPage;
