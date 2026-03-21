import React from 'react';

const Logo = ({ size = 'xl', className }) => {
    const sizes = {
        lg: {
            icon: 'w-14 h-14 text-xl',
            main: 'text-2xl',
            sub: 'text-[10px]'
        },
        xl: {
            icon: 'w-10 h-10 text-2xl',
            main: 'text-xl',
            sub: 'text-[9px]'
        }
    };

    const selectedSize = sizes[size] || sizes.xl;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${selectedSize.icon} bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-green-600/25 shrink-0 overflow-hidden`}>
                <span className="text-gray-900">REM</span>
            </div>
            <div>
                <div className={`${selectedSize.main} font-black tracking-tighter leading-none`}>
                    <span className="text-gray-900">REM</span>
                    <span className="text-green-600">INDer</span>
                </div>
                <p className={`${selectedSize.sub} font-bold text-gray-400 uppercase tracking-widest`}>System</p>
            </div>
        </div>
    );
};

export default Logo;
