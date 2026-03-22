import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Login from './components/Login';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import CategoryPage from './components/CategoryPage';
import CalendarPage from './components/CalendarPage';
import PaidBillsPage from './components/PaidBillsPage';
import TeamPage from './components/TeamPage';
import SettleBillPage from './components/SettleBillPage';
import DeploymentStatus from './components/DeploymentStatus';
import { Menu } from 'lucide-react';

const PageHeader = ({ title, subtitle }) => (
    <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
            <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
                <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight">{title}</h1>
            </div>
            {subtitle && (
                <div className="flex items-center gap-3 mt-1.5">
                    <div className="w-1 h-3 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full opacity-50" />
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">{subtitle}</p>
                </div>
            )}
        </div>
        <DateTimeDisplay />
    </div>
);

const DateTimeDisplay = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <div className="flex items-center gap-4">
            {/* Time Display */}
            <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-gray-800 leading-none tracking-tight">{formatTime(dateTime)}</p>
                <p className="text-[10px] font-semibold text-gray-500 leading-none mt-0.5">{formatDate(dateTime)}</p>
            </div>
            {/* Divider */}
            <div className="h-10 w-px bg-gray-200" />
            {/* Logo */}
            <div className="flex flex-col items-start">
                <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest leading-none">REMINDear</p>
                <p className="text-xs font-black text-gray-900 leading-none mt-0.5">System</p>
            </div>
        </div>
    );
};

const PrivateRoute = ({ children, pageTitle, pageSubtitle }) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-950 text-white font-bold text-2xl">Loading...</div>;
    
    const sidebarMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64';
    
    return user ? (
        <div className="flex bg-[#f8fafc] min-h-screen relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
            <div className={`flex-1 ml-0 ${sidebarMargin} flex flex-col min-h-screen min-w-0 transition-all duration-200`}>
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50"
                            aria-label="Open menu"
                        >
                            <Menu size={18} className="stroke-[2.5]" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <p className="text-lg font-bold text-gray-800 leading-none">{dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
                                <p className="text-[10px] font-semibold text-gray-500 leading-none mt-0.5">{dateTime.getDate()} {dateTime.toLocaleString('en-US', { month: 'short' })} {dateTime.getFullYear()}</p>
                            </div>
                            <div className="h-10 w-px bg-gray-200 mx-1" />
                            <div className="flex flex-col items-start">
                                <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest leading-none">REMINDear</p>
                                <p className="text-xs font-black text-gray-900 leading-none mt-0.5">System</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-100">
                    <div className="px-6 py-4">
                        <PageHeader title={pageTitle} subtitle={pageSubtitle} />
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
                                <PrivateRoute pageTitle="Dashboard" pageSubtitle="Manage and prioritize your bills with ease">
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/categories" 
                            element={
                                <PrivateRoute pageTitle="Categories" pageSubtitle="Manage your bill categories">
                                    <CategoryPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/calendar" 
                            element={
                                <PrivateRoute pageTitle="Calendar" pageSubtitle="Track your bill due dates and payment schedule">
                                    <CalendarPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/paid-bills" 
                            element={
                                <PrivateRoute pageTitle="Settlements" pageSubtitle="Submit and view your payment proof records">
                                    <PaidBillsPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/team" 
                            element={
                                <PrivateRoute pageTitle="Person In Charge" pageSubtitle="Manage your people in-charge and their performance">
                                    <TeamPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/settle/:id" 
                            element={
                                <PrivateRoute pageTitle="Settle Bill" pageSubtitle="Submit payment proof">
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
