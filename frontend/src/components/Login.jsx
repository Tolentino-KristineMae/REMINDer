import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import BackgroundAuth from './BackgroundAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Invalid login details. Please try again.';
            console.error('Login failed:', err);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                    position: relative;
                    padding: 2rem;
                }

                .login-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 420px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 28px;
                    padding: 44px 40px 40px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                    animation: cardIn .7s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(.97);} to{opacity:1;transform:translateY(0) scale(1);} }

                .login-card-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 24px; font-weight: 700;
                    color: #0f172a; text-align: center;
                    letter-spacing: -.5px; margin-bottom: 4px;
                    animation: fadeUp .6s .15s cubic-bezier(.22,1,.36,1) both;
                }
                .login-card-sub {
                    font-size: 14px; color: #475569;
                    text-align: center; margin-bottom: 28px;
                    animation: fadeUp .6s .2s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }

                .fg { margin-bottom: 16px; }
                .fg:nth-child(1) { animation: fadeUp .6s .25s cubic-bezier(.22,1,.36,1) both; }
                .fg:nth-child(2) { animation: fadeUp .6s .30s cubic-bezier(.22,1,.36,1) both; }

                .lbl {
                    display: block; font-size: 11px; font-weight: 600;
                    color: #475569; letter-spacing: .1em;
                    text-transform: uppercase; margin-bottom: 7px; padding-left: 2px;
                }
                .inp {
                    width: 100%; padding: 13px 16px;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px; color: #1e293b;
                    font-size: 16px; font-family: 'DM Sans', sans-serif;
                    outline: none; transition: all .25s ease;
                }
                .inp::placeholder { color: #94a3b8; }
                .inp:focus {
                    background: #ffffff;
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34,197,94,.15);
                }

                .btn {
                    width: 100%; padding: 14px; margin-top: 8px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    border: none; border-radius: 14px; color: white;
                    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
                    cursor: pointer; letter-spacing: .02em;
                    box-shadow: 0 6px 24px rgba(34,197,94,.38), 0 1px 0 rgba(255,255,255,.15) inset;
                    transition: all .22s cubic-bezier(.22,1,.36,1);
                    animation: fadeUp .6s .35s cubic-bezier(.22,1,.36,1) both;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(34,197,94,.55); }
                .btn:active:not(:disabled) { transform: translateY(0); }
                .btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin .8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
                .alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

                .footer-txt {
                    text-align: center; font-size: 13px;
                    color: #475569; margin-top: 22px;
                    animation: fadeUp .6s .4s cubic-bezier(.22,1,.36,1) both;
                }
                .footer-txt a { color: #22c55e; font-weight: 600; text-decoration: none; }
                .footer-txt a:hover { color: #16a34a; }

                .info-box {
                    margin-top: 24px;
                    padding: 20px;
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                    border-radius: 16px;
                    animation: fadeUp .6s .45s cubic-bezier(.22,1,.36,1) both;
                }
                .info-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 14px; font-weight: 700;
                    color: #166534; margin-bottom: 8px;
                }
                .info-desc {
                    font-size: 11px; color: #15803d;
                    line-height: 1.5; margin-bottom: 14px;
                }
                .info-item {
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 6px;
                }
                .info-dot {
                    width: 6px; height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(34,197,94,.5);
                }
                .info-label {
                    font-size: 11px; font-weight: 600;
                    color: #15803d;
                }

                @media (max-width: 480px) {
                    .login-root { padding: 1rem; }
                    .login-card {
                        padding: 28px 20px 24px;
                        border-radius: 20px;
                    }
                    .login-card-title { font-size: 20px; }
                    .blob, .worm, .dot { display: none; }
                    .info-box { display: none; }
                }

                @media (min-width: 481px) and (max-width: 768px) {
                    .login-root { padding: 1.5rem; }
                    .login-card { padding: 36px 28px 28px; }
                    .blob.b3, .blob.b4 { display: none; }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .login-card { max-width: 380px; }
                }
            `}</style>

            <div className="login-root">
                <BackgroundAuth />

                {/* Card */}
                <div className="login-card">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'28px', animation:'fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both' }}>
                        <Logo size="lg" />
                        <span style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '28px',
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '-1px'
                        }}>
                            REMINDear
                        </span>
                    </div>

                    <div className="login-card-title">Sign In</div>
                    <div className="login-card-sub">Enter your credentials to access the console</div>

                    {error && <div className="alert alert-err">✕ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="fg">
                            <label className="lbl">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="inp" placeholder="admin@example.com" required disabled={loading} />
                        </div>
                        <div className="fg">
                            <label className="lbl">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="inp" placeholder="••••••••" required disabled={loading} />
                        </div>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? <><div className="spinner"></div>Signing in...</> : 'Log In'}
                        </button>
                    </form>

                    <div className="footer-txt">
                        Don't have an account? <Link to="/setup">Create one</Link>
                    </div>

                    <div className="info-box">
                        <div className="info-title">Secure Sign In</div>
                        <div className="info-desc">
                            Authorized access only. Your login session is protected by multi-layer encryption and secure authentication protocols.
                        </div>
                        <div className="info-item">
                            <div className="info-dot"></div>
                            <span className="info-label">End-to-End Encryption</span>
                        </div>
                        <div className="info-item">
                            <div className="info-dot"></div>
                            <span className="info-label">Secure Session Logging</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
