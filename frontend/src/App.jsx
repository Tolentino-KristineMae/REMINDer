import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Login from './components/Login';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import AddBillPage from './components/AddBillPage';
import CalendarPage from './components/CalendarPage';
import PaidBillsPage from './components/PaidBillsPage';
import TeamPage from './components/TeamPage';
import SettleBillPage from './components/SettleBillPage';
import DeploymentStatus from './components/DeploymentStatus';
import { Menu } from 'lucide-react';

const DateTimeDisplay = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 leading-none">{formatTime(dateTime)}</p>
                    <p className="text-[10px] font-semibold text-gray-500 leading-none mt-0.5">{formatDate(dateTime)}</p>
                </div>
                <div className="h-9 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                <div>
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest leading-none">REMINDer</p>
                    <p className="text-xs font-black text-gray-900 leading-none mt-0.5">System</p>
                </div>
            </div>
        </div>
    );
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-950 text-white font-bold text-2xl">Loading...</div>;
    
    const sidebarMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64';
    
    return user ? (
        <div className="flex bg-[#f8fafc] min-h-screen relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
            <div className={`flex-1 ml-0 ${sidebarMargin} flex flex-col min-h-screen min-w-0 transition-all duration-200`}>
                <div className="lg:hidden sticky top-0 z-30 bg-[#f8fafc]/80 backdrop-blur border-b border-gray-100">
                    <div className="h-14 px-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-gray-600 hover:bg-gray-50"
                            aria-label="Open menu"
                        >
                            <Menu size={18} className="stroke-[2.5]" />
                        </button>
                        <DateTimeDisplay />
                    </div>
                </div>
                <div className="hidden lg:sticky lg:top-0 lg:z-30 lg:bg-[#f8fafc]/80 lg:backdrop-blur lg:border-b lg:border-gray-100 lg:block">
                    <div className="h-14 px-6 flex items-center justify-end">
                        <DateTimeDisplay />
                    </div>
                </div>
                {children}
            </div>
        </div>
    ) : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <ModalProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/setup" element={<Setup />} />
                        <Route path="/deployment-status" element={<DeploymentStatus />} />
                        <Route 
                            path="/" 
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/add-bill" 
                            element={
                                <PrivateRoute>
                                    <AddBillPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/calendar" 
                            element={
                                <PrivateRoute>
                                    <CalendarPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/paid-bills" 
                            element={
                                <PrivateRoute>
                                    <PaidBillsPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/team" 
                            element={
                                <PrivateRoute>
                                    <TeamPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/settle/:id" 
                            element={
                                <PrivateRoute>
                                    <SettleBillPage />
                                </PrivateRoute>
                            } 
                        />
                        {/* Placeholder for other routes */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Router>
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;
