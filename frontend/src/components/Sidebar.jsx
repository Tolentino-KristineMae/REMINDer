import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Calendar, 
    BarChart3, 
    Users, 
    Settings, 
    HelpCircle, 
    LogOut,
    CheckCircle2,
    X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
        { icon: <Calendar size={18} />, label: 'Calendar', path: '/calendar' },
        { icon: <CheckCircle2 size={18} />, label: 'Paid Bills', path: '/paid-bills' },
        { icon: <Users size={18} />, label: 'Team', path: '/team' },
        { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/analytics' },
    ];

    const generalItems = [
        { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
        { icon: <HelpCircle size={18} />, label: 'Help', path: '/help' },
    ];

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <aside
                className={`
                    w-56 h-screen bg-white border-r border-gray-100 flex flex-col p-4 fixed left-0 top-0 z-50
                    transition-transform duration-200 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <div className="lg:hidden flex items-center justify-between px-2 pt-1 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-gray-500 hover:bg-gray-50"
                        aria-label="Close sidebar"
                    >
                        <X size={18} className="stroke-[2.5]" />
                    </button>
                </div>

            <div className="flex items-center gap-3 p-4 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-green-600/20">
                    R
                </div>
                <span className="text-xl font-black text-gray-800 tracking-tighter">REMINDer</span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
                <div>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</h3>
                    <nav className="space-y-0.5">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center justify-between px-3 py-2 rounded-lg transition-all group
                                    ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                                `}
                                onClick={() => onClose?.()}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-green-900 text-white text-[9px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">General</h3>
                    <nav className="space-y-0.5">
                        {generalItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all group
                                    ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                                `}
                                onClick={() => onClose?.()}
                            >
                                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                        >
                            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-2 py-2">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} className="w-8 h-8 rounded-full border border-gray-100" alt="Avatar" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-800 truncate">{user?.name || 'Admin'}</p>
                        <p className="text-[9px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
            </aside>
        </>
    );
};

export default Sidebar;
