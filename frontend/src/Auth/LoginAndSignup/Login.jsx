import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import '../../styles/Auth/LoginAndSignup/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Wake up backend (cold start) as soon as user lands on login page
    useEffect(() => {
        api.get('/status').catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            // Small delay to ensure state updates propagate before navigation
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 0);
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
        <div className="root">
            <BackgroundAuth />

            <div className="card">
                <div className="logoWrapper">
                    <img src={remindearLogo} alt="REMINDear Logo" style={{ height: '60px', width: 'auto' }} />
                </div>

                <div className="title">Sign In</div>
                <div className="subtitle">Sign in to continue</div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="formGroup">
                        <label className="label">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="input" 
                            placeholder="admin@example.com" 
                            required 
                            disabled={loading} 
                        />
                    </div>
                    <div className="formGroup">
                        <label className="label">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="input" 
                            placeholder="••••••••" 
                            required 
                            disabled={loading} 
                        />
                    </div>
                    <button type="submit" className="button" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Signing in...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>

                <div className="footer">
                    Don't have an account? <Link to="/setup">Create one</Link>
                </div>

                <div className="infoBox">
                    <div className="infoTitle">Secure Sign In</div>
                    <div className="infoDesc">
                        Authorized access only. Your login session is protected by multi-layer encryption and secure authentication protocols.
                    </div>
                    <div className="infoItem">
                        <div className="infoDot"></div>
                        <span className="infoLabel">End-to-End Encryption</span>
                    </div>
                    <div className="infoItem">
                        <div className="infoDot"></div>
                        <span className="infoLabel">Secure Session Logging</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
