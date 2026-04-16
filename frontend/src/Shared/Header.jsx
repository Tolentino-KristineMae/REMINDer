import { useState, useEffect } from 'react';
import remindearLogo from '../assets/REMINDear-Logo.png';
import '../styles/shared/Header.css';

export const TimeDisplay = ({ dateTime }) => {
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };
    const formatDate = (date) => {
        return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    };

    return (
        <div className="timeDisplayContainer">
            <div className="timeColumn">
                <p className="timeText">{formatTime(dateTime)}</p>
                <p className="dateText">{formatDate(dateTime)}</p>
            </div>
            <div className="divider" />
            <div className="brandColumn">
                <img src={remindearLogo} alt="REMINDear Logo" className="brandLogo" />
            </div>
        </div>
    );
};

const Header = ({ title, subtitle }) => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="headerContainer">
            <div className="titleSection">
                <div className="titleRow">
                    <div className="titleAccent" />
                    <h1 className="title">{title}</h1>
                </div>
                {subtitle && (
                    <div className="subtitleRow">
                        <div className="subtitleAccent" />
                        <p className="subtitle">{subtitle}</p>
                    </div>
                )}
            </div>
            <div className="timeSection">
                <TimeDisplay dateTime={dateTime} />
            </div>
        </div>
    );
};

export default Header;
