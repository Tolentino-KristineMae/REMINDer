import React, { useState } from 'react';
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

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-950 text-white font-bold text-2xl">Loading...</div>;
    
    return user ? (
        <div className="flex min-h-screen relative" style={{ background: 'linear-gradient(160deg, #15803d 0%, #0f4d27 100%)' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 ml-0 lg:ml-56 flex flex-col min-h-screen min-w-0">
                <div className="lg:hidden sticky top-0 z-30 backdrop-blur border-b border-white/10" style={{ background: 'rgba(21, 128, 61, 0.8)' }}>
                    <div className="h-14 px-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 text-white hover:bg-white/20"
                            aria-label="Open menu"
                        >
                            <Menu size={18} className="stroke-[2.5]" />
                        </button>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none mb-1">REMINDer</p>
                            <p className="text-xs font-black text-white leading-none">System</p>
                        </div>
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
