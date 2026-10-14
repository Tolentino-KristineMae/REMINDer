import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import styles from '../../styles/Auth/LoginAndSignup/Login.module.css';

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
        <div className={styles.root}>
            <BackgroundAuth />

            <div className={styles.card}>
                <div className={styles.logoWrapper}>
                    <img src={remindearLogo} alt="REMINDear Logo" style={{ height: '60px', width: 'auto' }} />
                </div>

                <div className={styles.title}>Sign In</div>
                <div className={styles.subtitle}>Sign in to continue</div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className={styles.input}
                            placeholder="admin@example.com" 
                            required 
                            disabled={loading} 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className={styles.input}
                            placeholder="••••••••" 
                            required 
                            disabled={loading} 
                        />
                        <div style={{ textAlign: 'right', marginTop: '6px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Signing in...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link to="/setup">Create one</Link>
                </div>

                <div className={styles.infoBox}>
                    <div className={styles.infoTitle}>Secure Sign In</div>
                    <div className={styles.infoDesc}>
                        Authorized access only. Your login session is protected by multi-layer encryption and secure authentication protocols.
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoDot}></div>
                        <span className={styles.infoLabel}>End-to-End Encryption</span>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoDot}></div>
                        <span className={styles.infoLabel}>Secure Session Logging</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
