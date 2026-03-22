import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Settings2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const C = {
  bg:           '#052e16',
  border:       '#14532d',
  text:         '#e2e8f0',
  textMuted:    '#94a3b8',
  textActive:   '#ffffff',
  textHover:    '#ffffff',
  iconDefault:  '#94a3b8',
  iconActive:   '#ffffff',
  iconHover:    '#ffffff',
  activeBg:     'rgba(34, 197, 94, 0.15)',
  activeBorder: '#22c55e',
  hoverBg:      'rgba(255, 255, 255, 0.08)',
  hoverBorder:  'rgba(255, 255, 255, 0.1)',
  badgeBg:      '#22c55e',
  badgeText:    '#052e16',
  logoutHover:  'rgba(239, 68, 68, 0.15)',
  logoutText:   '#fca5a5',
  toggle:       '#ffffff',
  toggleBorder: '#ffffff',
  fontFamily:   "'Plus Jakarta Sans', sans-serif",
};

const menuItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
  { icon: <Calendar size={18} />,        label: 'Calendar',   path: '/calendar' },
  { icon: <CheckCircle2 size={18} />,    label: 'Settlements', path: '/paid-bills' },
  { icon: <Settings2 size={18} />,       label: 'Management',  path: '/management' },
];

const Tooltip = ({ label }) => (
  <span style={{
    position:      'absolute',
    left:          'calc(100% + 12px)',
    top:           '50%',
    transform:     'translateY(-50%)',
    background:    'rgba(255, 255, 255, 0.98)',
    color:         '#052e16',
    fontSize:      '12px',
    fontWeight:    600,
    padding:       '8px 14px',
    borderRadius:  '10px',
    whiteSpace:    'nowrap',
    pointerEvents: 'none',
    zIndex:        9999,
    boxShadow:     '0 8px 25px rgba(0,0,0,0.25), 0 0 0 1px rgba(34, 197, 94, 0.1)',
    fontFamily:    "'Plus Jakarta Sans', sans-serif",
  }}>
    {label}
    <span style={{
      position:         'absolute',
      right:            '100%',
      top:              '50%',
      transform:        'translateY(-50%)',
      border:           '6px solid transparent',
      borderRightColor: 'rgba(255, 255, 255, 0.98)',
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
    padding:        collapsed ? '10px 0' : '10px 12px',
    borderRadius:   '12px',
    border:         'none',
    cursor:         'pointer',
    transition:     'all 0.2s ease',
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
      : isActive ? C.textActive : (hovered ? C.textHover : C.text),
  });

  const iconStyle = (isActive) => ({
    display:    'flex',
    flexShrink: 0,
    color: isLogout
      ? (hovered ? C.logoutText : C.iconDefault)
      : isActive ? C.iconActive : (hovered ? C.iconHover : C.iconDefault),
    transform:  hovered ? 'translateX(3px)' : 'translateX(0)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const inner = (isActive) => (
    <>
      {isActive && !isLogout && (
        <span style={{
          position:     'absolute',
          left:         '-12px',
          top:          '8px',
          bottom:       '8px',
          width:        '2.5px',
          borderRadius: '0 4px 4px 0',
          background:   C.activeBorder,
          transition:   'all 0.2s ease',
        }} />
      )}

      <span style={iconStyle(isActive)}>{icon}</span>

      {!collapsed && (
        <span style={{
          fontSize:   '14px',
          fontWeight: isActive ? 600 : 500,
          fontFamily: C.fontFamily,
          flex:       1,
          textAlign:  'left',
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity:    hovered || isActive ? 1 : 0.9,
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
          fontFamily:   C.fontFamily,
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

const Sidebar = ({ isOpen, onClose, collapsed: externalCollapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  const collapsed = externalCollapsed ?? internalCollapsed;
  const setCollapsed = (val) => {
    setInternalCollapsed(val);
    onCollapse?.(val);
  };

  useEffect(() => {
    setCollapsed(false);
  }, []);

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
          width:      W,
          minWidth:   W,
          padding:    '16px 12px',
          background: C.bg,
          borderRight:`1px solid ${C.border}`,
          boxShadow:  '4px 0 24px rgba(0,0,0,0.3)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow:   'hidden',
          boxSizing:  'border-box',
        }}
      >
        {/* Logo Header */}
        <div style={{
          display:        'flex',
          flexDirection:  collapsed ? 'column' : 'row',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom:   '20px',
          gap:            collapsed ? '12px' : '0',
        }}>
          <Logo size={collapsed ? 'sm' : 'lg'} dark />

          {!collapsed && (
            <button
              onClick={() => setCollapsed(v => !v)}
              title="Collapse"
              style={{
                width:          28,
                height:         28,
                flexShrink:     0,
                border:         `1px solid ${C.toggleBorder}`,
                borderRadius:   '8px',
                background:     C.toggle,
                color:          '#166534',
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                marginLeft:     '8px',
                transition:     'background 0.15s',
              }}
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Separator - Logo to Nav */}
        <div 
          style={{
            height: '1px',
            background: `linear-gradient(to right, transparent, ${C.border}, transparent)`,
            marginBottom: '16px',
          }} 
        />

        {collapsed && (
          <button
            onClick={() => setCollapsed(v => !v)}
            title="Expand"
            style={{
              width:          32,
              height:         32,
              alignSelf:      'center',
              border:         `1px solid ${C.toggleBorder}`,
              borderRadius:   '8px',
              background:     C.toggle,
              color:          '#166534',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              marginBottom:   '16px',
              transition:     'background 0.15s',
            }}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        )}



        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {!collapsed && (
            <p style={{
              fontSize:      '10px',
              fontWeight:    600,
              color:         C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin:        '0 0 8px 8px',
              fontFamily:   C.fontFamily,
            }}>Menu</p>
          )}

          {/* Action Button */}
          <div style={{ padding: '0 8px', marginBottom: '24px' }}>
            <button
              onClick={() => navigate('/add-bill')}
              style={{
                width: '100%',
                padding: collapsed ? '12px' : '12px 16px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(34, 197, 94, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.25)';
              }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Plus size={20} strokeWidth={3} />
              </div>
              {!collapsed && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 800, 
                  fontFamily: 'Syne',
                  letterSpacing: '0.01em' 
                }}>New Bill</span>
              )}
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
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
        <div 
          style={{
            height: '1px',
            background: `linear-gradient(to right, transparent, ${C.border}, transparent)`,
            marginTop: '16px',
          }} 
        />

        {/* User Profile */}
        <div style={{ marginTop: 'auto', padding: '12px' }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${C.border}` }}
                alt="Avatar"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0 }}
                alt="Avatar"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: C.fontFamily }}>
                  {user?.name || 'Admin'}
                </p>
                <p style={{ fontSize: '10px', color: C.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: C.fontFamily }}>
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
