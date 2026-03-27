import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDateLocal, formatCurrency } from '../utils/formatters';
import { 
    X, 
    CheckCircle, 
    ShieldCheck, 
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Calendar,
    CloudUpload,
    Clock,
    Users,
    Mic
} from 'lucide-react';

const SettleBillPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [bill, setBill] = useState(null);
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

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setDetails('');
        setError('');
        setIsUploaded(false);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchBillDetails = async () => {
            resetForm();
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
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }
        
        const selectedFile = files[0];
        
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }
        
        setFile(selectedFile);
        setError('');
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsDataURL(selectedFile);
        
        e.target.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Try to use a specific, widely supported codec
            let options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.warn(`${options.mimeType} is not supported, falling back to default audio/webm`);
                options = { mimeType: 'audio/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.warn('audio/webm is not supported, falling back to default browser codec');
                    options = {}; // Let the browser choose
                }
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
                setAudioBlob(audioBlob);
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check your browser permissions.");
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
        audioChunksRef.current = [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a proof of payment image.');
            return;
        }

        console.log('File being uploaded:', file.name, file.size, file.type);
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('proof', file);
        formData.append('details', details);
        formData.append('paid_by', currentUser?.name || currentUser?.email || 'Unknown');

        // Append audio if exists
        if (audioBlob) {
            formData.append('voice_note', audioBlob, 'recording.webm');
        }

        console.log('FormData proof:', formData.get('proof'));
        console.log('FormData details:', formData.get('details'));
        console.log('FormData paid_by:', formData.get('paid_by'));

        try {
            console.log('Sending request to:', `/bills/${id}/proof`);
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes, ${value.type})` : value);
            }
            const response = await api.post(`/bills/${id}/proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Upload success:', response.data);
            setIsUploaded(true);
            setTimeout(() => {
                navigate('/paid-bills');
            }, 2000);
        } catch (err) {
            console.error('Upload failed with status:', err?.response?.status);
            console.error('Full error response:', err?.response);
            console.error('Error data:', err?.response?.data);
            console.error('Request:', err?.request);

            // Network-layer failures (no HTTP response) come in as "undefined response" in Axios.
            // Your console shows `net::ERR_INTERNET_DISCONNECTED`, which is not a Laravel validation error.
            if (!err?.response) {
                const code = err?.code;
                const msg = err?.message || '';
                if (
                    code === 'ERR_INTERNET_DISCONNECTED' ||
                    code === 'ERR_NETWORK' ||
                    msg.toLowerCase().includes('network')
                ) {
                    setError('No internet connection. Please check your network and try again.');
                    return;
                }

                setError('Upload request failed (no server response). Please check your connection and the backend URL.');
                return;
            }

            const responseData = err?.response?.data;
            console.error('Upload error response:', JSON.stringify(responseData, null, 2));
            
            const proofErr = responseData?.errors?.proof?.[0];
            const detailsErr = responseData?.errors?.details?.[0];
            const genericMsg = responseData?.message;
            
            let errorMessage = proofErr || detailsErr || genericMsg || 'Failed to upload proof. Please try again.';
            setError(errorMessage);
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
                    <p className="text-gray-400 font-medium mb-6 leading-relaxed text-base">Your proof of payment and details have been successfully logged in the system.</p>
                    
                    {audioURL && (
                        <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2">Voice Note Attached</p>
                            <audio src={audioURL} controls className="h-8 w-full" />
                        </div>
                    )}

                    <div className="w-full bg-green-50 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#22c55e] h-full animate-[progress_2s_ease-in-out]"></div>
                    </div>
                    <p className="text-xs font-black text-[#22c55e] uppercase tracking-widest mt-5">Redirecting to History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex flex-col font-sans">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-4 text-gray-500 hover:text-gray-700 transition-all group"
                >
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                        <ChevronLeft size={22} className="stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest">Go Back</span>
                </button>

                <div className="w-11 h-11 bg-[#0a1f12] rounded-full flex items-center justify-center text-[#22c55e] shadow-lg">
                    <CheckCircle2 size={22} className="stroke-[2.5]" />
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
                                <label htmlFor="proof" className="relative group cursor-pointer block">
                                    <input 
                                        type="file" 
                                        name="proof"
                                        id="proof"
                                        className="hidden" 
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        multiple
                                        aria-label="Upload proof of payment"
                                    />
                                    <div className={`
                                        aspect-video sm:aspect-[16/7] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4
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
                                    name="details"
                                    id="details"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Type how you paid (e.g. GCash, Bank Transfer, Cash)..."
                                    className="w-full h-36 bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all resize-none mb-6"
                                />

                                {/* Voice Recording UI */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional: Voice Note</h4>
                                        {audioURL && (
                                            <button 
                                                type="button"
                                                onClick={deleteRecording}
                                                className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
                                            >
                                                Delete Recording
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        {!audioURL ? (
                                            <button
                                                type="button"
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all ${
                                                    isRecording 
                                                    ? 'bg-red-50 text-red-600 border-2 border-red-100 animate-pulse' 
                                                    : 'bg-gray-50 text-gray-600 border-2 border-gray-100 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                                {isRecording ? 'Stop Recording' : 'Add Voice Note'}
                                            </button>
                                        ) : (
                                            <div className="flex-1 bg-green-50 border-2 border-green-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                                                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                                    <Mic size={20} />
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-1">Recorded Voice Note</p>
                                                    <audio src={audioURL} controls className="h-8 w-full" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Paid By */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#0a1f12] text-white rounded-xl flex items-center justify-center text-sm font-black">3</div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Paid By</h3>
                            </div>
                            <div className="p-8 bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment submitted by</p>
                                        <p className="text-sm font-black text-gray-900">{currentUser?.name || currentUser?.email || 'Unknown User'}</p>
                                    </div>
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
                                    <span className="text-xs uppercase tracking-wider">Due: {formatDateLocal(bill?.due_date)}</span>
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
                                    <span className="text-xs uppercase tracking-wider">PIC: <span style={{ color: bill?.person_in_charge?.color || '#d1d5db' }}>{bill?.person_in_charge?.name || 'No PIC'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount</p>
                            <div className="flex items-start gap-2">
                                <span className="text-4xl font-bold tracking-tighter">{formatCurrency(bill?.amount)}</span>
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
