import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Layers, 
    Users,
    Plus,
    Trash2,
    Palette,
    LayoutGrid,
    LayoutList,
    AlertCircle,
    CheckCircle2,
    UserPlus,
    Mail as MailIcon,
    Phone,
    ShieldCheck,
    MoreHorizontal
} from 'lucide-react';
import BackgroundAuth from './BackgroundAuth';

const Management = () => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'people'
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Categories State
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#22c55e' });

    // People State
    const [people, setPeople] = useState([]);
    const [bills, setBills] = useState([]);
    const [newPerson, setNewPerson] = useState({ name: '', email: '', phone: '' });
    const [showAddPerson, setShowAddPerson] = useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            if (activeTab === 'categories') {
                const response = await api.get('/categories');
                setCategories(response.data.categories || []);
            } else {
                const response = await api.get('/bills/dashboard');
                setPeople(response.data.people || []);
                setBills(response.data.bills || []);
            }
        } catch (err) {
            console.error(`Error fetching ${activeTab}:`, err);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Category Handlers
    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/categories', newCategory);
            setNewCategory({ name: '', color: '#22c55e' });
            fetchData();
            setMessage({ text: 'Category added successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to add category.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchData();
            setMessage({ text: 'Category deleted successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to delete category.', type: 'error' });
        }
    };

    // People Handlers
    const handleAddPerson = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/people', newPerson);
            setNewPerson({ name: '', email: '', phone: '' });
            setShowAddPerson(false);
            fetchData();
            setMessage({ text: 'Person added successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to add person.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePerson = async (id) => {
        if (!window.confirm('Are you sure you want to delete this person?')) return;
        try {
            await api.delete(`/people/${id}`);
            fetchData();
            setMessage({ text: 'Person deleted successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to delete person.', type: 'error' });
        }
    };

    const getPersonStats = (personId) => {
        const personBills = bills.filter(b => b.person_in_charge_id === personId);
        const paidCount = personBills.filter(b => b.status === 'paid').length;
        const totalAmount = personBills.reduce((acc, b) => acc + parseFloat(b.amount), 0);
        return {
            count: personBills.length,
            paid: paidCount,
            total: totalAmount,
            performance: personBills.length > 0 ? Math.round((paidCount / personBills.length) * 100) : 0
        };
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-8 flex flex-col relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
                <div className="absolute top-[-5%] right-[-2%] w-[400px] h-[400px] bg-green-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-5%] left-[-2%] w-[350px] h-[350px] bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header Section */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-green-100 shadow-xl shadow-green-900/5 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-bl-[10rem] -z-0"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-start gap-8 mb-10">
                            <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-fit backdrop-blur-sm border border-gray-200/50">
                                <button 
                                    onClick={() => setActiveTab('categories')}
                                    className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-3 ${activeTab === 'categories' ? 'bg-white text-green-900 shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Layers size={16} /> Categories
                                </button>
                                <button 
                                    onClick={() => setActiveTab('people')}
                                    className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-3 ${activeTab === 'people' ? 'bg-white text-green-900 shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Users size={16} /> Person in Charge
                                </button>
                            </div>
                        </div>

                        {/* Add Forms */}
                        <div className="animate-fade-in">
                            {activeTab === 'categories' ? (
                                <form onSubmit={handleAddCategory} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner relative overflow-hidden group">
                                    {/* Decorative subtle gradient */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-bl-full -z-0 blur-2xl group-hover:bg-green-200/40 transition-all duration-500"></div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-end">
                                        <div className="flex-1 w-full group/input">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/input:text-green-600 transition-colors">
                                                <Layers size={14} /> Category Identity
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={newCategory.name}
                                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                                    placeholder="Enter category name..."
                                                    className="w-full bg-white border-2 border-gray-50 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                                    required
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none group-focus-within/input:text-green-500/20 transition-colors">
                                                    <Palette size={20} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 group/color">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/color:text-green-600 transition-colors">
                                                <Palette size={14} /> Theme Color
                                            </label>
                                            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border-2 border-gray-50 focus-within:border-green-500 transition-all h-[60px]">
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                    <input
                                                        type="color"
                                                        value={newCategory.color}
                                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer bg-transparent border-none p-0"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{newCategory.color}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">HEX CODE</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading} 
                                            className="w-full md:w-auto bg-green-900 text-white px-10 h-[60px] rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Plus size={20} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-300" /> 
                                                    <span className="uppercase tracking-widest">Add Category</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                                    {!showAddPerson ? (
                                        <button 
                                            onClick={() => setShowAddPerson(true)}
                                            className="w-full md:w-fit bg-green-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            <UserPlus size={20} strokeWidth={3} /> Add New Team Member
                                        </button>
                                    ) : (
                                        <form onSubmit={handleAddPerson} className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-fade-in">
                                            <div className="group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. John Doe"
                                                    value={newPerson.name}
                                                    onChange={e => setNewPerson({...newPerson, name: e.target.value})}
                                                    className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm shadow-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                                <input
                                                    type="email"
                                                    placeholder="e.g. john@example.com"
                                                    value={newPerson.email}
                                                    onChange={e => setNewPerson({...newPerson, email: e.target.value})}
                                                    className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm shadow-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Optional"
                                                    value={newPerson.phone}
                                                    onChange={e => setNewPerson({...newPerson, phone: e.target.value})}
                                                    className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm shadow-sm"
                                                />
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <button type="submit" disabled={loading} className="flex-1 bg-green-900 text-white rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 h-[52px] active:scale-95">
                                                    Save Member
                                                </button>
                                                <button type="button" onClick={() => setShowAddPerson(false)} className="px-6 bg-white text-gray-400 border border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all h-[52px]">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        {message.text && (
                            <div className={`mt-6 p-5 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm ${
                                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{message.text}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section Header */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div>
                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                            Existing {activeTab === 'categories' ? `Categories (${categories.length})` : `Members (${people.length})`}
                        </h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-green-100 shadow-lg shadow-green-900/5 flex items-center gap-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-green-50'}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-green-50'}`}>
                            <LayoutList size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-8">
                    {activeTab === 'categories' ? (
                        // Categories Content
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="group bg-white rounded-[2rem] p-6 border border-green-50 shadow-sm hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all flex flex-col items-center relative overflow-hidden">
                                        <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-all" style={{ backgroundColor: cat.color }}>
                                            <Layers size={24} />
                                        </div>
                                        <h4 className="font-black text-gray-900 text-sm text-center mb-1">{cat.name}</h4>
                                        <div className="flex items-center gap-1.5 mb-6">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{cat.color}</span>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-green-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-green-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5 text-left">Category</th>
                                            <th className="px-8 py-5 text-center">Color Hex</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-50">
                                        {categories.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-green-50/10 transition-all group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                                                            <Layers size={18} />
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                                        <span className="text-[10px] font-black text-gray-500 uppercase">{cat.color}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        // People Content
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {people.map((person) => {
                                    const stats = getPersonStats(person.id);
                                    return (
                                        <div key={person.id} className="group bg-white rounded-[2rem] p-6 border border-green-50 shadow-sm hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all flex flex-col items-center text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-green-50 group-hover:scale-110"></div>
                                            <div className="relative z-10 w-full flex flex-col items-center">
                                                <div className="relative mb-4">
                                                    <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg overflow-hidden relative">
                                                        <img src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} className="w-full h-full object-cover" alt={person.name} />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-md">
                                                        <ShieldCheck size={14} />
                                                    </div>
                                                </div>
                                                <h3 className="font-black text-green-950 text-lg mb-1">{person.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Person In-Charge</p>
                                                <div className="grid grid-cols-2 w-full gap-4 mb-6">
                                                    <div className="bg-green-50/50 p-3 rounded-2xl border border-green-50">
                                                        <p className="text-[9px] font-black text-green-900/50 uppercase mb-1">Assigned</p>
                                                        <p className="text-sm font-black text-green-900">{stats.count}</p>
                                                    </div>
                                                    <div className="bg-green-50/50 p-3 rounded-2xl border border-green-50">
                                                        <p className="text-[9px] font-black text-green-900/50 uppercase mb-1">Performance</p>
                                                        <p className="text-sm font-black text-green-900">{stats.performance}%</p>
                                                    </div>
                                                </div>
                                                <div className="w-full flex items-center gap-2 mb-6">
                                                    <button className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl font-bold text-[10px] hover:bg-green-100 transition-all">
                                                        <MailIcon size={14} /> Message
                                                    </button>
                                                    <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                                                        <Phone size={14} />
                                                    </button>
                                                </div>
                                                <div className="w-full pt-4 border-t border-green-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                        <span className="text-[9px] font-black text-green-600 uppercase">Online</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleDeletePerson(person.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button className="p-1.5 text-gray-300 hover:text-green-600 transition-all">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-green-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[900px] w-full">
                                        <thead className="bg-green-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Team Member</th>
                                                <th className="px-6 py-4 text-center">Assigned Bills</th>
                                                <th className="px-6 py-4 text-center">Settled</th>
                                                <th className="px-6 py-4 text-center">Total Value</th>
                                                <th className="px-6 py-4 text-center">Performance</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-green-50">
                                            {people.map((person) => {
                                                const stats = getPersonStats(person.id);
                                                return (
                                                    <tr key={person.id} className="hover:bg-green-50/10 transition-all group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} className="w-10 h-10 rounded-xl border border-green-50 shadow-sm" alt={person.name} />
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 text-sm">{person.name}</h4>
                                                                    <p className="text-[10px] font-medium text-gray-400">{person.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-black text-green-950">{stats.count}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-black text-green-600">{stats.paid}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-black text-green-950">₱{stats.total.toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <div className="w-20 bg-green-50 h-1.5 rounded-full overflow-hidden">
                                                                    <div className="bg-green-500 h-full" style={{ width: `${stats.performance}%` }}></div>
                                                                </div>
                                                                <span className="text-[10px] font-black text-green-600">{stats.performance}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => handleDeletePerson(person.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                                <button className="p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Management;
