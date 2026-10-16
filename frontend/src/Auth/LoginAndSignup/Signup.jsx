import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import styles from '../../styles/Auth/LoginAndSignup/Signup.module.css';

const Signup = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(form.firstName, form.lastName, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <BackgroundAuth />
            <main className={styles.card}>
                <div className={styles.brand}><img src={remindearLogo} alt="REMINDear" /></div>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>Get started</p>
                    <h1>Create your account</h1>
                    <p>Start managing your reminders with ease.</p>
                </header>

                {error && <div className={styles.alert} role="alert">{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <label>First name<input value={form.firstName} onChange={update('firstName')} placeholder="John" required disabled={loading} /></label>
                        <label>Last name<input value={form.lastName} onChange={update('lastName')} placeholder="Doe" required disabled={loading} /></label>
                    </div>
                    <label>Email address<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required disabled={loading} /></label>
                    <label>Password
                        <span className={styles.passwordField}>
                            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="At least 8 characters" minLength={8} required disabled={loading} />
                            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button>
                        </span>
                    </label>
                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? <><Loader2 className={styles.spinner} /> Creating account</> : 'Create account'}
                    </button>
                </form>
                <p className={styles.footer}>Already have an account? <Link to="/login">Sign in</Link></p>
            </main>
        </div>
    );
};

export default Signup;
