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
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-all mb-6 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Go Back</span>
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] border border-green-100 shadow-xl shadow-green-900/5 overflow-hidden relative">
                    {/* Header Decor */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/50 rounded-bl-[8rem] -z-0"></div>
                    
                    <div className="relative z-10 p-8 lg:p-12">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-900/20">
                                <Plus size={28} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create New Bill</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enter the details for the new entry</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Banknote size={12} className="text-green-600" /> Amount (PHP)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900"
                                        required
                                    />
                                </div>

                                {/* Due Date */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Calendar size={12} className="text-green-600" /> Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={e => setFormData({...formData, due_date: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Layers size={12} className="text-green-600" /> Category
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={e => setFormData({...formData, category_id: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 appearance-none"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Person In Charge */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Users size={12} className="text-green-600" /> Person In-Charge
                                    </label>
                                    <select
                                        value={formData.person_in_charge_id}
                                        onChange={e => setFormData({...formData, person_in_charge_id: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 appearance-none"
                                        required
                                    >
                                        <option value="">Select Person</option>
                                        {people.map(person => (
                                            <option key={person.id} value={person.id}>{person.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <FileText size={12} className="text-green-600" /> Bill Details / Description
                                </label>
                                <textarea
                                    value={formData.details}
                                    onChange={e => setFormData({...formData, details: e.target.value})}
                                    placeholder="Enter specific details about this bill..."
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 resize-none"
                                    required
                                />
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-xs font-bold">{message.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-2xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Creating Bill...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        <span>Confirm & Save Bill Entry</span>
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
