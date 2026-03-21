import React from 'react';

const Logo = ({ size = 'xl', className, dark = false }) => {
    const sizes = {
        lg: {
            icon: 'w-12 h-12 text-lg',
            main: 'text-xl',
            sub: 'text-[9px]',
            showFull: true
        },
        xl: {
            icon: 'w-10 h-10 text-xl',
            main: 'text-xl',
            sub: 'text-[9px]',
            showFull: true
        },
        sm: {
            icon: 'w-10 h-10 text-xl',
            main: 'text-xl',
            sub: 'text-[9px]',
            showFull: false
        }
    };

    const selectedSize = sizes[size] || sizes.xl;

    const textColor = dark ? '#ffffff' : '#2d2d2d';
    const subColor = dark ? 'rgba(255,255,255,0.6)' : '#a0a0a0';
    const accentColor = dark ? '#86efac' : '#16a34a';

    const iconSizes = {
        lg: 'w-12 h-12',
        xl: 'w-10 h-10',
        sm: 'w-10 h-10'
    };

    const iconSize = iconSizes[size] || iconSizes.xl;

    const RemindLogo = ({ size }) => (
        <svg 
            viewBox="0 0 40 40" 
            className={iconSize}
            fill="none"
        >
            {/* Background Circle */}
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#logoGrad)" />
            
            {/* Bell Body - representing REMINDear */}
            <path 
                d="M20 8C18.5 8 17.2 8.6 16.3 9.5L16 9.8V14C16 16.2 14.2 18 12 18H12.5C12.5 19.1 12.7 20.1 13 21L12 22H28L27 21C27.3 20.1 27.5 19.1 27.5 18H28C25.8 18 24 16.2 24 14V9.8L23.7 9.5C22.8 8.6 21.5 8 20 8Z" 
                fill="white" 
                fillOpacity="0.95"
            />
            
            {/* Bell Clapper */}
            <circle cx="20" cy="26" r="2.5" fill="white" fillOpacity="0.9" />
            
            {/* Checkmark - representing PAID/DONE */}
            <path 
                d="M15 20L18 23L25 16" 
                stroke="#22c55e" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );

    if (!selectedSize.showFull) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <RemindLogo size={size} />
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <RemindLogo size={size} />
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className={`${selectedSize.main} font-black tracking-tighter leading-none`}>
                    <span style={{ color: textColor }}>REM</span>
                    <span style={{ color: accentColor }}>INDer</span>
                </div>
                <p className={`${selectedSize.sub} font-bold uppercase tracking-widest`} style={{ color: subColor }}>System</p>
            </div>
        </div>
    );
};

export default Logo;
