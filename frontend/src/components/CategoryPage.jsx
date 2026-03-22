import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Layers, 
    Plus,
    Trash2,
    Palette,
    LayoutGrid,
    LayoutList,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#22c55e' });
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/categories', newCategory);
            setNewCategory({ name: '', color: '#22c55e' });
            fetchCategories();
            setMessage({ text: 'Category added successfully!', type: 'success' });
        } catch (err) {
            console.error('Error adding category:', err);
            setMessage({ 
                text: err.response?.data?.message || 'Failed to add category.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
            setMessage({ text: 'Category deleted successfully!', type: 'success' });
        } catch (err) {
            console.error('Error deleting category:', err);
            setMessage({ 
                text: err.response?.data?.message || 'Failed to delete category.', 
                type: 'error' 
            });
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 lg:p-6 flex flex-col">
            
            {/* Header & Add Form */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-green-100 shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-bl-[10rem] -z-0"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-900/20">
                            <Layers size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Manage Categories</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organize your bills efficiently</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="Category Name (e.g. Internet, Electricity)"
                                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-sm"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
                            <Palette size={18} className="text-gray-400" />
                            <input
                                type="color"
                                value={newCategory.color}
                                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                className="w-10 h-10 border-none rounded-lg cursor-pointer bg-transparent"
                            />
                            <span className="text-xs font-black text-gray-400 uppercase">{newCategory.color}</span>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-green-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Adding...' : <><Plus size={18} /> Add Category</>}
                        </button>
                    </form>

                    {message.text && (
                        <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span className="text-xs font-bold">{message.text}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions & View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Existing Categories ({categories.length})
                </h3>
                <div className="bg-white p-1 rounded-xl border border-green-100 shadow-sm flex items-center">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white' : 'text-gray-400 hover:bg-green-50'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-900 text-white' : 'text-gray-400 hover:bg-green-50'}`}
                    >
                        <LayoutList size={16} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="group bg-white rounded-[2rem] p-6 border border-green-50 shadow-sm hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all flex flex-col items-center relative overflow-hidden">
                                <div 
                                    className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-all"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    <Layers size={24} />
                                </div>
                                <h4 className="font-black text-gray-900 text-sm text-center mb-1">{cat.name}</h4>
                                <div className="flex items-center gap-1.5 mb-6">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{cat.color}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
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
                                                <div 
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                                    style={{ backgroundColor: cat.color }}
                                                >
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
                                            <button 
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
