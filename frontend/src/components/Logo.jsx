import React from 'react';

const Logo = ({ size = 'xl', className }) => {
    const sizes = {
        lg: {
            icon: 'w-12 h-12 text-3xl',
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
            <div className={`${selectedSize.icon} bg-green-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-green-600/20 shrink-0`}>
                R
            </div>
            <div>
                <div className={`${selectedSize.main} font-black tracking-tighter leading-none`}>
                    <span className="text-gray-800">reM</span>
                    <span className="text-green-600">INDer</span>
                </div>
                <p className={`${selectedSize.sub} font-bold text-gray-400 uppercase tracking-widest`}>System</p>
            </div>
        </div>
    );
};

export default Logo;
