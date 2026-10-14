import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import styles from '../../styles/Auth/LoginAndSignup/Signup.module.css';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(firstName, lastName, email, password);
            navigate('/dashboard');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Registration failed. Please try again.';
            console.error('Registration failed:', err);
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

                <div className={styles.title}>Create Account</div>
                <div className={styles.subtitle}>Create your REMINDear account</div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)} 
                                className={styles.input}
                                placeholder="John" 
                                required 
                                disabled={loading} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)} 
                                className={styles.input}
                                placeholder="Doe" 
                                required 
                                disabled={loading} 
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className={styles.input}
                            placeholder="john@example.com" 
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
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>

                <div className={styles.infoBox}>
                    <div className={styles.infoTitle}>Secure Registration</div>
                    <div className={styles.infoDesc}>
                        Your data is protected by multi-layer encryption and secure authentication protocols.
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoDot}></div>
                        <span className={styles.infoLabel}>End-to-End Encryption</span>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoDot}></div>
                        <span className={styles.infoLabel}>Privacy First Architecture</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
