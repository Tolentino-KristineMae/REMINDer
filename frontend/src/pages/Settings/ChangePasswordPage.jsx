import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from 'lucide-react';

const fields = [
    ['current_password', 'Current password', 'Enter your current password'],
    ['password', 'New password', 'At least 8 characters'],
    ['password_confirmation', 'Confirm new password', 'Repeat your new password'],
];

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [visible, setVisible] = useState({});
    const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const mismatch = form.password_confirmation && form.password !== form.password_confirmation;
    const strength = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mismatch) return;
        setLoading(true); setMessage({ text: '', type: '' });
        try {
            await api.post('/user/change-password', form);
            setMessage({ text: 'Your password has been updated.', type: 'success' });
            setForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || 'Unable to update your password. Please try again.', type: 'error' });
        } finally { setLoading(false); }
    };

    return (
        <main className="min-h-screen bg-[#f7faf8] px-5 py-8 text-[#16221b] sm:px-8 lg:py-14">
            <div className="mx-auto max-w-[620px]">
                <button onClick={() => navigate(-1)} className="mb-8 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-semibold text-[#718078] transition-colors hover:text-[#287342]"><ArrowLeft size={15} /> Back</button>
                <section className="overflow-hidden rounded-2xl border border-[#e0e9e2] bg-white shadow-[0_18px_50px_rgba(31,61,42,.08)]">
                    <div className="border-b border-[#edf2ee] px-6 py-7 sm:px-10">
                        <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-[#edf8f0] text-[#287342]"><KeyRound size={20} /></div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#398451]">Account security</p>
                        <h1 className="text-2xl font-bold tracking-[-.04em] sm:text-3xl">Change password</h1>
                        <p className="mt-2 text-sm text-[#718078]">Use a strong password you do not reuse elsewhere.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-7 sm:px-10 sm:py-9">
                        {fields.map(([key, label, placeholder]) => (
                            <label key={key} className="flex flex-col gap-2 text-xs font-semibold text-[#536159]">
                                {label}
                                <span className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa69f]" size={16} />
                                    <input type={visible[key] ? 'text' : 'password'} value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={placeholder} required minLength={key !== 'current_password' ? 8 : undefined} disabled={loading} className="h-12 w-full rounded-xl border border-[#dbe5de] bg-[#fbfdfb] px-11 pr-11 text-sm font-medium text-[#16221b] outline-none transition focus:border-[#4aa764] focus:bg-white focus:ring-4 focus:ring-[#4aa764]/10 disabled:opacity-60" />
                                    <button type="button" onClick={() => setVisible((current) => ({ ...current, [key]: !current[key] }))} aria-label={visible[key] ? `Hide ${label}` : `Show ${label}`} className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[#9aa69f] hover:text-[#287342]">{visible[key] ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                                </span>
                                {key === 'password' && form.password && <span className="flex items-center gap-2 pt-1"><span className="flex flex-1 gap-1">{[1,2,3,4].map((item) => <i key={item} className={`h-1 flex-1 rounded-full ${item <= strength ? 'bg-[#4aa764]' : 'bg-[#e7eee9]'}`} />)}</span><small className="text-[11px] font-medium text-[#718078]">{strength}/4</small></span>}
                                {key === 'password_confirmation' && mismatch && <span className="text-[11px] font-medium text-red-500">Passwords do not match.</span>}
                            </label>
                        ))}
                        {message.text && <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'border-[#cfe8d5] bg-[#f2fbf4] text-[#287342]' : 'border-red-200 bg-red-50 text-red-600'}`}>{message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}{message.text}</div>}
                        <button type="submit" disabled={loading || !!mismatch} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl border-0 bg-[#1d6335] text-sm font-bold text-white shadow-[0_7px_16px_rgba(29,99,53,.18)] transition hover:bg-[#174f2a] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 className="animate-spin" size={17} /> Updating...</> : 'Update password'}</button>
                    </form>
                </section>
            </div>
        </main>
    );
}
