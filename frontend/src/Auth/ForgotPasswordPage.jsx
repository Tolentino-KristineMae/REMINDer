import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import remindearLogo from '../assets/REMINDear-Logo.png';
import BackgroundAuth from '../Shared/BackgroundGreen';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [step, setStep] = useState('request'); // 'request' | 'done'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/forgot-password', { email });
            setToken(res.data.token || '');
            setStep('done');
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
            <BackgroundAuth />

            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px',
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '28px',
                padding: '44px 40px 40px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                animation: 'cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
            }}>
                <style>{`
                    @keyframes cardIn { from { opacity:0; transform:translateY(32px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
                    .fp-input { width:100%; height:48px; padding:0 16px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:14px; font-weight:500; color:#0f172a; outline:none; transition:all 0.2s; font-family:inherit; }
                    .fp-input:focus { border-color:#22c55e; background:#fff; box-shadow:0 0 0 3px rgba(34,197,94,0.12); }
                    .fp-btn { width:100%; height:48px; background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; letter-spacing:0.05em; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; box-shadow:0 4px 14px rgba(34,197,94,0.3); }
                    .fp-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(34,197,94,0.4); }
                    .fp-btn:disabled { opacity:0.6; cursor:not-allowed; }
                    .fp-label { display:block; font-size:11px; font-weight:600; color:#475569; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
                    .token-box { background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:14px; padding:16px; margin-top:16px; }
                    .token-value { font-family:monospace; font-size:12px; color:#166534; word-break:break-all; background:#dcfce7; padding:10px 12px; border-radius:8px; margin-top:8px; border:1px solid #bbf7d0; }
                `}</style>

                {/* Logo */}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:'28px' }}>
                    <img src={remindearLogo} alt="REMINDear" style={{ height:'52px', width:'auto' }} />
                </div>

                {step === 'request' ? (
                    <>
                        <div style={{ textAlign:'center', marginBottom:'28px' }}>
                            <div style={{ width:'52px', height:'52px', background:'#f0fdf4', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid #dcfce7' }}>
                                <KeyRound size={24} color="#16a34a" />
                            </div>
                            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:700, color:'#0f172a', marginBottom:'6px', letterSpacing:'-0.3px' }}>Forgot Password?</h1>
                            <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.5 }}>Enter your email and we'll generate a reset token for you.</p>
                        </div>

                        {error && (
                            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px' }}>
                                <AlertCircle size={16} color="#dc2626" style={{ flexShrink:0 }} />
                                <span style={{ fontSize:'13px', color:'#dc2626', fontWeight:500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom:'20px' }}>
                                <label className="fp-label">Email Address</label>
                                <div style={{ position:'relative' }}>
                                    <Mail size={16} color="#94a3b8" style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="fp-input"
                                        style={{ paddingLeft:'40px' }}
                                        placeholder="your@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="fp-btn" disabled={loading}>
                                {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Generating token...</> : <>Generate Reset Token <ArrowRight size={16} /></>}
                            </button>
                        </form>

                        <div style={{ textAlign:'center', marginTop:'24px', fontSize:'13px', color:'#64748b' }}>
                            <Link to="/login" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                                <ArrowLeft size={14} /> Back to Sign In
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign:'center', marginBottom:'24px' }}>
                            <div style={{ width:'52px', height:'52px', background:'#f0fdf4', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid #dcfce7' }}>
                                <CheckCircle2 size={24} color="#16a34a" />
                            </div>
                            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:700, color:'#0f172a', marginBottom:'6px' }}>Token Generated</h1>
                            <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.5 }}>Copy the token below and use it to reset your password. It expires in <strong>60 minutes</strong>.</p>
                        </div>

                        <div className="token-box">
                            <p style={{ fontSize:'11px', fontWeight:700, color:'#166534', textTransform:'uppercase', letterSpacing:'0.08em' }}>Your Reset Token</p>
                            <div className="token-value">{token}</div>
                            <p style={{ fontSize:'11px', color:'#4ade80', marginTop:'8px' }}>⚠ Keep this token private. It grants access to reset your password.</p>
                        </div>

                        <button
                            className="fp-btn"
                            style={{ marginTop:'20px' }}
                            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)}
                        >
                            Continue to Reset Password <ArrowRight size={16} />
                        </button>

                        <div style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#64748b' }}>
                            <Link to="/login" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Back to Sign In</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
