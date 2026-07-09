import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { useTheme } from '../context/ThemeContext';
import {
    ChevronLeft, SlidersHorizontal, Settings, X, Database, ChevronRight
} from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        match,
        toggleMenu,
        toggleScorecard
    } = useMatch();
    const { theme, toggleTheme } = useTheme();

    const [showGlobalSettings, setShowGlobalSettings] = useState(false);

    // Check if we are in Scorer Mode
    const isScorerMode = location.pathname === '/scorer';

    return (
        <>
            <nav className="glass-navbar">

                {/* --- LEFT: Logo or Back --- */}
                <div className="nav-left">
                    {isScorerMode ? (
                        <button className="nav-btn" onClick={() => navigate('/')}>
                            <ChevronLeft size={24} />
                        </button>
                    ) : (
                        <Link to="/" className="nav-logo">
                            <svg width="28" height="28" viewBox="0 0 512 512" fill="none" style={{ marginRight: 8 }}>
                                <rect width="512" height="512" rx="120" fill="#3B82F6" />
                                <path d="M 316 136 C 226 136, 196 196, 256 256 C 316 316, 286 376, 196 376"
                                    stroke="white" strokeWidth="60" strokeLinecap="round" />
                            </svg>
                            <span className="logo-text">SCORD</span>
                        </Link>
                    )}
                </div>

                {/* --- CENTER: MATCH CAPSULE --- */}
                {isScorerMode && match && (
                    <div className="nav-center">
                        <div className="match-capsule" onClick={() => toggleScorecard(true)}>
                            <div className="match-title">
                                <span>{match.t1}</span>
                                <span className="vs-tag">VS</span>
                                <span>{match.t2}</span>
                            </div>
                            <div className={`match-status ${match.isDone ? 'finished' : 'live'}`}>
                                <div className="status-dot"></div>
                                <span>{match.isDone ? 'FINISHED' : 'LIVE'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- RIGHT: Actions --- */}
                <div className="nav-actions">
                    {isScorerMode ? (
                        <button className="nav-btn" onClick={() => toggleMenu(true)}>
                            <SlidersHorizontal size={20} />
                        </button>
                    ) : (
                        <button className="nav-btn" onClick={() => setShowGlobalSettings(true)}>
                            <Settings size={20} />
                        </button>
                    )}
                </div>
            </nav>

            {/* --- GLOBAL SETTINGS SHEET --- */}
            {showGlobalSettings && (
                <div className="modal-overlay open" style={{ zIndex: 200 }} onClick={(e) => e.target.className.includes('overlay') && setShowGlobalSettings(false)}>
                    <div className="sheet">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0 }}>Settings</h2>
                            <button className="btn-icon" onClick={() => setShowGlobalSettings(false)}><X size={20} /></button>
                        </div>

                        {/* Theme Toggle */}
                        <div className="input-group">
                            <span className="input-label">App Theme</span>
                            <div className="toggle-row">
                                <button className={`toggle-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => toggleTheme('dark')}>Dark</button>
                                <button className={`toggle-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => toggleTheme('light')}>Light</button>
                            </div>
                        </div>

                        {/* Backup / Restore Navigation */}
                        <button className="btn-action" onClick={() => { setShowGlobalSettings(false); navigate('/data'); }} style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Database size={20} color="var(--primary)" />
                                <span>Backup</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </button>

                        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                            Scord v1.0
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;