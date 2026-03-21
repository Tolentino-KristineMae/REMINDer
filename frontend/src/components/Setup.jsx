import React, { useState } from 'react';
import api from '../api/axios';
import Logo from './Logo';

const Setup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/create-user', { name, email, password });
            setMessage('Account created! You can now login.');
            setError('');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Failed to create account. Please try again.';
            console.error('Account creation failed:', err);
            setError(msg);
            setMessage('');
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .remind-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                    position: relative;
                    padding: 2rem;
                    background: #14532d;
                }

                .remind-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 60% at 15% 25%, rgba(34,197,94,0.45) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 70% at 85% 75%, rgba(6,78,59,0.7) 0%, transparent 60%),
                        linear-gradient(160deg, #15803d 0%, #0f4d27 100%);
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    pointer-events: none;
                    background: linear-gradient(135deg, #4ade80, #86efac);
                    filter: blur(1px);
                    z-index: 1;
                }
                .b1 { width:240px; height:240px; top:4%; left:3%; opacity:.2; border-radius:60% 40% 55% 45%/45% 55% 45% 55%; animation:fA 7s ease-in-out infinite; }
                .b2 { width:170px; height:170px; bottom:8%; left:10%; opacity:.17; border-radius:40% 60% 45% 55%/55% 45% 60% 40%; animation:fB 9s ease-in-out infinite; background:linear-gradient(135deg,#22c55e,#86efac); }
                .b3 { width:300px; height:190px; top:12%; right:2%; opacity:.18; border-radius:55% 45% 60% 40%/40% 60% 40% 60%; animation:fC 8s ease-in-out infinite; background:linear-gradient(135deg,#4ade80,#16a34a); }
                .b4 { width:140px; height:140px; bottom:18%; right:6%; opacity:.15; border-radius:50% 50% 40% 60%/60% 40% 60% 40%; animation:fA 6s ease-in-out infinite reverse; background:linear-gradient(135deg,#86efac,#22c55e); }
                .b5 { width:110px; height:110px; top:42%; left:1%; opacity:.13; border-radius:60% 40% 50% 50%/50% 50% 60% 40%; animation:fB 10s ease-in-out infinite; background:linear-gradient(135deg,#bbf7d0,#4ade80); }
                .b6 { width:85px;  height:85px;  top:62%; right:16%; opacity:.15; border-radius:50% 50% 40% 60%/40% 60% 50% 50%; animation:fC 7.5s ease-in-out infinite reverse; }

                .worm { position:absolute; pointer-events:none; opacity:.18; z-index:1; }
                .w1 { top:5%;    left:26%;  animation:fA 8s ease-in-out infinite; }
                .w2 { bottom:6%; right:20%; animation:fB 9s ease-in-out infinite; }
                .w3 { top:45%;   right:3%;  animation:fC 7s ease-in-out infinite; }

                .dot { position:absolute; border-radius:50%; background:rgba(255,255,255,.45); pointer-events:none; z-index:1; }
                .d1 { width:5px; height:5px; top:17%; left:38%; animation:fA 5s ease-in-out infinite; }
                .d2 { width:3px; height:3px; top:73%; left:52%; animation:fB 6s ease-in-out infinite 1s; }
                .d3 { width:4px; height:4px; top:38%; right:14%; animation:fC 7s ease-in-out infinite .5s; }
                .d4 { width:3px; height:3px; bottom:22%; left:42%; animation:fA 4.5s ease-in-out infinite 2s; }

                @keyframes fA { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 33%{transform:translateY(-18px) rotate(4deg) scale(1.04);} 66%{transform:translateY(10px) rotate(-3deg) scale(.97);} }
                @keyframes fB { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 33%{transform:translateY(14px) rotate(-5deg) scale(1.03);} 66%{transform:translateY(-10px) rotate(3deg) scale(.98);} }
                @keyframes fC { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 50%{transform:translateY(-22px) rotate(6deg) scale(1.05);} }

                .card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 420px;
                    background: rgba(255,255,255,.1);
                    backdrop-filter: blur(28px) saturate(180%);
                    -webkit-backdrop-filter: blur(28px) saturate(180%);
                    border: 1px solid rgba(255,255,255,.18);
                    border-radius: 28px;
                    padding: 44px 40px 40px;
                    box-shadow: 0 8px 64px rgba(0,20,0,.28), 0 1px 0 rgba(255,255,255,.12) inset;
                    animation: cardIn .7s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(.97);} to{opacity:1;transform:translateY(0) scale(1);} }

                .card-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 26px; font-weight: 700;
                    color: white; text-align: center;
                    letter-spacing: -.5px; margin-bottom: 6px;
                    animation: fadeUp .6s .15s cubic-bezier(.22,1,.36,1) both;
                }
                .card-sub {
                    font-size: 14px; color: rgba(255,255,255,.5);
                    text-align: center; margin-bottom: 32px;
                    animation: fadeUp .6s .2s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }

                .fg { margin-bottom: 16px; }
                .fg:nth-child(1) { animation: fadeUp .6s .25s cubic-bezier(.22,1,.36,1) both; }
                .fg:nth-child(2) { animation: fadeUp .6s .30s cubic-bezier(.22,1,.36,1) both; }
                .fg:nth-child(3) { animation: fadeUp .6s .35s cubic-bezier(.22,1,.36,1) both; }

                .lbl {
                    display: block; font-size: 11px; font-weight: 600;
                    color: rgba(255,255,255,.5); letter-spacing: .1em;
                    text-transform: uppercase; margin-bottom: 7px; padding-left: 2px;
                }
                .inp {
                    width: 100%; padding: 13px 16px;
                    background: rgba(255,255,255,.08);
                    border: 1.5px solid rgba(255,255,255,.12);
                    border-radius: 14px; color: white;
                    font-size: 14px; font-family: 'DM Sans', sans-serif;
                    outline: none; transition: all .25s ease;
                }
                .inp::placeholder { color: rgba(255,255,255,.25); }
                .inp:focus {
                    background: rgba(255,255,255,.14);
                    border-color: rgba(74,222,128,.65);
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
                    animation: fadeUp .6s .42s cubic-bezier(.22,1,.36,1) both;
                }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(34,197,94,.55); }
                .btn:active { transform: translateY(0); }

                .alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
                .alert-ok  { background: rgba(52,211,153,.15); border: 1px solid rgba(52,211,153,.3); color: #6ee7b7; }
                .alert-err { background: rgba(248,113,113,.15); border: 1px solid rgba(248,113,113,.3); color: #fca5a5; }

                .footer-txt {
                    text-align: center; font-size: 13px;
                    color: rgba(255,255,255,.4); margin-top: 22px;
                    animation: fadeUp .6s .5s cubic-bezier(.22,1,.36,1) both;
                }
                .footer-txt a { color: #4ade80; font-weight: 600; text-decoration: none; }
                .footer-txt a:hover { color: #86efac; }

                /* Responsive Styles */
                @media (max-width: 480px) {
                    .remind-root {
                        padding: 1rem;
                    }
                    .card {
                        padding: 28px 20px 24px;
                        border-radius: 20px;
                    }
                    .card-title {
                        font-size: 22px;
                    }
                    .blob, .worm {
                        display: none;
                    }
                    .dot {
                        display: none;
                    }
                }

                @media (min-width: 481px) and (max-width: 768px) {
                    .remind-root {
                        padding: 1.5rem;
                    }
                    .card {
                        padding: 36px 28px 28px;
                    }
                    .blob.b3, .blob.b4 {
                        display: none;
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .card {
                        max-width: 380px;
                    }
                }
            `}</style>

            <div className="remind-root">
                {/* Blobs */}
                <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
                <div className="blob b4"/><div className="blob b5"/><div className="blob b6"/>

                {/* Worm shapes */}
                <svg className="worm w1" width="130" height="80" viewBox="0 0 130 80">
                    <path d="M10 45 C30 10,55 75,80 42 S118 12,122 44" stroke="#4ade80" strokeWidth="18" fill="none" strokeLinecap="round"/>
                </svg>
                <svg className="worm w2" width="130" height="80" viewBox="0 0 130 80">
                    <path d="M8 42 C28 8,53 73,78 40 S116 10,120 42" stroke="#22c55e" strokeWidth="15" fill="none" strokeLinecap="round"/>
                </svg>
                <svg className="worm w3" width="80" height="110" viewBox="0 0 80 110">
                    <path d="M40 8 C10 28,70 52,40 72 S10 92,40 105" stroke="#86efac" strokeWidth="14" fill="none" strokeLinecap="round"/>
                </svg>

                {/* Particles */}
                <div className="dot d1"/><div className="dot d2"/>
                <div className="dot d3"/><div className="dot d4"/>

                {/* Card */}
                <div className="card">
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:'32px', animation:'fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both' }}>
                        <Logo size="lg" />
                    </div>

                    <div className="card-title">Account Creation</div>
                    <div className="card-sub">Create your REMINDer account</div>

                    {message && <div className="alert alert-ok">✓ {message}</div>}
                    {error   && <div className="alert alert-err">✕ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="fg">
                            <label className="lbl">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="inp" placeholder="Your name" required />
                        </div>
                        <div className="fg">
                            <label className="lbl">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="inp" placeholder="your@email.com" required />
                        </div>
                        <div className="fg">
                            <label className="lbl">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="inp" placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="btn">Create Account →</button>
                    </form>

                    <div className="footer-txt">
                        Already have an account? <a href="#">Sign in</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Setup;
