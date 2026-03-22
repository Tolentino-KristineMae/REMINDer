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
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    CreditCard,
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
    const [focusedField, setFocusedField] = useState(null);

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
            setTimeout(() => {
                navigate('/');
            }, 1500);
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
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest tracking-widest">Initialising Portal</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
                {/* Page Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-900 flex items-center justify-center shadow-lg shadow-green-900/20">
                            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Bill</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Create a new financial record</p>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-3 bg-green-50 px-4 py-2 rounded-2xl border border-green-100/50">
                        <Sparkles size={14} className="text-green-600" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">New Entry Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] border border-green-100 shadow-2xl shadow-green-900/5 overflow-hidden">
                            <div className="p-8 sm:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Amount & Due Date */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors ${focusedField === 'amount' ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Banknote className="w-4 h-4" /> Amount (PHP)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₱</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                    onFocus={() => setFocusedField('amount')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 pl-12 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-black text-gray-900 text-lg shadow-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 group">
                                            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors ${focusedField === 'due_date' ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Calendar className="w-4 h-4" /> Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.due_date}
                                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                                onFocus={() => setFocusedField('due_date')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Category & Person */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors ${focusedField === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Layers className="w-4 h-4" /> Category
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.category_id}
                                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                                    onFocus={() => setFocusedField('category')}
                                                    onBlur={() => setFocusedField(null)}
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

                                        <div className="space-y-3 group">
                                            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors ${focusedField === 'person' ? 'text-green-600' : 'text-gray-400'}`}>
                                                <Users className="w-4 h-4" /> Assigned To
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.person_in_charge_id}
                                                    onChange={e => setFormData({ ...formData, person_in_charge_id: e.target.value })}
                                                    onFocus={() => setFocusedField('person')}
                                                    onBlur={() => setFocusedField(null)}
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

                                    {/* Details */}
                                    <div className="space-y-3 group">
                                        <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors ${focusedField === 'details' ? 'text-green-600' : 'text-gray-400'}`}>
                                            <FileText className="w-4 h-4" /> Description & Details
                                        </label>
                                        <textarea
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                            onFocus={() => setFocusedField('details')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Enter invoice numbers, account details, or special notes..."
                                            rows="4"
                                            className="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm resize-none placeholder:text-gray-300"
                                            required
                                        />
                                    </div>

                                    {/* Message Display */}
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

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Plus size={20} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                                                <span className="uppercase tracking-widest">Add Bill Record</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Monthly Overview */}
                        <div className="bg-white rounded-[2rem] border border-green-100 shadow-xl shadow-green-900/5 p-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp size={14} className="text-green-600" /> Monthly Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-900 flex items-center justify-center shadow-md">
                                        <CreditCard size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Bills</p>
                                        <p className="text-lg font-black text-gray-900">Calculated...</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-900 flex items-center justify-center shadow-md">
                                        <TrendingUp size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Volume</p>
                                        <p className="text-lg font-black text-gray-900">Tracking...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security/Trust Box */}
                        <div className="bg-green-900 rounded-[2rem] p-6 text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[3rem] -z-0"></div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-green-400">Security Port</h3>
                                <p className="text-[11px] font-medium text-green-100/70 leading-relaxed mb-4">
                                    All entries are end-to-end encrypted and securely stored in our audit-ready vault.
                                </p>
                                <div className="flex items-center gap-2 text-green-400">
                                    <ShieldCheck size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">System Guard Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="bg-white rounded-[2rem] border border-green-100 shadow-xl shadow-green-900/5 p-6 border-l-4 border-l-green-600">
                            <h3 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Pro Tip</h3>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                Use clear descriptions like "Invoice #123" to make settlement searches faster for your team members.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBillPage;
