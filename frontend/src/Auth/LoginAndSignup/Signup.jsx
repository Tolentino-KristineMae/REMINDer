import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import remindearLogo from '../../assets/REMINDear-Logo.png';
import BackgroundAuth from '../../Shared/BackgroundGreen';
import '../../styles/Auth/LoginAndSignup/Signup.css';

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
            navigate('/');
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
        <div className="root">
            <BackgroundAuth />

            <div className="card">
                <div className="logoWrapper">
                    <img src={remindearLogo} alt="REMINDear Logo" style={{ height: '60px', width: 'auto' }} />
                </div>

                <div className="title">Create Account</div>
                <div className="subtitle">Start managing your personal registry today</div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="formRow">
                        <div className="formGroup">
                            <label className="label">First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)} 
                                className="input" 
                                placeholder="John" 
                                required 
                                disabled={loading} 
                            />
                        </div>
                        <div className="formGroup">
                            <label className="label">Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)} 
                                className="input" 
                                placeholder="Doe" 
                                required 
                                disabled={loading} 
                            />
                        </div>
                    </div>
                    <div className="formGroup">
                        <label className="label">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="input" 
                            placeholder="john@example.com" 
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
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <div className="footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>

                <div className="infoBox">
                    <div className="infoTitle">Secure Registration</div>
                    <div className="infoDesc">
                        Your data is protected by multi-layer encryption and secure authentication protocols.
                    </div>
                    <div className="infoItem">
                        <div className="infoDot"></div>
                        <span className="infoLabel">End-to-End Encryption</span>
                    </div>
                    <div className="infoItem">
                        <div className="infoDot"></div>
                        <span className="infoLabel">Privacy First Architecture</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
