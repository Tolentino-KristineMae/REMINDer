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
import Logo from './Logo';

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
                    w-64 h-screen flex flex-col p-4 fixed left-0 top-0 z-50
                    transition-transform duration-200 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
                style={{ 
                    background: 'rgba(21, 128, 61, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255,255,255,.1)'
                }}
            >
                <div className="lg:hidden flex items-center justify-between px-2 pt-1 pb-3">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Menu</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white hover:bg-white/10"
                        aria-label="Close sidebar"
                    >
                        <X size={18} className="stroke-[2.5]" />
                    </button>
                </div>

                <div className="p-4 mb-4">
                    <Logo size="lg" />
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Menu</h3>
                        <nav className="space-y-0.5">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group
                                        ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}
                                    `}
                                    onClick={() => onClose?.()}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="bg-green-400 text-green-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">General</h3>
                        <nav className="space-y-0.5">
                            {generalItems.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                                        ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}
                                    `}
                                    onClick={() => onClose?.()}
                                >
                                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all group"
                            >
                                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} className="w-9 h-9 rounded-full border-2 border-white/20" alt="Avatar" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[9px] text-white/50 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
