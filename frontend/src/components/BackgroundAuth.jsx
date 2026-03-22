import React from 'react';

const BackgroundAuth = () => {
    return (
        <>
            <style>{`
                .auth-bg-root {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    z-index: 0;
                    background: #14532d;
                }

                .auth-bg-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 60% at 15% 25%, rgba(34,197,94,0.45) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 70% at 85% 75%, rgba(6,78,59,0.7) 0%, transparent 60%),
                        linear-gradient(160deg, #15803d 0%, #0f4d27 100%);
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    pointer-events: none;
                    background: linear-gradient(135deg, #4ade80, #86efac);
                    filter: blur(1px);
                    z-index: 1;
                }
                .b1 { width:240px; height:240px; top:4%; left:3%; opacity:.2; border-radius:60% 40% 55% 45%/45% 55% 45% 55%; animation:fA 7s ease-in-out infinite; }
                .b2 { width:170px; height:170px; bottom:8%; left:10%; opacity:.17; border-radius:40% 60% 45% 55%/55% 45% 60% 40%; animation:fB 9s ease-in-out infinite; background:linear-gradient(135deg,#22c55e,#86efac); }
                .b3 { width:300px; height:190px; top:12%; right:2%; opacity:.18; border-radius:55% 45% 60% 40%/40% 60% 40% 60%; animation:fC 8s ease-in-out infinite; background:linear-gradient(135deg,#4ade80,#16a34a); }
                .b4 { width:140px; height:140px; bottom:18%; right:6%; opacity:.15; border-radius:50% 50% 40% 60%/60% 40% 60% 40%; animation:fA 6s ease-in-out infinite reverse; background:linear-gradient(135deg,#86efac,#22c55e); }
                .b5 { width:110px; height:110px; top:42%; left:1%; opacity:.13; border-radius:60% 40% 50% 50%/50% 50% 60% 40%; animation:fB 10s ease-in-out infinite; background:linear-gradient(135deg,#bbf7d0,#4ade80); }
                .b6 { width:85px;  height:85px;  top:62%; right:16%; opacity:.15; border-radius:50% 50% 40% 60%/40% 60% 50% 50%; animation:fC 7.5s ease-in-out infinite reverse; }

                .worm { position:absolute; pointer-events:none; opacity:.18; z-index:1; }
                .w1 { top:5%;    left:26%;  animation:fA 8s ease-in-out infinite; }
                .w2 { bottom:6%; right:20%; animation:fB 9s ease-in-out infinite; }
                .w3 { top:45%;   right:3%;  animation:fC 7s ease-in-out infinite; }

                .dot { position:absolute; border-radius:50%; background:rgba(255,255,255,.45); pointer-events:none; z-index:1; }
                .d1 { width:5px; height:5px; top:17%; left:38%; animation:fA 5s ease-in-out infinite; }
                .d2 { width:3px; height:3px; top:73%; left:52%; animation:fB 6s ease-in-out infinite 1s; }
                .d3 { width:4px; height:4px; top:38%; right:14%; animation:fC 7s ease-in-out infinite .5s; }
                .d4 { width:3px; height:3px; bottom:22%; left:42%; animation:fA 4.5s ease-in-out infinite 2s; }

                @keyframes fA { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 33%{transform:translateY(-18px) rotate(4deg) scale(1.04);} 66%{transform:translateY(10px) rotate(-3deg) scale(.97);} }
                @keyframes fB { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 33%{transform:translateY(14px) rotate(-5deg) scale(1.03);} 66%{transform:translateY(-10px) rotate(3deg) scale(.98);} }
                @keyframes fC { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 50%{transform:translateY(-22px) rotate(6deg) scale(1.05);} }
            `}</style>

            <div className="auth-bg-root">
                {/* Blobs */}
                <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
                <div className="blob b4"/><div className="blob b5"/><div className="blob b6"/>

                {/* Worm shapes */}
                <svg className="worm w1" width="130" height="80" viewBox="0 0 130 80">
                    <path d="M10 45 C30 10,55 75,80 42 S118 12,122 44" stroke="#4ade80" strokeWidth="18" fill="none" strokeLinecap="round"/>
                </svg>
                <svg className="worm w2" width="130" height="80" viewBox="0 0 130 80">
                    <path d="M8 42 C28 8,53 73,78 40 S116 10,120 42" stroke="#22c55e" strokeWidth="15" fill="none" strokeLinecap="round"/>
                </svg>
                <svg className="worm w3" width="80" height="110" viewBox="0 0 80 110">
                    <path d="M40 8 C10 28,70 52,40 72 S10 92,40 105" stroke="#86efac" strokeWidth="14" fill="none" strokeLinecap="round"/>
                </svg>

                {/* Particles */}
                <div className="dot d1"/><div className="dot d2"/>
                <div className="dot d3"/><div className="dot d4"/>
            </div>
        </>
    );
};

export default BackgroundAuth;
