import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    DollarSign, 
    FileText, 
    User, 
    Tag, 
    ArrowLeft,
    ChevronLeft,
    CheckCircle,
    Info,
    X,
    AlertCircle,
    Plus
} from 'lucide-react';

const AddBillPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '',
        due_date: '',
        details: '',
        category_id: '',
        person_in_charge_id: ''
    });
    const [categories, setCategories] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchRequiredData = async () => {
            try {
                console.log('Fetching form data...');
                const response = await api.get('/bills/create-data');
                console.log('Form data fetched:', response.data);
                setCategories(response.data.categories);
                setPeople(response.data.people);
                setDataLoading(false);
            } catch (err) {
                console.error('Failed to fetch page data:', err);
                setError(`Connection failed: ${err.message}. Please ensure the backend server is running.`);
                setDataLoading(false);
            }
        };
        fetchRequiredData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleConfirmAdd = async () => {
        setLoading(true);
        setError('');
        setShowConfirmModal(false);
        try {
            await api.post('/bills', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add bill. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="w-10 h-10 border-4 border-green-900/20 border-t-green-900 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-bold text-xs animate-pulse">Initializing bill form...</p>
                {error && (
                    <div className="mt-4 bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 font-bold text-xs max-w-md text-center">
                        {error}
                        <button onClick={() => window.location.reload()} className="block mx-auto mt-2 text-green-700 underline">Try Again</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-6 lg:p-10 relative">
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Bill Details</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Review before adding to system</p>
                            </div>
                            <button onClick={() => setShowConfirmModal(false)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <User size={12} className="text-green-600" />
                                        Person In-Charge
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {people.find(p => p.id == formData.person_in_charge_id)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <Tag size={12} className="text-green-600" />
                                        Category
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {categories.find(c => c.id == formData.category_id)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <DollarSign size={12} className="text-green-600" />
                                        Total Amount
                                    </div>
                                    <span className="text-xl font-bold text-green-900">₱{formData.amount}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <Calendar size={12} className="text-green-600" />
                                        Due Date
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{formData.due_date}</span>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        <FileText size={12} className="text-green-600" />
                                        Details
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl text-[11px] font-bold text-gray-600 leading-relaxed border border-gray-100">
                                        {formData.details}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmAdd}
                                    className="flex-2 bg-green-950 text-white py-4 px-8 rounded-2xl font-bold text-sm hover:bg-green-900 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 group"
                                >
                                    Confirm & Add
                                    <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-10 px-4 w-full">
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
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Add New Bill</p>
                        <p className="text-sm font-black text-gray-900 leading-none">REMINDer Bill Management</p>
                    </div>
                    <div className="w-11 h-11 bg-[#0a1f12] rounded-full flex items-center justify-center text-[#22c55e] shadow-lg">
                        <Plus size={22} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Form Section */}
                <div className="lg:col-span-8 h-full">
                    <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-gray-100 overflow-hidden h-full flex flex-col">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 font-bold text-xs flex items-center gap-3 animate-shake">
                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Info size={14} />
                                    </div>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100 font-bold text-xs flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <CheckCircle size={14} />
                                    </div>
                                    Bill added successfully! Redirecting...
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <User size={14} className="text-green-600" />
                                        Person In-Charge
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.person_in_charge_id}
                                            onChange={(e) => setFormData({ ...formData, person_in_charge_id: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 text-gray-900 font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Person</option>
                                            {people.map((person) => (
                                                <option key={person.id} value={person.id}>{person.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ArrowLeft size={14} className="-rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <Tag size={14} className="text-green-600" />
                                        Bill Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 text-gray-900 font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ArrowLeft size={14} className="-rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <DollarSign size={14} className="text-green-600" />
                                        Amount (PHP)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 text-gray-900 font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all text-sm"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                        <Calendar size={14} className="text-green-600" />
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 text-gray-900 font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                    <FileText size={14} className="text-green-600" />
                                    Bill Details / Description
                                </label>
                                <textarea
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-4 text-gray-900 font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all min-h-[120px] text-sm resize-none"
                                    placeholder="Provide more information about this bill..."
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full bg-green-950 text-white py-4 rounded-2xl font-bold text-sm hover:bg-green-900 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Review & Save Bill
                                            <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-4 space-y-6 h-full flex flex-col">
                    <div className="bg-green-950 p-8 rounded-3xl text-white relative overflow-hidden flex-1 flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Quick Guide</h3>
                            <p className="text-green-100/60 text-xs leading-relaxed mb-6">
                                Please ensure all fields are filled correctly. The bill status will be set to <span className="text-green-400 font-bold uppercase">Pending</span> by default until proof of payment is uploaded.
                            </p>
                            
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-green-100/80">Select the correct person in charge for accountability.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-green-100/80">Double-check the amount to avoid discrepancies.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-green-100/80">Due dates are used for automated reminders.</p>
                                </li>
                            </ul>
                        </div>
                        {/* Abstract background */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-900 rounded-full blur-3xl opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBillPage;
