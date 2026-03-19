import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    X, 
    Upload, 
    CheckCircle, 
    ShieldCheck, 
    Trash2, 
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Calendar,
    CloudUpload,
    Clock,
    Users
} from 'lucide-react';

const SettleBillPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [details, setDetails] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [isUploaded, setIsUploaded] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        let isMounted = true;

        const fetchBillDetails = async () => {
            try {
                const response = await api.get(`/bills/${id}`);
                if (isMounted) setBill(response.data);
            } catch (err) {
                console.error('Error fetching bill details:', err);
                if (isMounted) setError('Could not load bill details.');
            } finally {
                if (isMounted) setFetching(false);
            }
        };

        fetchBillDetails();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioURL(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a proof of payment image.');
            return;
        }

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('proof', file);
        formData.append('details', details);
        if (audioBlob) {
            formData.append('voice_record', audioBlob, 'recording.webm');
        }

        try {
            await api.post(`/bills/${id}/proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsUploaded(true);
            setTimeout(() => {
                navigate('/paid-bills');
            }, 2000);
        } catch {
            setError('Failed to upload proof. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f0f9f4]">
                <div className="w-14 h-14 border-4 border-[#0a1f12]/20 border-t-[#0a1f12] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isUploaded) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f0f9f4] p-8">
                <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-14 text-center border border-green-100">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle className="text-[#22c55e]" size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-green-950 mb-3 tracking-tight">Payment Secured!</h2>
                    <p className="text-gray-400 font-medium mb-10 leading-relaxed text-base">Your proof of payment and details have been successfully logged in the system.</p>
                    <div className="w-full bg-green-50 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#22c55e] h-full animate-[progress_2s_ease-in-out]"></div>
                    </div>
                    <p className="text-xs font-black text-[#22c55e] uppercase tracking-widest mt-5">Redirecting to History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-6 lg:p-10 flex flex-col font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-4 text-gray-500 hover:text-gray-700 transition-all group"
                >
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                        <ChevronLeft size={22} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest">Go Back</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Submit Proof</p>
                        <p className="text-sm font-black text-gray-900 leading-none">REMINDer Verification</p>
                    </div>
                    <div className="w-11 h-11 bg-[#0a1f12] rounded-full flex items-center justify-center text-[#22c55e] shadow-lg">
                        <CheckCircle2 size={22} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Right Side: Form Steps */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Upload */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#0a1f12] text-white rounded-xl flex items-center justify-center text-sm font-black">1</div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Upload Receipt</h3>
                            </div>
                            <div className="p-8">
                                <label className="relative group cursor-pointer block">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <div className={`
                                        aspect-[16/7] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4
                                        ${preview ? 'border-green-600 bg-green-50/50' : 'border-gray-200 bg-gray-50 group-hover:border-green-600 group-hover:bg-green-50/50'}
                                    `}>
                                        {preview ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                    <p className="text-white font-bold text-xs uppercase tracking-widest">Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                                    <CloudUpload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-gray-900">Select Receipt Image</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">JPEG, PNG, GIF — Max 5MB</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Step 2: Details */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#0a1f12] text-white rounded-xl flex items-center justify-center text-sm font-black">2</div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment Details</h3>
                            </div>
                            <div className="p-8">
                                <textarea 
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Type how you paid (e.g. GCash, Bank Transfer, Cash)..."
                                    className="w-full h-36 bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Step 3: Voice */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#0a1f12] text-white rounded-xl flex items-center justify-center text-sm font-black">3</div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Voice Confirmation</h3>
                            </div>
                            <div className="p-8 flex items-center justify-between bg-white">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Leave a voice note</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Optional confirmation</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {audioURL && (
                                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                            <audio src={audioURL} controls className="h-10 w-48" />
                                            <button 
                                                type="button"
                                                onClick={deleteRecording}
                                                className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`
                                            flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all
                                            ${isRecording 
                                                ? 'bg-red-500 text-white animate-pulse' 
                                                : 'bg-green-950 text-white hover:bg-green-900 shadow-xl shadow-green-900/20'}
                                        `}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-green-400'}`}></div>
                                        {isRecording ? 'Recording...' : 'Record'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-950 text-white py-4 rounded-2xl font-bold text-sm hover:bg-green-900 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Finalize Settlement
                                        <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Left Side: Bill Info Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-green-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                        <div className="relative z-10 flex-1">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                                <Calendar className="text-green-400" size={28} />
                            </div>
                            
                            <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-1.5 rounded-full mb-4 border border-green-400/20">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest">Awaiting Payment</span>
                            </div>

                            <h2 className="text-2xl font-bold mb-6 leading-tight">{bill?.details}</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-300 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Calendar size={16} />
                                    </div>
                                    <span className="text-xs uppercase tracking-wider">Due: {new Date(bill?.due_date).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Clock size={16} />
                                    </div>
                                    <span className="text-xs uppercase tracking-wider">Category: {bill?.category?.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                    <span className="text-xs uppercase tracking-wider">PIC: {bill?.person_in_charge?.name || 'No PIC'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount</p>
                            <div className="flex items-start gap-2">
                                <span className="text-xl font-bold mt-1">₱</span>
                                <span className="text-4xl font-bold tracking-tighter">{bill?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Abstract background */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-900 rounded-full blur-3xl opacity-50"></div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl text-gray-900 relative overflow-hidden flex-1 flex flex-col justify-center border border-gray-100 shadow-xl shadow-green-900/5">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0 mb-4">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Security Note</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                Please ensure the receipt image is clear and all details are visible for faster verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-10 right-10 bg-red-50 border border-red-100 p-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up z-50">
                    <AlertCircle className="text-red-500" size={24} />
                    <p className="text-red-600 text-sm font-black uppercase tracking-tight">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SettleBillPage;
