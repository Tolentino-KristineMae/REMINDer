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
import BackgroundAuth from './BackgroundAuth';
import Logo from './Logo';

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
            <div className="min-h-screen bg-green-950 flex flex-col items-center justify-center relative overflow-hidden">
                <BackgroundAuth />
                <div className="relative z-10 flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20">
                    <Loader2 className="text-white animate-spin" size={40} />
                    <p className="text-xs font-black text-white uppercase tracking-widest">Preparing System...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-bill-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

                .add-bill-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    padding: 40px 20px;
                    overflow-x: hidden;
                }

                .bill-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 500px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    animation: cardFadeIn .6s cubic-bezier(.22,1,.36,1) both;
                }

                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .back-btn {
                    position: absolute;
                    top: -60px;
                    left: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: white;
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    opacity: 0.8;
                    transition: all 0.2s ease;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .back-btn:hover { opacity: 1; transform: translateX(-4px); }

                .card-header { text-align: center; margin-bottom: 32px; }
                .card-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 26px; font-weight: 800;
                    color: #0f172a; margin-top: 16px;
                    letter-spacing: -0.5px;
                }
                .card-sub {
                    font-size: 14px; color: #64748b;
                    margin-top: 6px;
                }

                .form-group { margin-bottom: 20px; }
                .form-label {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 11px; font-weight: 700;
                    color: #475569; text-transform: uppercase;
                    letter-spacing: 0.05em; margin-bottom: 8px;
                    padding-left: 4px;
                }
                .input-wrapper { position: relative; }
                .input-icon {
                    position: absolute; left: 16px; top: 50%;
                    transform: translateY(-50%); color: #94a3b8;
                    pointer-events: none;
                }
                .form-input {
                    width: 100%; padding: 14px 16px 14px 44px;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 16px;
                    font-size: 14px; font-weight: 500;
                    color: #1e293b; outline: none;
                    transition: all 0.25s ease;
                }
                .form-input:focus {
                    background: #ffffff;
                    border-color: #22c55e;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
                }
                select.form-input { appearance: none; cursor: pointer; }

                .textarea-input {
                    padding-left: 16px;
                    min-height: 100px;
                    resize: none;
                }

                .submit-btn {
                    width: 100%; padding: 16px; margin-top: 12px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    border: none; border-radius: 18px; color: white;
                    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
                    cursor: pointer; letter-spacing: 0.02em;
                    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
                    transition: all 0.25s cubic-bezier(.22,1,.36,1);
                    display: flex; items-center; justify-content: center; gap: 10px;
                }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(34, 197, 94, 0.5); }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .alert {
                    padding: 14px 18px; border-radius: 16px;
                    font-size: 13px; font-weight: 600;
                    margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
                    animation: alertFade .4s ease;
                }
                @keyframes alertFade { from{opacity:0;transform:scale(0.95);} to{opacity:1;transform:scale(1);} }
                .alert-success { background: #f0fdf4; border: 1px solid #dcfce7; color: #166534; }
                .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

                @media (max-width: 480px) {
                    .bill-card { padding: 32px 24px; border-radius: 24px; }
                    .back-btn { top: -50px; }
                }
            `}</style>

            <BackgroundAuth />

            <div className="bill-card">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <div className="card-header">
                    <Logo size="md" />
                    <h2 className="card-title">Create New Bill</h2>
                    <p className="card-sub">Record a new financial obligation</p>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <Banknote size={13} /> Amount (PHP)
                        </label>
                        <div className="input-wrapper">
                            <span className="input-icon font-bold text-sm">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                placeholder="0.00"
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={13} /> Due Date
                        </label>
                        <div className="input-wrapper">
                            <Calendar size={18} className="input-icon" />
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={e => setFormData({...formData, due_date: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">
                                <Layers size={13} /> Category
                            </label>
                            <div className="input-wrapper">
                                <Layers size={18} className="input-icon" />
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Users size={13} /> In-Charge
                            </label>
                            <div className="input-wrapper">
                                <Users size={18} className="input-icon" />
                                <select
                                    value={formData.person_in_charge_id}
                                    onChange={e => setFormData({...formData, person_in_charge_id: e.target.value})}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {people.map(person => (
                                        <option key={person.id} value={person.id}>{person.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={13} /> Description
                        </label>
                        <textarea
                            value={formData.details}
                            onChange={e => setFormData({...formData, details: e.target.value})}
                            placeholder="Add invoice #, account details, etc."
                            className="form-input textarea-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                    >
                        {loading ? (
                            <div className="spinner" />
                        ) : (
                            <>
                                <Plus size={18} strokeWidth={3} />
                                <span>Save Bill Entry</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBillPage;
