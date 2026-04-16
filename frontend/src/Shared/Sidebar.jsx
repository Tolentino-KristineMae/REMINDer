import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings2,
  Wallet2,
  Printer,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import remindearLogo from '../assets/REMINDear-Logo.png';
import '../styles/shared/Sidebar.css';

const menuItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
  { icon: <Plus size={18} />,            label: 'Add Bill',   path: '/add-bill' },
  { icon: <Calendar size={18} />,        label: 'Calendar',   path: '/calendar' },
  { icon: <CheckCircle2 size={18} />,    label: 'Settlements', path: '/paid-bills' },
  { icon: <Wallet2 size={18} />,         label: 'Utangs',     path: '/utangs' },
  { icon: <Printer size={18} />,         label: 'Print',      path: '/print' },
  { icon: <Settings2 size={18} />,       label: 'Management',  path: '/management' },
];

const Tooltip = ({ label }) => (
  <span className="tooltip">
    {label}
    <span className="tooltipArrow" />
  </span>
);

const NavItem = ({ icon, label, path, badge, collapsed, isLogout, onClose, logout }) => {
  const [hovered, setHovered] = useState(false);

  const getNavItemClass = (isActive) => {
    let classes = ['navItem'];
    if (collapsed) classes.push('navItemCollapsed');
    if (isActive && !isLogout) classes.push('navItemActive');
    if (isLogout) classes.push('navItemLogout');
    return classes.join(' ');
  };

  const inner = (isActive) => (
    <>
      {isActive && !isLogout && <span className="activeIndicator" />}
      <span className="navIcon">{icon}</span>
      {!collapsed && <span className="navLabel">{label}</span>}
      {!collapsed && badge && <span className="badge">{badge}</span>}
      {collapsed && hovered && <Tooltip label={label} />}
    </>
  );

  if (isLogout) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={logout}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={getNavItemClass(false)}
        >
          {inner(false)}
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <NavLink
        to={path}
        end={path === '/'}
        onClick={() => onClose?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={({ isActive }) => getNavItemClass(isActive)}
      >
        {({ isActive }) => inner(isActive)}
      </NavLink>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, collapsed: externalCollapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const collapsed = isMobile ? false : (externalCollapsed ?? internalCollapsed);
  const setCollapsed = (val) => {
    setInternalCollapsed(val);
    onCollapse?.(val);
  };

  const sidebarWidth = isMobile ? 280 : (collapsed ? 72 : 256);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="overlay"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebarVisible' : 'sidebarHidden'}`}
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* Logo Header */}
        <div className={`logoHeader ${collapsed ? 'logoHeaderCollapsed' : ''}`}>
          <img 
            src={remindearLogo} 
            alt="REMINDear Logo" 
            className={`logoImage ${collapsed ? 'logoImageCollapsed' : ''}`}
          />

          {!collapsed && !isMobile && (
            <button
              onClick={() => setCollapsed(v => !v)}
              title="Collapse"
              className="collapseButton"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Separator - Logo to Nav */}
        <div className="separator separatorTop" />

        {collapsed && !isMobile && (
          <button
            onClick={() => setCollapsed(v => !v)}
            title="Expand"
            className="expandButton"
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        )}

        <div className="navContainer">
          {!collapsed && <p className="menuLabel">Menu</p>}

          <nav className="nav">
            {menuItems.map(item => (
              <NavItem key={item.label} {...item} collapsed={collapsed} onClose={onClose} />
            ))}
            <NavItem
              icon={<LogOut size={18} />}
              label="Logout"
              path="#"
              collapsed={collapsed}
              isLogout
              logout={logout}
            />
          </nav>
        </div>

        {/* Separator - Nav to Account */}
        <div className="separator separatorBottom" />

        {/* User Profile */}
        <div className="userProfile">
          {collapsed ? (
            <div className="userProfileCollapsed">
              <div className="userAvatar">
                {user?.first_name?.[0] || user?.name?.[0]}{(user?.last_name || user?.name?.split(' ').slice(1).join(' '))?.[0]}
              </div>
            </div>
          ) : (
            <div className="userInfo">
              <div className="userAvatar">
                {user?.first_name?.[0] || user?.name?.[0]}{(user?.last_name || user?.name?.split(' ').slice(1).join(' '))?.[0]}
              </div>
              <div className="userDetails">
                <p className="userName">
                  {user?.name || 'Admin'}
                </p>
                <p className="userEmail">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
