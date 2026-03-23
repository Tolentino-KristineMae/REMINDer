import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AddBillPage = lazy(() => import('./components/AddBillPage'));
const EditBillPage = lazy(() => import('./components/EditBillPage'));
const Management = lazy(() => import('./components/Management'));
const CalendarPage = lazy(() => import('./components/CalendarPage'));
const SettlementsPage = lazy(() => import('./components/SettlementsPage'));
const SettleBillPage = lazy(() => import('./components/SettleBillPage'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Profile = lazy(() => import('./components/Profile'));

const LoadingFallback = ({ fullScreen = true }) => {
    const containerClass = fullScreen 
        ? "min-h-screen flex items-center justify-center bg-green-950"
        : "flex items-center justify-center py-12";
    
    return (
        <div className={containerClass}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-bold text-lg">Loading...</p>
            </div>
        </div>
    );
};

const TimeDisplay = ({ dateTime }) => {
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };
    const formatDate = (date) => {
        return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-gray-800 leading-none">{formatTime(dateTime)}</p>
                <p className="text-[10px] font-semibold text-gray-500 leading-none mt-0.5">{formatDate(dateTime)}</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="flex flex-col items-start">
                <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest leading-none">REMINDear</p>
                <p className="text-xs font-black text-gray-900 leading-none mt-0.5">System</p>
            </div>
        </div>
    );
};

const PageHeader = ({ title, subtitle }) => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
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
            <div className="flex sm:justify-end">
                <TimeDisplay dateTime={dateTime} />
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

    if (loading) return <LoadingFallback />;
    
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
                        <TimeDisplay dateTime={dateTime} />
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
                <Suspense fallback={<LoadingFallback />}>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route 
                                path="/" 
                                element={
                                    <PrivateRoute pageTitle="Dashboard" pageSubtitle="Manage and prioritize your bills with ease">
                                        <Dashboard />
                                    </PrivateRoute>
                                } 
                            />
                            <Route 
                                path="/management" 
                                element={
                                    <PrivateRoute pageTitle="Management" pageSubtitle="Manage categories and team members">
                                        <Management />
                                    </PrivateRoute>
                                } 
                            />
                            <Route 
                                path="/add-bill" 
                                element={
                                    <PrivateRoute pageTitle="Add Bill" pageSubtitle="Create a new bill entry">
                                        <AddBillPage />
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
                                        <SettlementsPage />
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
                            <Route 
                                path="/edit-bill/:id" 
                                element={
                                    <PrivateRoute pageTitle="Edit Bill" pageSubtitle="Update bill details">
                                        <EditBillPage />
                                    </PrivateRoute>
                                } 
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Router>
                </Suspense>
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;
