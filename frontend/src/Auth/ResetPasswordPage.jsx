import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import remindearLogo from '../assets/REMINDear-Logo.png';
import BackgroundAuth from '../Shared/BackgroundGreen';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [email, setEmail] = useState(params.get('email') || '');
    const [token, setToken] = useState(params.get('token') || '');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [show, setShow] = useState({ password: false, confirmation: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const strength = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
    const mismatch = confirmation && password !== confirmation;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (mismatch) return;
        setLoading(true); setError('');
        try { await api.post('/reset-password', { email, token, password, password_confirmation: confirmation }); setSuccess(true); setTimeout(() => navigate('/login'), 2500); }
        catch (err) { setError(err?.response?.data?.message || 'This reset link is invalid or expired.'); }
        finally { setLoading(false); }
    };

    if (success) return <div className="flex min-h-screen items-center justify-center bg-[#f7faf8] p-5"><div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[#e0e9e2] bg-white p-8 text-center shadow-[0_18px_50px_rgba(31,61,42,.08)]"><div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-[#edf8f0] text-[#287342]"><CheckCircle2 size={24} /></div><h1 className="text-2xl font-bold tracking-[-.04em]">Password updated</h1><p className="mt-2 text-sm text-[#718078]">You can now sign in with your new password.</p></div></div>;

    const passwordInput = (label, value, setValue, key, placeholder) => <label className="flex flex-col gap-2 text-xs font-semibold text-[#536159]">{label}<span className="relative"><Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa69f]" size={16} /><input type={show[key] ? 'text' : 'password'} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required minLength={key === 'password' ? 8 : undefined} className="h-12 w-full rounded-xl border border-[#dbe5de] bg-[#fbfdfb] px-11 pr-11 text-sm font-medium outline-none transition focus:border-[#4aa764] focus:bg-white focus:ring-4 focus:ring-[#4aa764]/10" /><button type="button" onClick={() => setShow((current) => ({ ...current, [key]: !current[key] }))} aria-label={show[key] ? `Hide ${label}` : `Show ${label}`} className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[#9aa69f]">{show[key] ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>;

    return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf8] px-5 py-8"><BackgroundAuth /><main className="relative z-10 w-full max-w-[456px] rounded-2xl border border-[#e0e9e2] bg-white p-6 shadow-[0_18px_50px_rgba(31,61,42,.08)] sm:p-9"><div className="mb-7 flex justify-center"><img src={remindearLogo} alt="REMINDear" className="h-[42px] w-auto" /></div><header className="mb-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#398451]">Account security</p><h1 className="text-2xl font-bold tracking-[-.04em]">Reset password</h1><p className="mt-2 text-sm text-[#718078]">Choose a new password for your account.</p></header>{error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}<form onSubmit={handleSubmit} className="flex flex-col gap-4"><label className="flex flex-col gap-2 text-xs font-semibold text-[#536159]">Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 rounded-xl border border-[#dbe5de] bg-[#fbfdfb] px-3.5 text-sm outline-none focus:border-[#4aa764] focus:ring-4 focus:ring-[#4aa764]/10" /></label><label className="flex flex-col gap-2 text-xs font-semibold text-[#536159]">Reset token<input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your token" required className="h-12 rounded-xl border border-[#dbe5de] bg-[#fbfdfb] px-3.5 text-sm outline-none focus:border-[#4aa764] focus:ring-4 focus:ring-[#4aa764]/10" /></label>{passwordInput('New password', password, setPassword, 'password', 'At least 8 characters')}{password && <div className="flex gap-1">{[1,2,3,4].map((item) => <i key={item} className={`h-1 flex-1 rounded-full ${item <= strength ? 'bg-[#4aa764]' : 'bg-[#e7eee9]'}`} />)}</div>}{passwordInput('Confirm new password', confirmation, setConfirmation, 'confirmation', 'Repeat your new password')}{mismatch && <p className="-mt-2 text-[11px] text-red-500">Passwords do not match.</p>}<button type="submit" disabled={loading || !!mismatch} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl border-0 bg-[#1d6335] text-sm font-bold text-white shadow-[0_7px_16px_rgba(29,99,53,.18)] transition hover:bg-[#174f2a] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 className="animate-spin" size={17} /> Updating...</> : <><ShieldCheck size={17} /> Update password</>}</button></form><Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#718078] hover:text-[#287342]"><ArrowLeft size={14} /> Back to sign in</Link></main></div>;
}
