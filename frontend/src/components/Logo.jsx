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

    if (!selectedSize.showFull) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className={`${selectedSize.icon} bg-white rounded-2xl flex items-center justify-center text-green-600 font-black shadow-lg shadow-green-900/10 shrink-0`}>
                    R
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${selectedSize.icon} bg-white rounded-2xl flex items-center justify-center text-green-600 font-black shadow-lg shadow-green-900/10 shrink-0`}>
                R
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
