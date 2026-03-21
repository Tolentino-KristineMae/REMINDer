import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const C = {
  bg:           'rgba(21, 128, 61, 0.95)',
  border:       'rgba(255,255,255,0.1)',
  text:         '#ffffff',
  textMuted:    'rgba(255,255,255,0.6)',
  textActive:   '#ffffff',
  iconDefault:  'rgba(255,255,255,0.6)',
  iconActive:   '#ffffff',
  activeBg:     'rgba(255,255,255,0.2)',
  activeBorder: '#ffffff',
  hoverBg:      'rgba(255,255,255,0.1)',
  badgeBg:      '#4ade80',
  badgeText:    '#14532d',
  logoutHover:  'rgba(239, 68, 68, 0.2)',
  logoutText:   '#fca5a5',
  toggle:       'rgba(255,255,255,0.1)',
  toggleBorder: 'rgba(255,255,255,0.2)',
};

const menuItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
  { icon: <Calendar size={18} />,        label: 'Calendar',   path: '/calendar' },
  { icon: <CheckCircle2 size={18} />,    label: 'Paid Bills', path: '/paid-bills' },
  { icon: <Users size={18} />,           label: 'Team',       path: '/team' },
  { icon: <BarChart3 size={18} />,       label: 'Analytics',  path: '/analytics' },
];

const generalItems = [
  { icon: <Settings size={18} />,   label: 'Settings', path: '/settings' },
  { icon: <HelpCircle size={18} />, label: 'Help',     path: '/help' },
];

const Tooltip = ({ label }) => (
  <span style={{
    position:      'absolute',
    left:          'calc(100% + 10px)',
    top:           '50%',
    transform:     'translateY(-50%)',
    background:    'rgba(0,0,0,0.8)',
    color:         '#fff',
    fontSize:      '12px',
    fontWeight:    600,
    padding:       '5px 10px',
    borderRadius:  '8px',
    whiteSpace:    'nowrap',
    pointerEvents: 'none',
    zIndex:        9999,
    boxShadow:     '0 4px 14px rgba(0,0,0,0.18)',
  }}>
    {label}
    <span style={{
      position:         'absolute',
      right:            '100%',
      top:              '50%',
      transform:        'translateY(-50%)',
      border:           '5px solid transparent',
      borderRightColor: 'rgba(0,0,0,0.8)',
    }} />
  </span>
);

const NavItem = ({ icon, label, path, badge, collapsed, isLogout, onClose, logout }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle = (isActive) => ({
    position:       'relative',
    display:        'flex',
    alignItems:     'center',
    gap:            collapsed ? 0 : '11px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    width:          '100%',
    padding:        collapsed ? '10px 0' : '8px 12px',
    borderRadius:   '10px',
    border:         'none',
    cursor:         'pointer',
    transition:     'background 0.15s, color 0.15s',
    textDecoration: 'none',
    boxSizing:      'border-box',
    background: isLogout
      ? (hovered ? C.logoutHover : 'transparent')
      : isActive
        ? C.activeBg
        : hovered
          ? C.hoverBg
          : 'transparent',
    color: isLogout
      ? (hovered ? C.logoutText : C.textMuted)
      : isActive ? C.textActive : C.text,
  });

  const iconStyle = (isActive) => ({
    display:    'flex',
    flexShrink: 0,
    color: isLogout
      ? (hovered ? C.logoutText : C.iconDefault)
      : isActive ? C.iconActive : C.iconDefault,
    transform:  hovered ? 'scale(1.12)' : 'scale(1)',
    transition: 'transform 0.15s',
  });

  const inner = (isActive) => (
    <>
      {isActive && !isLogout && (
        <span style={{
          position:     'absolute',
          left:         '-12px',
          top:          '50%',
          transform:    'translateY(-50%)',
          width:        '4px',
          height:       '55%',
          borderRadius: '0 4px 4px 0',
          background:   C.activeBorder,
        }} />
      )}

      <span style={iconStyle(isActive)}>{icon}</span>

      {!collapsed && (
        <span style={{
          fontSize:   '14px',
          fontWeight: isActive ? 600 : 500,
          flex:       1,
          textAlign:  'left',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}

      {!collapsed && badge && (
        <span style={{
          background:   C.badgeBg,
          color:        C.badgeText,
          fontSize:     '9px',
          fontWeight:   700,
          padding:      '2px 7px',
          borderRadius: '999px',
        }}>
          {badge}
        </span>
      )}

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
          style={baseStyle(false)}
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
        style={({ isActive }) => baseStyle(isActive)}
      >
        {({ isActive }) => inner(isActive)}
      </NavLink>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const W = collapsed ? 72 : 256;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          style={{ border: 'none', cursor: 'pointer' }}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen flex flex-col
          transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          width:          W,
          minWidth:       W,
          padding:        '16px 12px',
          background:     C.bg,
          backdropFilter: 'blur(20px)',
          borderRight:    `1px solid ${C.border}`,
          boxShadow:      '2px 0 12px rgba(0,0,0,0.06)',
          transition:     'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow:       'hidden',
          boxSizing:      'border-box',
        }}
      >
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom:   '28px',
          padding:        '4px 4px 0',
        }}>
          <Logo size={collapsed ? 'sm' : 'lg'} />

          <button
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              width:          28,
              height:         28,
              flexShrink:     0,
              border:         `1px solid ${C.toggleBorder}`,
              borderRadius:   '8px',
              background:     C.toggle,
              color:          C.iconDefault,
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              marginLeft:     collapsed ? 0 : '8px',
              transition:     'background 0.15s',
            }}
          >
            {collapsed
              ? <ChevronRight size={15} strokeWidth={2.5} />
              : <ChevronLeft  size={15} strokeWidth={2.5} />}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {!collapsed ? (
            <p style={{
              fontSize:      '10px',
              fontWeight:    600,
              color:         C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin:        '0 0 6px 8px',
            }}>Menu</p>
          ) : <div style={{ height: 8 }} />}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
            {menuItems.map(item => (
              <NavItem key={item.label} {...item} collapsed={collapsed} onClose={onClose} />
            ))}
          </nav>

          {!collapsed ? (
            <p style={{
              fontSize:      '10px',
              fontWeight:    600,
              color:         C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin:        '0 0 6px 8px',
            }}>General</p>
          ) : (
            <div style={{ height: '1px', background: C.border, margin: '4px 8px 12px' }} />
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {generalItems.map(item => (
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

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '12px', marginTop: '12px' }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${C.border}` }}
                alt="Avatar"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0 }}
                alt="Avatar"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Admin'}
                </p>
                <p style={{ fontSize: '9px', color: C.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
