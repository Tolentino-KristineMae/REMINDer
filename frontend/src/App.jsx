import React, { useState, useEffect, lazy, Suspense, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Error Boundary to catch lazy loading errors and other runtime crashes
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorType: null };
    }

    static getDerivedStateFromError(error) {
        // If it's a ChunkLoadError, it means the browser is trying to load an old version of the app
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            return { hasError: true, errorType: 'chunk' };
        }
        return { hasError: true, errorType: 'runtime' };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.state.errorType === 'chunk') {
                // Force a hard reload for chunk errors
                window.location.reload(true);
                return null;
            }
            return (
                <div className="min-h-screen flex items-center justify-center bg-green-950 p-6 text-center">
                    <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6 text-sm">The application encountered an unexpected error. This usually happens after an update.</p>
                        <button 
                            onClick={() => window.location.reload(true)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Sidebar from './Shared/Sidebar';
import Header, { TimeDisplay } from './Shared/Header';
import { Menu } from 'lucide-react';

const Login = lazy(() => import('./Auth/LoginAndSignup/Login'));
const Signup = lazy(() => import('./Auth/LoginAndSignup/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const AddBillPage = lazy(() => import('./pages/Bills/AddBillPage'));
const EditBillPage = lazy(() => import('./pages/Bills/EditBillPage'));
const SettleBillPage = lazy(() => import('./pages/Bills/SettleBillPage'));
const Management = lazy(() => import('./pages/Management/Management'));
const CalendarPage = lazy(() => import('./pages/Calendar/CalendarPage'));
const SettlementsPage = lazy(() => import('./pages/Settlements/SettlementsPage'));
const DebtsPage = lazy(() => import('./pages/Utangs/DebtsPage'));
const AddDebtPage = lazy(() => import('./pages/Utangs/AddDebtPage'));
const EditDebtPage = lazy(() => import('./pages/Utangs/EditDebtPage'));
const SettleDebtPage = lazy(() => import('./pages/Utangs/SettleDebtPage'));
const PrintPage = lazy(() => import('./pages/Print/PrintPage'));

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
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(true);
                            }}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm text-gray-900 hover:bg-gray-50 active:scale-90 transition-all"
                            aria-label="Open menu"
                        >
                            <Menu size={22} className="stroke-[2.5]" />
                        </button>
                        <TimeDisplay dateTime={dateTime} />
                    </div>
                </div>
                <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-100">
                    <div className="px-6 py-4">
                        <Header title={pageTitle} subtitle={pageSubtitle} />
                    </div>
                </div>
                {children}
            </div>
        </div>
    ) : <Navigate to="/login" />;
};

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ModalProvider>
                    <Suspense fallback={<LoadingFallback />}>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/setup" element={<Signup />} />
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
                                <Route 
                                    path="/utangs" 
                                    element={
                                        <PrivateRoute pageTitle="Utangs" pageSubtitle="Manage your personal debts">
                                            <DebtsPage />
                                        </PrivateRoute>
                                    } 
                                />
                                <Route 
                                    path="/add-debt" 
                                    element={
                                        <PrivateRoute pageTitle="Add Utang" pageSubtitle="Record a new personal debt">
                                            <AddDebtPage />
                                        </PrivateRoute>
                                    } 
                                />
                                <Route 
                                    path="/edit-debt/:id" 
                                    element={
                                        <PrivateRoute pageTitle="Edit Utang" pageSubtitle="Update your personal debt">
                                            <EditDebtPage />
                                        </PrivateRoute>
                                    } 
                                />
                                <Route 
                                    path="/settle-debt/:id" 
                                    element={
                                        <PrivateRoute pageTitle="Bayad Time" pageSubtitle="Settle your personal debt">
                                            <SettleDebtPage />
                                        </PrivateRoute>
                                    } 
                                />
                                <Route 
                                    path="/print" 
                                    element={
                                        <PrivateRoute pageTitle="Print Records" pageSubtitle="Print detailed payment and debt records">
                                            <PrintPage />
                                        </PrivateRoute>
                                    } 
                                />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Router>
                    </Suspense>
                </ModalProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
