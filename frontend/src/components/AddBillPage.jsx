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
    Loader2,
    Sparkles,
    ShieldCheck
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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initialising Portal</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-8 relative overflow-hidden flex flex-col items-center">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] opacity-60"></div>
            </div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-green-600 hover:border-green-100 shadow-sm transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Exit to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-2xl border border-green-100/50">
                        <Sparkles size={14} className="text-green-600" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">New Entry Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-green-100 shadow-xl shadow-green-900/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[4rem] -z-0"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
                                    <Plus size={28} strokeWidth={2.5} />
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">Add New <br/>Financial Bill</h1>
                                <p className="text-xs font-medium text-gray-500 leading-relaxed mb-8">
                                    Enter the specifics of your bill to maintain accurate financial tracking.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <ShieldCheck size={16} className="text-green-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Secure Logging</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <CheckCircle2 size={16} className="text-green-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Auto-Validation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-green-100 shadow-2xl shadow-green-900/5 space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Amount Input */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">
                                        <Banknote size={14} /> Amount (PHP)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={e => setFormData({...formData, amount: e.target.value})}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 pl-12 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-black text-gray-900 text-lg shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Date Input */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">
                                        <Calendar size={14} /> Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={e => setFormData({...formData, due_date: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Category Select */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">
                                        <Layers size={14} /> Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.category_id}
                                            onChange={e => setFormData({...formData, category_id: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Person Select */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">
                                        <Users size={14} /> Person In-Charge
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.person_in_charge_id}
                                            onChange={e => setFormData({...formData, person_in_charge_id: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Member</option>
                                            {people.map(person => (
                                                <option key={person.id} value={person.id}>{person.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Input */}
                            <div className="space-y-3 group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">
                                    <FileText size={14} /> Description & Details
                                </label>
                                <textarea
                                    value={formData.details}
                                    onChange={e => setFormData({...formData, details: e.target.value})}
                                    placeholder="Enter invoice numbers, account details, or special notes..."
                                    rows="4"
                                    className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm resize-none placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            {message.text && (
                                <div className={`p-5 rounded-[1.5rem] flex items-center gap-4 animate-fade-in shadow-sm border ${
                                    message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{message.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                                        <span className="uppercase tracking-widest">Confirm & Save Bill</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBillPage;
