import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SyncStatus from './SyncStatus';
import { useMatch } from '../context/MatchContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    ChevronLeft, SlidersHorizontal, BarChart3, Settings,
    LogIn, User, Server, ChevronRight, X
} from 'lucide-react';

// Import the CSS we just created
// import '../styles/navbar.css'; 

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { match, toggleMenu, toggleScorecard } = useMatch();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

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
                            {/* SVG ICON REPLACING THE EMOJI */}
                            <svg width="28" height="28" viewBox="0 0 512 512" fill="none" style={{ marginRight: 8 }}>
                                <rect width="512" height="512" rx="120" fill="#3B82F6" />
                                <path d="M 316 136 C 226 136, 196 196, 256 256 C 316 316, 286 376, 196 376"
                                    stroke="white" strokeWidth="60" strokeLinecap="round" />
                            </svg>

                            <span className="logo-text">SCORD</span>
                        </Link>
                    )}
                </div>

                {/* --- CENTER: MATCH CAPSULE (The Fix) --- */}
                {isScorerMode && match && (
                    <div className="nav-center">
                        <div className="match-capsule" onClick={() => toggleScorecard(true)}>
                            {/* Team Names */}
                            <div className="match-title">
                                <span>{match.t1}</span>
                                <span className="vs-tag">VS</span>
                                <span>{match.t2}</span>
                            </div>

                            {/* Status Dot */}
                            <div className={`match-status ${match.isDone ? 'finished' : 'live'}`}>
                                <div className="status-dot"></div>
                                <span>{match.isDone ? 'FINISHED' : 'LIVE'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- RIGHT: Actions --- */}
                <div className="nav-actions">

                    {/* Sync Indicator */}
                    <SyncStatus />

                    {isScorerMode ? (
                        <>
                            {/* Scorer Specific Icons */}
                            <button className="nav-btn" onClick={() => toggleMenu(true)}>
                                <SlidersHorizontal size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Dashboard Settings */}
                            <button className="nav-btn" onClick={() => setShowGlobalSettings(true)}>
                                <Settings size={20} />
                            </button>
                        </>
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

                        {/* Account Management */}
                        <button className="btn-action" onClick={() => { setShowGlobalSettings(false); navigate('/login'); }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {user ? <User size={20} color="var(--primary)" /> : <LogIn size={20} color="var(--text-muted)" />}
                                <span>{user ? 'Manage Account' : 'Log In / Sign Up'}</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </button>

                        {/* Logout */}
                        {user && (
                            <button className="btn btn-danger" style={{ marginTop: 10 }} onClick={() => { logout(); setShowGlobalSettings(false); }}>
                                Log Out
                            </button>
                        )}

                        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                            Scord v1.0
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;