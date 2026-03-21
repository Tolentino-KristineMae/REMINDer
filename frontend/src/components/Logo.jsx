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
        lg: 'w-12 h-12 text-2xl',
        xl: 'w-10 h-10 text-xl',
        sm: 'w-10 h-10 text-xl'
    };

    const iconSize = iconSizes[size] || iconSizes.xl;

    if (!selectedSize.showFull) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className={`${iconSize} bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-green-600/30 shrink-0 relative`}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20h4l6-16h4" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${iconSize} bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-green-600/30 shrink-0 relative`}>
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h4l6-16h4" />
                </svg>
            </div>
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
