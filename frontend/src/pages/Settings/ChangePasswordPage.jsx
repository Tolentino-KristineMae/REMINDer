import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Primitives ──────────────────────────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder, focused, onFocus, onBlur, show, onToggle, error }) => (
    <div className="space-y-2.5">
        <label className={cn(
            'flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors pl-1',
            focused ? 'text-green-600' : 'text-gray-400'
        )}>
            <Lock className="w-3.5 h-3.5" />
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                required
                className={cn(
                    'w-full h-14 lg:h-16 px-5 pr-12 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300',
                    error && 'border-red-300 bg-red-50 focus:border-red-400'
                )}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
        {error && <p className="text-[11px] text-red-500 font-medium pl-1">{error}</p>}
    </div>
);

function FeatureItem({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Icon className="w-4 h-4 text-green-700" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [focusedField, setFocusedField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });

    const [form, setForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const strength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthMeta = [
        null,
        { label: 'Weak', color: 'bg-red-400', text: 'text-red-500' },
        { label: 'Fair', color: 'bg-amber-400', text: 'text-amber-500' },
        { label: 'Good', color: 'bg-blue-400', text: 'text-blue-500' },
        { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
    ][strength];

    const mismatch = form.password_confirmation && form.password !== form.password_confirmation;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mismatch) return;
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/user/change-password', form);
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setMessage({
                text: err?.response?.data?.message || 'Failed to change password. Please try again.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 lg:mb-8 flex items-center gap-2 text-gray-400 hover:text-green-700 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Go Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">

                    {/* ── Left panel ── */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                            <div className="h-1.5 bg-green-900" />
                            <div className="p-6 lg:p-8">
                                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-900 mb-6 shadow-inner">
                                    <KeyRound size={22} />
                                </div>
                                <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-1">
                                    Change Password
                                </h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em] leading-relaxed mb-6">
                                    Update your account security
                                </p>
                                <div className="space-y-3">
                                    <FeatureItem icon={ShieldCheck} label="Encrypted Storage" />
                                    <FeatureItem icon={CheckCircle2} label="Session Protected" />
                                    <FeatureItem icon={Lock} label="Instant Update" />
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-2xl p-5 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300 mb-2">Password Tips</p>
                                <ul className="space-y-1.5">
                                    {['At least 8 characters', 'Mix uppercase & lowercase', 'Include numbers', 'Add special characters'].map(tip => (
                                        <li key={tip} className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ── Form ── */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                            <div className="p-6 sm:p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-7">

                                    {/* Current password */}
                                    <PasswordInput
                                        label="Current Password"
                                        value={form.current_password}
                                        onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                                        placeholder="Enter your current password"
                                        focused={focusedField === 'current'}
                                        onFocus={() => setFocusedField('current')}
                                        onBlur={() => setFocusedField(null)}
                                        show={show.current}
                                        onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
                                    />

                                    <div className="border-t border-gray-50" />

                                    {/* New password */}
                                    <PasswordInput
                                        label="New Password"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Min. 8 characters"
                                        focused={focusedField === 'new'}
                                        onFocus={() => setFocusedField('new')}
                                        onBlur={() => setFocusedField(null)}
                                        show={show.new}
                                        onToggle={() => setShow(s => ({ ...s, new: !s.new }))}
                                    />

                                    {/* Strength indicator */}
                                    {form.password && (
                                        <div className="-mt-3">
                                            <div className="flex gap-1.5 mb-1.5">
                                                {[1,2,3,4].map(i => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            'flex-1 h-1.5 rounded-full transition-all duration-300',
                                                            i <= strength ? strengthMeta?.color : 'bg-gray-100'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            {strengthMeta && (
                                                <p className={cn('text-[11px] font-bold pl-1', strengthMeta.text)}>
                                                    {strengthMeta.label} password
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Confirm password */}
                                    <PasswordInput
                                        label="Confirm New Password"
                                        value={form.password_confirmation}
                                        onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                                        placeholder="Repeat your new password"
                                        focused={focusedField === 'confirm'}
                                        onFocus={() => setFocusedField('confirm')}
                                        onBlur={() => setFocusedField(null)}
                                        show={show.confirm}
                                        onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                                        error={mismatch ? 'Passwords do not match' : ''}
                                    />

                                    {/* Message */}
                                    {message.text && (
                                        <div className={cn(
                                            'p-4 lg:p-5 rounded-2xl flex items-center gap-4 border',
                                            message.type === 'success'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                        )}>
                                            <div className={cn(
                                                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                                                message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                                            )}>
                                                {message.type === 'success'
                                                    ? <CheckCircle2 size={18} />
                                                    : <AlertCircle size={18} />}
                                            </div>
                                            <span className="text-sm font-bold">{message.text}</span>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading || !!mismatch}
                                        className="w-full h-14 lg:h-16 bg-green-900 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] lg:tracking-[0.3em] shadow-2xl shadow-green-900/30 hover:bg-green-800 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading
                                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating…</>
                                            : <><ShieldCheck size={16} /> Update Password</>
                                        }
                                    </button>

                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
