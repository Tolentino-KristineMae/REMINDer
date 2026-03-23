import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Logo from './Logo';
import BackgroundAuth from './BackgroundAuth';

const Setup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/create-user', { first_name: firstName, last_name: lastName, email, password });
            setMessage('Account created! You can now login.');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Failed to create account. Please try again.';
            console.error('Account creation failed:', err);
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

                .remind-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                    position: relative;
                    padding: 2rem;
                }

                .card {
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

                .card-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 24px; font-weight: 700;
                    color: #0f172a; text-align: center;
                    letter-spacing: -.5px; margin-bottom: 4px;
                    animation: fadeUp .6s .15s cubic-bezier(.22,1,.36,1) both;
                }
                .card-sub {
                    font-size: 14px; color: #475569;
                    text-align: center; margin-bottom: 28px;
                    animation: fadeUp .6s .2s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }

                .fg { margin-bottom: 16px; }
                .fg:nth-child(1) { animation: fadeUp .6s .25s cubic-bezier(.22,1,.36,1) both; }
                .fg:nth-child(2) { animation: fadeUp .6s .30s cubic-bezier(.22,1,.36,1) both; }
                .fg:nth-child(3) { animation: fadeUp .6s .35s cubic-bezier(.22,1,.36,1) both; }

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
                    font-size: 14px; font-family: 'DM Sans', sans-serif;
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
                    animation: fadeUp .6s .45s cubic-bezier(.22,1,.36,1) both;
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
                .alert-ok  { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
                .alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

                .footer-txt {
                    text-align: center; font-size: 13px;
                    color: #64748b; margin-top: 22px;
                    animation: fadeUp .6s .5s cubic-bezier(.22,1,.36,1) both;
                }
                .footer-txt a { color: #22c55e; font-weight: 600; text-decoration: none; }
                .footer-txt a:hover { color: #16a34a; }

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
                <BackgroundAuth />

                {/* Card */}
                <div className="card">
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:'32px', animation:'fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both' }}>
                        <Logo size="lg" />
                    </div>

                    <div className="card-title">Account Creation</div>
                    <div className="card-sub">Create your REMINDear account</div>

                    {message && <div className="alert alert-ok">✓ {message}</div>}
                    {error   && <div className="alert alert-err">✕ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="fg">
                            <label className="lbl">First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="inp" placeholder="First name" required />
                        </div>
                        <div className="fg">
                            <label className="lbl">Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="inp" placeholder="Last name" required />
                        </div>
                        <div className="fg">
                            <label className="lbl">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="inp" placeholder="your@email.com" required />
                        </div>
                        <div className="fg">
                            <label className="lbl">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="inp" placeholder="••••••••" required disabled={loading} />
                        </div>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? <><div className="spinner"></div>Creating...</> : 'Create Account →'}
                        </button>
                    </form>

                    <div className="footer-txt">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Setup;
