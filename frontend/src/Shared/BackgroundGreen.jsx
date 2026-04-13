import '../styles/shared/BackgroundAuth.css';

const BackgroundAuth = () => {
    return (
        <div className="authBgRoot">
            {/* Blobs */}
            <div className="blob b1" />
            <div className="blob b2" />
            <div className="blob b3" />
            <div className="blob b4" />
            <div className="blob b5" />
            <div className="blob b6" />

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
            <div className="dot d1" />
            <div className="dot d2" />
            <div className="dot d3" />
            <div className="dot d4" />
        </div>
    );
};

export default BackgroundAuth;
