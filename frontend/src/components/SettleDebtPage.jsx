import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatDateLocal, formatCurrency } from '../utils/formatters';
import { 
    X, 
    CheckCircle, 
    ChevronLeft,
    AlertCircle,
    CloudUpload,
    Clock,
    Wallet2,
    Mic
} from 'lucide-react';

const SettleDebtPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [debt, setDebt] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [isUploaded, setIsUploaded] = useState(false);

    // Audio recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        const fetchDebt = async () => {
            try {
                const response = await api.get('/debts');
                const debts = response.data?.debts || response.data?.data || (Array.isArray(response.data) ? response.data : []);
                const found = debts.find(d => d.id == id);
                if (found) setDebt(found);
                else setError('Debt not found');
            } catch (err) {
                console.error('Error fetching debt:', err);
                setError('Failed to load debt details');
            } finally {
                setFetching(false);
            }
        };
        fetchDebt();
    }, [id]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'audio/webm' };
            
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
                setAudioBlob(audioBlob);
                setAudioURL(URL.createObjectURL(audioBlob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        const formData = new FormData();
        if (file) formData.append('proof_image', file);
        formData.append('payment_details', details);
        if (audioBlob) formData.append('proof_voice', audioBlob, 'recording.webm');

        try {
            await api.post(`/debts/${id}/settle`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploaded(true);
            setTimeout(() => navigate('/utangs'), 2000);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to submit payment proof.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;

    if (isUploaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-4 sm:p-8">
                <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-8 sm:p-14 text-center border border-green-100">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner"><CheckCircle className="text-[#22c55e]" size={32} sm:size={48} /></div>
                    <h2 className="text-2xl sm:text-3xl font-black text-green-950 mb-3 tracking-tight">Bayad Secured!</h2>
                    <p className="text-gray-400 font-medium mb-6 leading-relaxed text-sm sm:text-base">Your utang settlement has been successfully recorded.</p>
                    <div className="w-full bg-green-50 h-1.5 sm:h-2 rounded-full overflow-hidden"><div className="bg-[#22c55e] h-full animate-pulse"></div></div>
                    <p className="text-[10px] sm:text-xs font-black text-[#22c55e] uppercase tracking-widest mt-5">Redirecting to Utangs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/utangs')} className="flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-6 sm:mb-8 transition-colors"><ChevronLeft size={16} /> Back to Utangs</button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6"><Wallet2 size={24} sm:size={28} /></div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Bayad Time</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Settle your personal debt</p>
                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Utang For</p><p className="text-base sm:text-lg font-black text-gray-900 leading-tight">{debt?.description}</p></div>
                                <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Amount Due</p><p className="text-2xl sm:text-3xl font-black text-green-600 tracking-tight">{formatCurrency(debt?.amount)}</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 sm:p-8 border-b border-gray-50">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Step 1: Proof Photo (Optional)</label>
                                <div onClick={() => document.getElementById('proof').click()} className={`relative h-48 sm:h-64 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${preview ? 'border-green-500 bg-white' : 'border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-gray-100/50'}`}>
                                    {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : <><div className="w-12 h-12 sm:w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-4"><CloudUpload size={24} sm:size={32} /></div><p className="text-sm font-black text-gray-900">Snap or Upload Proof</p><p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mt-1">Optional • PNG, JPG up to 10MB</p></>}
                                    <input type="file" id="proof" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Step 2: Add Details & Voice Note</label>
                                    <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Any notes about this payment?" className="w-full h-24 bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:border-green-600 focus:bg-white transition-all resize-none mb-4" />
                                    
                                    {!audioURL ? (
                                        <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all ${isRecording ? 'bg-red-50 text-red-600 border-2 border-red-100 animate-pulse' : 'bg-gray-50 text-gray-600 border-2 border-gray-100 hover:bg-gray-100'}`}>
                                            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                            {isRecording ? 'Stop Recording' : 'Add Voice Note'}
                                        </button>
                                    ) : (
                                        <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0"><Mic size={20} /></div>
                                            <div className="flex-1 min-w-0"><p className="text-[9px] font-bold text-green-800 uppercase tracking-widest mb-1">Voice Note Ready</p><audio src={audioURL} controls className="h-8 w-full" /></div>
                                            <button type="button" onClick={() => {setAudioBlob(null); setAudioURL(null);}} className="text-red-500 hover:text-red-600"><X size={18} /></button>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake"><AlertCircle size={20} /><p className="text-[10px] font-black uppercase tracking-tight">{error}</p></div>}

                                <button type="submit" disabled={loading} className="w-full h-14 sm:h-16 bg-green-900 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-green-900/30 hover:bg-green-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                    {loading ? 'Submitting Bayad...' : 'Confirm Settlement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettleDebtPage;
