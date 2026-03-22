import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Plus, 
    Calendar, 
    Banknote, 
    FileText, 
    Layers, 
    Users,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

const AddBillPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState([]);
    const [people, setPeople] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        amount: '',
        due_date: '',
        details: '',
        category_id: '',
        person_in_charge_id: ''
    });

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const response = await api.get('/bills/dashboard');
                // Use a Set to track unique category IDs
                const uniqueCategoryIds = new Set();
                const uniqueCategories = [];
                
                if (response.data.bills) {
                    response.data.bills.forEach(b => {
                        if (b.category && !uniqueCategoryIds.has(b.category.id)) {
                            uniqueCategoryIds.add(b.category.id);
                            uniqueCategories.push(b.category);
                        }
                    });
                }
                
                setCategories(uniqueCategories);
                setPeople(response.data.people || []);
                
                // Fallback: If categories are empty, fetch from categories endpoint
                if (uniqueCategories.length === 0) {
                    const catRes = await api.get('/categories');
                    setCategories(catRes.data.categories || []);
                }
            } catch (err) {
                console.error('Error fetching form data:', err);
            } finally {
                setFetching(false);
            }
        };

        fetchFormData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await api.post('/bills', formData);
            setMessage({ text: 'Bill created successfully!', type: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Error creating bill:', err);
            setMessage({ 
                text: err.response?.data?.message || 'Failed to create bill. Please check your inputs.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex-1 min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-green-600 animate-spin" size={32} />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preparing Form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-5xl relative z-10">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-all mb-8 group bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to Dashboard</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Info & Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-green-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col">
                            <div className="relative z-10 flex-1">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/5 backdrop-blur-sm shadow-xl">
                                    <Banknote className="text-green-400" size={32} />
                                </div>
                                
                                <h2 className="text-3xl font-black mb-4 leading-tight tracking-tighter">Create New <br/>Bill Entry</h2>
                                <p className="text-green-100/70 text-sm font-medium mb-8 leading-relaxed">
                                    Fill in the details to record a new financial obligation. All entries are encrypted and securely logged.
                                </p>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <ShieldCheck size={20} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Security</p>
                                            <p className="text-xs font-bold text-white">End-to-End Encryption</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 size={20} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Verification</p>
                                            <p className="text-xs font-bold text-white">Smart Validation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 mt-8 border-t border-white/10">
                                <div className="flex items-center gap-2 text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
                                </div>
                            </div>

                            {/* Abstract decor */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-800 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] border border-green-100 shadow-xl shadow-green-900/5 p-8 lg:p-12 relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Amount */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-600 transition-colors">
                                            <Banknote size={14} /> Amount (PHP)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0.00"
                                                className="w-full bg-gray-50 border-2 border-gray-50 pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-black text-gray-900 text-lg shadow-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-600 transition-colors">
                                            <Calendar size={14} /> Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={e => setFormData({...formData, due_date: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Category */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-600 transition-colors">
                                            <Layers size={14} /> Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.category_id}
                                                onChange={e => setFormData({...formData, category_id: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Person In Charge */}
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-600 transition-colors">
                                            <Users size={14} /> Person In-Charge
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.person_in_charge_id}
                                                onChange={e => setFormData({...formData, person_in_charge_id: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="">Select Person</option>
                                                {people.map(person => (
                                                    <option key={person.id} value={person.id}>{person.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-600 transition-colors">
                                        <FileText size={14} /> Bill Details / Description
                                    </label>
                                    <textarea
                                        value={formData.details}
                                        onChange={e => setFormData({...formData, details: e.target.value})}
                                        placeholder="Enter specific details about this bill (e.g. Account Number, Invoice #)..."
                                        rows="4"
                                        className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 resize-none shadow-sm"
                                        required
                                    />
                                </div>

                                {message.text && (
                                    <div className={`p-5 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm ${
                                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight">{message.text}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-2xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} strokeWidth={3} />
                                            <span className="uppercase tracking-widest">Confirm & Save Bill Entry</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBillPage;
