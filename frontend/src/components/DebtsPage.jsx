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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Utangs Management</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personal Debt Tracking</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutList size={18} /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutGrid size={18} /></button>
                        </div>
                        <button onClick={() => navigate('/add-debt')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"><Plus size={18} /> New Utang</button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Total Unpaid</p>
                        <p className="text-2xl font-black text-gray-900">{formatCurrency(pendingDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0))}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-full"><Clock size={10} /> {pendingDebts.length} Pending</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-2xl font-black text-gray-900">{formatCurrency(paidDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0))}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> {paidDebts.length} Settled</div>
                    </div>
                </div>

                {/* Pending Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100"><Clock size={16} /></div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Utangs</h2>
                    </div>
                    {pendingDebts.length > 0 ? (
                        <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                            {pendingDebts.map(debt => (
                                <div key={debt.id} className={`bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-amber-200 transition-all ${viewMode === 'list' ? "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" : ""}`}>
                                    {viewMode === 'grid' && <div className="h-32 bg-amber-50/30 flex items-center justify-center border-b border-amber-50"><Wallet2 size={32} className="text-amber-200" /></div>}
                                    <div className={viewMode === 'grid' ? "p-5" : "flex-1"}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {debt.is_my_debt ? (
                                                <span className="text-[8px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-widest">My Utang</span>
                                            ) : (
                                                <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Owed to Me</span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-gray-900 text-sm mb-1">{debt.description}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={10} /> Created {formatDateLocal(debt.created_at)}</span>
                                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Pending</span>
                                        </div>
                                        {viewMode === 'grid' && (
                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                                <p className="text-lg font-black text-amber-600">{formatCurrency(debt.amount)}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDelete(debt.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                    <button onClick={() => navigate(`/settle-debt/${debt.id}`)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2">Bayad <ArrowUpRight size={14} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-6">
                                            <p className="text-lg font-black text-amber-600 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDelete(debt.id)} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"><Trash2 size={18} /></button>
                                                <button onClick={() => navigate(`/settle-debt/${debt.id}`)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2">Bayad Time <ArrowUpRight size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl py-12 flex flex-col items-center justify-center opacity-50">
                            <Wallet2 size={40} className="text-gray-300 mb-3" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active utangs</p>
                        </div>
                    )}
                </section>

                {/* Paid History Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100"><CheckCircle2 size={16} /></div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Bayad History</h2>
                    </div>
                    {paidDebts.length > 0 ? (
                        <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                            {paidDebts.map(debt => (
                                <div key={debt.id} className={`bg-white border border-green-50 rounded-2xl overflow-hidden hover:border-green-200 transition-all ${viewMode === 'list' ? "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" : ""}`}>
                                    {viewMode === 'grid' && (
                                        <div className="h-32 bg-gray-50 relative overflow-hidden group/img">
                                            {debt.proof_image_path ? <img src={debt.proof_image_path} className="w-full h-full object-cover transition-transform group-hover/img:scale-105" alt="Proof" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText size={32} /></div>}
                                            <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={14} /></div>
                                        </div>
                                    )}
                                    <div className={viewMode === 'grid' ? "p-5" : "flex-1"}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {debt.is_my_debt ? (
                                                <span className="text-[8px] font-black bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100 uppercase tracking-widest">My Utang</span>
                                            ) : (
                                                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">Owed to Me</span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-gray-900 text-sm mb-1">{debt.description}</h4>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> Paid {formatDateLocal(debt.paid_at)}</span>
                                            </div>
                                            {debt.payment_details && <p className="text-[10px] text-gray-500 italic bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">&ldquo;{debt.payment_details}&rdquo;</p>}
                                        </div>
                                        {viewMode === 'grid' && (
                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                                <p className="text-lg font-black text-green-900">{formatCurrency(debt.amount)}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleAudio(debt.proof_voice_path)} disabled={!debt.proof_voice_path} className={`p-2 rounded-lg transition-all ${!debt.proof_voice_path ? 'text-gray-200 opacity-50' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-green-600'}`}><Volume2 size={18} /></button>
                                                    <button onClick={() => setPreviewImage(debt.proof_image_path)} disabled={!debt.proof_image_path} className={`p-2 rounded-lg transition-all ${!debt.proof_image_path ? 'text-gray-200 opacity-50' : 'text-gray-400 hover:text-green-600'}`}><FileText size={18} /></button>
                                                    <button onClick={() => handleDelete(debt.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-6">
                                            <p className="text-lg font-black text-green-900 whitespace-nowrap">{formatCurrency(debt.amount)}</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleAudio(debt.proof_voice_path)} disabled={!debt.proof_voice_path} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${!debt.proof_voice_path ? 'border-gray-50 text-gray-200 opacity-50' : playingAudio === debt.proof_voice_path ? 'bg-red-500 text-white border-red-500' : 'border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>{playingAudio === debt.proof_voice_path ? <Pause size={18} /> : <Volume2 size={18} />}</button>
                                                <button onClick={() => setPreviewImage(debt.proof_image_path)} disabled={!debt.proof_image_path} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${!debt.proof_image_path ? 'border-gray-50 text-gray-200 opacity-50' : 'border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50'}`}><FileText size={18} /></button>
                                                <button onClick={() => handleDelete(debt.id)} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-3xl py-12 flex flex-col items-center justify-center opacity-50">
                            <CheckCircle2 size={40} className="text-gray-300 mb-3" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No bayad history</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DebtsPage;
