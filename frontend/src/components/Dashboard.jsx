import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, 
    Search,
    Bell,
    Mail,
    Wallet,
    Clock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        total_amount: 0,
        total_paid_amount: 0,
        total_unpaid_amount: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/bills/stats');
                const data = response.data;
                setStats({
                    total: data.total || 0,
                    paid: data.paid || 0,
                    pending: data.pending || 0,
                    overdue: data.overdue || 0,
                    total_amount: data.total_amount || 0,
                    total_paid_amount: data.total_paid_amount || 0,
                    total_unpaid_amount: data.total_unpaid_amount || 0,
                });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="spinner mb-4" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p className="text-white/60 text-sm font-medium">Loading dashboard...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .dash-container {
                    font-family: 'DM Sans', sans-serif;
                    padding: 24px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .dash-header {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                @media (min-width: 768px) {
                    .dash-header {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                }

                .search-box {
                    position: relative;
                    width: 100%;
                    max-width: 320px;
                }
                .search-box input {
                    width: 100%;
                    padding: 14px 16px 14px 48px;
                    background: rgba(255,255,255,.1);
                    border: 1px solid rgba(255,255,255,.15);
                    border-radius: 16px;
                    color: white;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    outline: none;
                    transition: all .25s ease;
                }
                .search-box input::placeholder { color: rgba(255,255,255,.4); }
                .search-box input:focus {
                    background: rgba(255,255,255,.15);
                    border-color: rgba(74,222,128,.5);
                    box-shadow: 0 0 0 3px rgba(34,197,94,.15);
                }
                .search-box svg {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,.4);
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .icon-btn {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,.1);
                    border: 1px solid rgba(255,255,255,.15);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,.7);
                    cursor: pointer;
                    transition: all .2s ease;
                    position: relative;
                }
                .icon-btn:hover {
                    background: rgba(255,255,255,.18);
                    color: white;
                    transform: translateY(-2px);
                }
                .icon-btn .dot {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid #0f4d27;
                }

                .dash-title {
                    margin-bottom: 8px;
                }
                .dash-title h1 {
                    font-family: 'Syne', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.5px;
                    margin-bottom: 4px;
                }
                .dash-title p {
                    font-size: 13px;
                    color: rgba(255,255,255,.5);
                    font-weight: 500;
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    border: none;
                    border-radius: 14px;
                    color: white;
                    font-family: 'Syne', sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 24px rgba(34,197,94,.35), 0 1px 0 rgba(255,255,255,.15) inset;
                    transition: all .22s ease;
                }
                .add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(34,197,94,.5);
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                @media (min-width: 640px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (min-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(4, 1fr); }
                }

                .stat-card {
                    background: rgba(255,255,255,.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,.15);
                    border-radius: 24px;
                    padding: 24px;
                    transition: all .3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
                    opacity: 0;
                    transition: opacity .3s ease;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    background: rgba(255,255,255,.15);
                }
                .stat-card:hover::before { opacity: 1; }

                .stat-card.paid { border-color: rgba(74,222,128,.3); }
                .stat-card.unpaid { border-color: rgba(248,113,113,.3); }
                .stat-card.pending { border-color: rgba(251,191,36,.3); }
                .stat-card.overdue { border-color: rgba(239,68,68,.3); }

                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .stat-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255,255,255,.5);
                    text-transform: uppercase;
                    letter-spacing: .05em;
                }
                .stat-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.paid { background: rgba(74,222,128,.2); color: #4ade80; }
                .stat-icon.unpaid { background: rgba(248,113,113,.2); color: #f87171; }
                .stat-icon.pending { background: rgba(251,191,36,.2); color: #fbbf24; }
                .stat-icon.overdue { background: rgba(239,68,68,.2); color: #ef4444; }

                .stat-value {
                    font-family: 'Syne', sans-serif;
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                }
                .stat-sub {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                    display: inline-block;
                }
                .stat-sub.paid { background: rgba(74,222,128,.15); color: #86efac; }
                .stat-sub.unpaid { background: rgba(248,113,113,.15); color: #fca5a5; }
                .stat-sub.pending { background: rgba(251,191,36,.15); color: #fde047; }
                .stat-sub.overdue { background: rgba(239,68,68,.15); color: #fca5a5; }

                /* Main Content Grid */
                .main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                }

                @media (min-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 3fr 1fr;
                    }
                }

                .panel {
                    background: rgba(255,255,255,.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,.15);
                    border-radius: 24px;
                    padding: 28px;
                }

                .panel-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 24px;
                }

                .chart-bars {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 200px;
                    padding: 0 8px;
                    gap: 12px;
                }
                .chart-bar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    height: 100%;
                }
                .bar-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column-reverse;
                    gap: 4px;
                    border-radius: 8px 8px 0 0;
                    overflow: hidden;
                }
                .bar-paid {
                    background: linear-gradient(180deg, #22c55e, #16a34a);
                    border-radius: 6px 6px 0 0;
                    transition: all .3s ease;
                }
                .bar-unpaid {
                    background: linear-gradient(180deg, #f87171, #ef4444);
                    border-radius: 0 0 6px 6px;
                    opacity: 0.7;
                }
                .chart-bar:hover .bar-paid { transform: scaleY(1.02); }
                .chart-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255,255,255,.5);
                }

                .chart-legend {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                    justify-content: center;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255,255,255,.6);
                }
                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .legend-dot.paid { background: #22c55e; }
                .legend-dot.unpaid { background: #f87171; }

                /* Progress Circle */
                .progress-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 0;
                }

                .progress-circle {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    margin-bottom: 24px;
                }
                .progress-circle svg {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }
                .progress-circle circle {
                    fill: none;
                    stroke-width: 12;
                    stroke-linecap: round;
                }
                .progress-bg {
                    stroke: rgba(255,255,255,.1);
                }
                .progress-fill {
                    stroke: url(#progressGradient);
                    stroke-dasharray: 502;
                    stroke-dashoffset: 502;
                    transition: stroke-dashoffset 1.5s ease-out;
                }
                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
                .progress-percent {
                    font-family: 'Syne', sans-serif;
                    font-size: 42px;
                    font-weight: 800;
                    color: white;
                }
                .progress-label {
                    font-size: 12px;
                    color: rgba(255,255,255,.5);
                    font-weight: 600;
                }

                .progress-stats {
                    text-align: center;
                }
                .progress-main {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 4px;
                }
                .progress-sub {
                    font-size: 12px;
                    color: rgba(255,255,255,.5);
                    font-weight: 500;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .dash-container { padding: 16px; }
                    .dash-title h1 { font-size: 22px; }
                    .stat-value { font-size: 26px; }
                    .add-btn { width: 100%; justify-content: center; }
                    .search-box { max-width: 100%; }
                    .chart-bars { height: 150px; }
                }
            `}</style>

            <div className="dash-container">
                {/* Header */}
                <div className="dash-header">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Search bills, reports..." />
                    </div>
                    
                    <div className="header-actions">
                        <button className="icon-btn">
                            <Mail size={18} />
                        </button>
                        <button className="icon-btn">
                            <Bell size={18} />
                            <span className="dot"/>
                        </button>
                    </div>
                </div>

                {/* Title & Add Button */}
                <div className="dash-header">
                    <div className="dash-title">
                        <h1>Dashboard</h1>
                        <p>Manage and prioritize your bills with ease.</p>
                    </div>
                    <button className="add-btn" onClick={() => navigate('/add-bill')}>
                        <Plus size={18} />
                        Add Bill
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card paid">
                        <div className="stat-header">
                            <span className="stat-label">Total Amount Paid</span>
                            <div className="stat-icon paid">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <div className="stat-value">{formatCurrency(stats.total_paid_amount)}</div>
                        <span className="stat-sub paid">All time</span>
                    </div>

                    <div className="stat-card unpaid">
                        <div className="stat-header">
                            <span className="stat-label">Total Amount Unpaid</span>
                            <div className="stat-icon unpaid">
                                <Wallet size={20} />
                            </div>
                        </div>
                        <div className="stat-value">{formatCurrency(stats.total_unpaid_amount)}</div>
                        <span className="stat-sub unpaid">Pending & Overdue</span>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-header">
                            <span className="stat-label">Pending Bills</span>
                            <div className="stat-icon pending">
                                <Clock size={20} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.pending}</div>
                        <span className="stat-sub pending">Action required</span>
                    </div>

                    <div className="stat-card overdue">
                        <div className="stat-header">
                            <span className="stat-label">Overdue Bills</span>
                            <div className="stat-icon overdue">
                                <AlertCircle size={20} />
                            </div>
                        </div>
                        <div className="stat-value">{stats.overdue}</div>
                        <span className="stat-sub overdue">Immediate attention</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="main-grid">
                    {/* Bill Analytics */}
                    <div className="panel">
                        <h3 className="panel-title">Bill Analytics</h3>
                        <div className="chart-bars">
                            {[
                                { day: 'Mon', paid: 45, unpaid: 20 },
                                { day: 'Tue', paid: 70, unpaid: 15 },
                                { day: 'Wed', paid: 55, unpaid: 30 },
                                { day: 'Thu', paid: 90, unpaid: 10 },
                                { day: 'Fri', paid: 65, unpaid: 25 },
                                { day: 'Sat', paid: 30, unpaid: 40 },
                                { day: 'Sun', paid: 50, unpaid: 18 }
                            ].map((item, i) => (
                                <div key={i} className="chart-bar">
                                    <div className="bar-container">
                                        <div className="bar-paid" style={{ height: `${item.paid}%` }}></div>
                                        <div className="bar-unpaid" style={{ height: `${item.unpaid}%` }}></div>
                                    </div>
                                    <span className="chart-label">{item.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-dot paid"></div>
                                <span>Paid</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot unpaid"></div>
                                <span>Unpaid</span>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Progress */}
                    <div className="panel">
                        <h3 className="panel-title">Settlement Progress</h3>
                        <div className="progress-section">
                            <div className="progress-circle">
                                <svg viewBox="0 0 180 180">
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#4ade80" />
                                        </linearGradient>
                                    </defs>
                                    <circle className="progress-bg" cx="90" cy="90" r="80" />
                                    <circle 
                                        className="progress-fill" 
                                        cx="90" 
                                        cy="90" 
                                        r="80"
                                        style={{ strokeDashoffset: 502 * (1 - (stats.paid / (stats.total || 1))) }}
                                    />
                                </svg>
                                <div className="progress-text">
                                    <div className="progress-percent">{Math.round((stats.paid / (stats.total || 1)) * 100)}%</div>
                                    <div className="progress-label">Complete</div>
                                </div>
                            </div>
                            <div className="progress-stats">
                                <div className="progress-main">Bills Settled</div>
                                <div className="progress-sub">{stats.paid} of {stats.total} Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
