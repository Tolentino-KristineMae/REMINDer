import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import remindearLogo from '../assets/REMINDear-Logo.png';
import BackgroundAuth from '../Shared/BackgroundGreen';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const strength = (() => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/reset-password', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
                <BackgroundAuth />
                <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'420px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'28px', padding:'44px 40px', boxShadow:'0 20px 50px rgba(0,0,0,0.05)', textAlign:'center' }}>
                    <div style={{ width:'64px', height:'64px', background:'#f0fdf4', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'1px solid #dcfce7' }}>
                        <CheckCircle2 size={32} color="#16a34a" />
                    </div>
                    <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:700, color:'#0f172a', marginBottom:'8px' }}>Password Reset!</h2>
                    <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.6, marginBottom:'20px' }}>Your password has been updated successfully. Redirecting you to sign in…</p>
                    <div style={{ height:'4px', background:'#f1f5f9', borderRadius:'99px', overflow:'hidden' }}>
                        <div style={{ height:'100%', background:'linear-gradient(90deg,#16a34a,#22c55e)', borderRadius:'99px', animation:'progress 3s linear forwards' }} />
                    </div>
                    <style>{`@keyframes progress { from{width:0} to{width:100%} }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
            <BackgroundAuth />

            <div style={{
                position:'relative', zIndex:10, width:'100%', maxWidth:'420px',
                background:'#fff', border:'1px solid #e2e8f0', borderRadius:'28px',
                padding:'44px 40px 40px', boxShadow:'0 20px 50px rgba(0,0,0,0.05)',
                animation:'cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
            }}>
                <style>{`
                    @keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                    .rp-input { width:100%; height:48px; padding:0 40px 0 16px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:14px; font-weight:500; color:#0f172a; outline:none; transition:all 0.2s; font-family:inherit; }
                    .rp-input:focus { border-color:#22c55e; background:#fff; box-shadow:0 0 0 3px rgba(34,197,94,0.12); }
                    .rp-input.error { border-color:#ef4444; }
                    .rp-btn { width:100%; height:48px; background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; letter-spacing:0.05em; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; box-shadow:0 4px 14px rgba(34,197,94,0.3); }
                    .rp-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(34,197,94,0.4); }
                    .rp-btn:disabled { opacity:0.6; cursor:not-allowed; }
                    .rp-label { display:block; font-size:11px; font-weight:600; color:#475569; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
                `}</style>

                {/* Logo */}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:'28px' }}>
                    <img src={remindearLogo} alt="REMINDear" style={{ height:'52px', width:'auto' }} />
                </div>

                <div style={{ textAlign:'center', marginBottom:'28px' }}>
                    <div style={{ width:'52px', height:'52px', background:'#f0fdf4', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid #dcfce7' }}>
                        <ShieldCheck size={24} color="#16a34a" />
                    </div>
                    <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:700, color:'#0f172a', marginBottom:'6px', letterSpacing:'-0.3px' }}>Reset Password</h1>
                    <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.5 }}>Enter your new password below.</p>
                </div>

                {error && (
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px' }}>
                        <AlertCircle size={16} color="#dc2626" style={{ flexShrink:0 }} />
                        <span style={{ fontSize:'13px', color:'#dc2626', fontWeight:500 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    {/* Email (pre-filled, editable) */}
                    <div>
                        <label className="rp-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="rp-input"
                            style={{ paddingRight:'16px' }}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    {/* Token (pre-filled, editable) */}
                    <div>
                        <label className="rp-label">Reset Token</label>
                        <input
                            type="text"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="rp-input"
                            style={{ paddingRight:'16px', fontFamily:'monospace', fontSize:'12px' }}
                            placeholder="Paste your reset token here"
                            required
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="rp-label">New Password</label>
                        <div style={{ position:'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`rp-input ${password && password !== passwordConfirmation && passwordConfirmation ? 'error' : ''}`}
                                placeholder="Min. 8 characters"
                                required
                                minLength={8}
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:0 }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength bar */}
                        {password && (
                            <div style={{ marginTop:'8px' }}>
                                <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{ flex:1, height:'3px', borderRadius:'99px', background: i <= strength ? strengthColor : '#e2e8f0', transition:'background 0.3s' }} />
                                    ))}
                                </div>
                                <p style={{ fontSize:'11px', color: strengthColor, fontWeight:600 }}>{strengthLabel}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="rp-label">Confirm Password</label>
                        <div style={{ position:'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={e => setPasswordConfirmation(e.target.value)}
                                className={`rp-input ${passwordConfirmation && password !== passwordConfirmation ? 'error' : ''}`}
                                placeholder="Repeat your new password"
                                required
                            />
                            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:0 }}>
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordConfirmation && password !== passwordConfirmation && (
                            <p style={{ fontSize:'11px', color:'#ef4444', marginTop:'4px', fontWeight:500 }}>Passwords do not match</p>
                        )}
                    </div>

                    <button type="submit" className="rp-btn" disabled={loading || (passwordConfirmation && password !== passwordConfirmation)}>
                        {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Resetting...</> : <><ShieldCheck size={16} /> Reset Password</>}
                    </button>
                </form>

                <div style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'#64748b' }}>
                    <Link to="/login" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
