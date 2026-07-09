import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { useTheme } from '../context/ThemeContext';
import {
    ChevronLeft, SlidersHorizontal, Settings, X, Database, ChevronRight, Search
} from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        match,
        toggleMenu,
        toggleScorecard,
        searchQuery,
        setSearchQuery,
        showSearch,
        setShowSearch
    } = useMatch();
    const { theme, toggleTheme } = useTheme();

    const [showGlobalSettings, setShowGlobalSettings] = useState(false);

    // Check if we are in Scorer Mode
    const isScorerMode = location.pathname === '/scorer';
    const isHomePage = location.pathname === '/';

    return (
        <>
            <nav className="glass-navbar">
                {isHomePage && showSearch ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                        {/* Search Capsule Wrapper */}
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            {/* Prefix Search Icon */}
                            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, pointerEvents: 'none' }} />

                            <input
                                type="text"
                                className="nav-search-input"
                                placeholder="Search matches, teams, opponents..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />

                            {/* Permanent Clear/Cancel Button */}
                            <button
                                onClick={() => {
                                    if (searchQuery) {
                                        setSearchQuery('');
                                    } else {
                                        setShowSearch(false);
                                    }
                                }}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'background 0.2s'
                                }}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {isHomePage && (
                                        <button className="nav-btn" onClick={() => setShowSearch(true)}>
                                            <Search size={20} />
                                        </button>
                                    )}
                                    <button className="nav-btn" onClick={() => setShowGlobalSettings(true)}>
                                        <Settings size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
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