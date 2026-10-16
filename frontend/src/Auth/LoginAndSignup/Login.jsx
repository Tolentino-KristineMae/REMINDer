import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import styles from '../../styles/Auth/LoginAndSignup/Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/status').catch(() => {});
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid login details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.root}>
            <BackgroundAuth />
            <section className={styles.card} aria-labelledby="login-title">
                <div className={styles.brandRow}>
                    <div className={styles.logoWrapper}>
                        <img src={remindearLogo} alt="REMINDear" />
                    </div>
                    <span className={styles.secureBadge}><ShieldCheck size={14} /> Secure</span>
                </div>

                <div className={styles.heading}>
                    <p className={styles.eyebrow}>Welcome back</p>
                    <h1 id="login-title">Sign in to REMINDear</h1>
                    <p className={styles.subtitle}>Keep your bills, debts, and due dates organized.</p>
                </div>

                {error && <div className={styles.alert} role="alert">{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} aria-hidden="true" />
                            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={styles.input} placeholder="you@example.com" autoComplete="email" required disabled={loading} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <div className={styles.labelRow}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                        <div className={styles.inputWrapper}>
                            <LockKeyhole size={18} aria-hidden="true" />
                            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className={styles.input} placeholder="Enter your password" autoComplete="current-password" required disabled={loading} />
                            <button type="button" className={styles.visibilityButton} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? <><span className={styles.spinner} /> Signing in...</> : 'Sign in'}
                    </button>
                </form>

                <p className={styles.footer}>New to REMINDear? <Link to="/setup">Create an account</Link></p>
                <p className={styles.privacy}>Your information is protected with secure authentication.</p>
            </section>
        </main>
    );
};

export default Login;
