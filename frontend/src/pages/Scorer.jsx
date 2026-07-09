import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { RotateCcw, X, CheckCircle, Trophy, Play, AlertTriangle, Eye, Home, List } from 'lucide-react';

export default function Scorer() {
    const {
        match, addBall, undo, updateMatch, endInnings, endMatch, getStats,
        uiState, toggleMenu, toggleScorecard
    } = useMatch();

    const navigate = useNavigate();
    const scrollRef = useRef(null);

    // LOCAL STATES
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [scTab, setScTab] = useState(1);
    const [showResultModal, setShowResultModal] = useState(true);

    // KEYPAD STATES
    const [isWicket, setIsWicket] = useState(false);
    const [deliveryType, setDeliveryType] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    // NAVIGATION BLOCKER
    const blocker = useBlocker(
        ({ currentValue, nextLocation }) => {
            if (window.__scord_bootstrapping) return false;
            return match && !match.isDone && currentValue.pathname !== nextLocation.pathname;
        }
    );

    // --- DATA CALCULATIONS (Null-Safe for Hook Compliance) ---
    const matchWickets = match?.wkts || 10;
    const matchOvers = match?.ov || 10;
    const activeInn = match?.activeInn || 1;
    const innData = (activeInn === 1 ? match?.inn1 : match?.inn2) || [];
    const stats = getStats(innData, match?.extraVal ?? 1);

    // Defines who is batting RIGHT NOW
    const batTeam = activeInn === 1 ? match?.battingTeam : match?.bowlingTeam;

    let target = 0, need = 0;
    const s1 = getStats(match?.inn1 || [], match?.extraVal ?? 1);
    target = s1.r + 1;
    if (activeInn === 2) need = target - stats.r;

    // --- LOGIC: GAME STATE ---
    const maxLegals = matchOvers * 6;
    const isInningsComplete = stats.w >= matchWickets || stats.legal >= maxLegals;
    const isMatchWon = activeInn === 2 && stats.r >= target;

    // --- SAFE LOAD ---
    useEffect(() => {
        if (!match) {
            navigate('/');
        } else {
            setScTab(match.activeInn);
            if (match.isDone) setShowResultModal(true);
        }
    }, [navigate, match?.id, match?.activeInn, match?.isDone]);

    // --- AUTO SCROLL ---
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        setDismissed(false);
    }, [match?.inn1?.length, match?.inn2?.length]);

    // --- AUTOMATION (FIXED) ---
    useEffect(() => {
        if (!match || match.isDone || dismissed) return;

        if (activeInn === 2) {
            if (isMatchWon) {
                // FIX: If chase is won, the CURRENT batting team (match.bowlingTeam) wins
                endMatch(`${match.bowlingTeam} won by ${matchWickets - stats.w} wickets`);
            } else if (isInningsComplete) {
                if (stats.r === target - 1) {
                    endMatch("Match Tied");
                } else {
                    // FIX: If chase fails, the CURRENT bowling team (match.battingTeam) wins
                    endMatch(`${match.battingTeam} won by ${need - 1} runs`);
                }
            }
        }
    }, [stats, activeInn, match?.isDone, dismissed, isInningsComplete, isMatchWon, endMatch, match?.bowlingTeam, match?.battingTeam, matchWickets, target, need]);

    if (!match) return null;

    // --- HANDLERS ---
    const handleInput = (runs) => {
        if (match.isDone || isInningsComplete || isMatchWon) return;
        addBall(runs, deliveryType, isWicket);
        setDeliveryType(null); setIsWicket(false);
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

    const handleUndo = () => {
        undo();
        showToast("Undo Successful");
        toggleMenu(false);
        setConfirm(null);
        setDismissed(false);
        if (match.isDone) setShowResultModal(false);
    };

    const handleEndInnings = () => {
        if (activeInn === 2) return;
        endInnings();
        setConfirm(null);
    };

    const handleForceEnd = () => {
        endMatch("Match Ended Manually");
        setConfirm(null);
        toggleMenu(false);
    };

    // --- VIEW HELPERS ---
    const getBallDisplay = (b) => {
        if (b.isWicket) {
            if (b.type === 'LEGAL' && b.runs === 0) return <span>W</span>;
            let prefix = "";
            if (['WD', 'NB'].includes(b.type)) prefix = b.type.toLowerCase();
            return (
                <>
                    <span>{prefix}{b.runs > 0 ? `+${b.runs}` : ''}</span>
                    <span className="sub">W</span>
                </>
            );
        }
        if (['WD', 'NB'].includes(b.type)) {
            return (
                <>
                    <span style={{ fontSize: '0.75rem', textTransform: 'lowercase' }}>{b.type}</span>
                    {b.runs > 0 && <span className="sub">+{b.runs}</span>}
                </>
            );
        }
        return <span>{b.runs}</span>;
    };

    const getCurrentOverBalls = () => {
        const currentOverNum = Math.floor(stats.legal / 6);
        let legalCounter = 0, tempOverIndex = 0, currentOverBalls = [];

        innData.forEach(b => {
            if (tempOverIndex === currentOverNum) currentOverBalls.push(b);
            if (!['WD', 'NB'].includes(b.type)) {
                legalCounter++;
                if (legalCounter % 6 === 0) tempOverIndex++;
            }
        });

        if (currentOverBalls.length === 0 && currentOverNum > 0) {
            let prevBalls = [], pOverIdx = currentOverNum - 1;
            legalCounter = 0; tempOverIndex = 0;
            innData.forEach(b => {
                if (tempOverIndex === pOverIdx) prevBalls.push(b);
                if (!['WD', 'NB'].includes(b.type)) { legalCounter++; if (legalCounter % 6 === 0) tempOverIndex++; }
            });
            return prevBalls;
        }
        return currentOverBalls;
    };

    return (
        <div className="scorer-layout">
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                transition: 'filter 0.3s ease',
                filter: (uiState.menu || (match.isDone && showResultModal)) ? 'blur(4px) brightness(0.8)' : 'none'
            }}>
                {/* 1. HERO SCORE */}
                <div className="hero-score">
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>{batTeam}</div>
                    <div className="big-score">{stats.r}<span style={{ color: 'var(--text-muted)', fontSize: '2.5rem' }}>/{stats.w}</span></div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stats.ov} <small>OVS</small></div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                        <div style={{ background: 'var(--glass-input)', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>CRR {((stats.r / (stats.legal / 6 || 1)) || 0).toFixed(2)}</div>
                        {activeInn === 2 && <div style={{ background: 'var(--glass-input)', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700 }}>Target: {target}</div>}
                    </div>

                    {activeInn === 2 && !match.isDone && <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 800 }}>Need {need} runs to win</div>}
                    {match.isDone && !showResultModal && (
                        <div style={{ marginTop: 10, fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 800 }}>{match.result}</div>
                    )}
                </div>

                {/* 2. BALL STRIP */}
                <div style={{ padding: '0 24px 8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', letterSpacing: 1 }}>
                    <span>{getCurrentOverBalls().length === 0 && stats.legal > 0 ? 'Last Over' : 'This Over'}</span>
                    {(deliveryType || isWicket) && <span style={{ color: 'var(--primary)' }}>Adding: {deliveryType || ''}{isWicket ? (deliveryType ? ' + W' : 'WICKET') : ''}</span>}
                </div>

                <div className="ball-strip" ref={scrollRef}>
                    {getCurrentOverBalls().map((b) => {
                        let css = 'ball';
                        if (b.isWicket) css += ' out';
                        else if (b.runs === 4) css += ' four';
                        else if (b.runs === 6) css += ' six';
                        else if (['WD', 'NB'].includes(b.type)) css += ' ' + b.type.toLowerCase();
                        return <div key={b.id} className={css}>{getBallDisplay(b)}</div>
                    })}
                    {getCurrentOverBalls().length === 0 && <div className="ball dots"></div>}
                </div>

                {/* 3. CONTROLS AREA */}
                {match.isDone ? (
                    <div className="keypad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', gap: 12 }}>
                        <button className="key" onClick={() => navigate('/')} style={{ fontSize: '1rem', flexDirection: 'column', gap: 4 }}>
                            <Home size={20} /> <span>Home</span>
                        </button>
                        <button className="key" onClick={() => toggleScorecard(true)} style={{ fontSize: '1rem', flexDirection: 'column', gap: 4 }}>
                            <List size={20} /> <span>Card</span>
                        </button>
                        <button className="key" onClick={() => setShowResultModal(true)} style={{ fontSize: '1rem', flexDirection: 'column', gap: 4, color: 'var(--warning)' }}>
                            <Trophy size={20} /> <span>Result</span>
                        </button>
                    </div>
                ) : isInningsComplete && activeInn === 1 ? (
                    <div className="keypad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <button className="btn-primary" onClick={handleEndInnings} style={{ width: '100%', padding: 20, borderRadius: 20 }}>
                            <Play size={20} fill="currentColor" style={{ marginRight: 10 }} /> Start 2nd Innings
                        </button>
                    </div>
                ) : (
                    <div className="keypad">
                        {[0, 1, 2, 3].map(r => <button key={r} className="key" onClick={() => handleInput(r)}>{r}</button>)}
                        <button className="key val-4" onClick={() => handleInput(4)}>4</button>
                        <button className="key val-6" onClick={() => handleInput(6)}>6</button>
                        <button className={`key ${deliveryType === 'WD' ? 'active' : ''}`} style={{ color: 'var(--text-muted)' }} onClick={() => setDeliveryType(deliveryType === 'WD' ? null : 'WD')}>wd</button>
                        <button className={`key ${deliveryType === 'NB' ? 'active' : ''}`} style={{ color: 'var(--text-muted)' }} onClick={() => setDeliveryType(deliveryType === 'NB' ? null : 'NB')}>nb</button>
                        <button className={`key key-wkt ${isWicket ? 'active' : ''}`} onClick={() => setIsWicket(!isWicket)}>OUT</button>
                        <button className="key key-undo" onClick={handleUndo}><RotateCcw size={18} style={{ marginRight: 5 }} /> Undo</button>
                    </div>
                )}
            </div>

            {toast && <div id="toast"><CheckCircle size={18} /><span>{toast}</span></div>}

            {match.isDone && showResultModal && (
                <div className="modal-overlay" style={{ zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card" style={{ width: '85%', textAlign: 'center', padding: 40, border: '1px solid rgba(255, 214, 10, 0.3)', boxShadow: '0 0 50px rgba(255, 214, 10, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="modal-victory-icon"><Trophy size={40} fill="currentColor" /></div>
                        </div>
                        <h2 className="modal-title" style={{ fontSize: '1.8rem', color: '#FFD60A' }}>Match Finished!</h2>
                        <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.result}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button className="btn btn-primary" onClick={() => navigate('/')}>Back Home</button>
                            <button className="btn btn-ghost" onClick={() => setShowResultModal(false)}><Eye size={18} style={{ marginRight: 8 }} /> View Stats</button>
                        </div>
                    </div>
                </div>
            )}

            {uiState.menu && (
                <div className="modal-overlay" onClick={(e) => e.target.className.includes('overlay') && toggleMenu(false)}>
                    <div className="sheet">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0 }}>Match Options</h2>
                            <button className="btn-icon" onClick={() => toggleMenu(false)}><X size={20} /></button>
                        </div>
                        <div className="input-group">
                            <span className="input-label">Edit Teams</span>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input className="input-field" defaultValue={match.t1} onBlur={(e) => updateMatch({ t1: e.target.value })} placeholder="Team 1" />
                                <input className="input-field" defaultValue={match.t2} onBlur={(e) => updateMatch({ t2: e.target.value })} placeholder="Team 2" />
                            </div>
                        </div>
                        <div className="input-group" style={{ display: 'flex', gap: 10 }}>
                            <div style={{ flex: 1 }}><span className="input-label">Overs</span><input type="number" className="input-field" defaultValue={matchOvers} onBlur={(e) => updateMatch({ ov: parseInt(e.target.value) || 1 })} /></div>
                            <div style={{ flex: 1 }}><span className="input-label">Wickets</span><input type="number" className="input-field" defaultValue={matchWickets} onBlur={(e) => updateMatch({ wkts: parseInt(e.target.value) || 1 })} /></div>
                        </div>
                        <div className="input-group">
                            <span className="input-label">Wide/No Ball Runs</span>
                            <div className="toggle-row" style={{ marginBottom: 0 }}>
                                <button className={`toggle-opt ${(match.extraVal ?? 1) === 0 ? 'active' : ''}`} onClick={() => updateMatch({ extraVal: 0 })}>0 Run</button>
                                <button className={`toggle-opt ${(match.extraVal ?? 1) === 1 ? 'active' : ''}`} onClick={() => updateMatch({ extraVal: 1 })}>1 Run</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                            <button className="btn btn-ghost" onClick={handleUndo} style={{ justifyContent: 'flex-start' }}><RotateCcw size={18} /> Undo Last Ball</button>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm({ title: 'End Innings?', msg: 'Are you sure?', action: handleEndInnings })}>End Innings</button>
                                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setConfirm({ title: 'End Match?', msg: 'Force finish the game?', action: handleForceEnd })}>End Match</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="modal-overlay" style={{ zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ width: '80%', padding: 25, textAlign: 'center' }}>
                        <div style={{ marginBottom: 15, color: 'var(--danger)' }}><AlertTriangle size={40} /></div>
                        <h3 style={{ margin: '0 0 10px 0' }}>{confirm.title}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{confirm.msg}</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirm.action}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {blocker.state === 'blocked' && (
                <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card" style={{ width: '80%', padding: 25, textAlign: 'center', border: '1px solid rgba(255, 69, 58, 0.3)', boxShadow: '0 0 50px rgba(255, 69, 58, 0.1)' }}>
                        <div style={{ marginBottom: 15, color: 'var(--danger)', display: 'flex', justifyContent: 'center' }}><AlertTriangle size={40} /></div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Exit Scorecard?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem', lineHeight: '1.4' }}>Are you sure you want to leave this active match? Your current progress is saved, but you will leave the scorer screen.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-ghost" onClick={() => blocker.reset()}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => blocker.proceed()}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {uiState.scorecard && (
                <div className="modal-overlay" onClick={(e) => e.target.className.includes('overlay') && toggleScorecard(false)}>
                    <div className="sheet" style={{ height: '85vh' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <h2 style={{ margin: 0 }}>Scorecard</h2>
                            <button className="btn-icon" onClick={() => toggleScorecard(false)}><X size={20} /></button>
                        </div>
                        <div className="toggle-row">
                            <button className={`toggle-opt ${scTab === 1 ? 'active' : ''}`} onClick={() => setScTab(1)}>Innings 1</button>
                            <button className={`toggle-opt ${scTab === 2 ? 'active' : ''}`} onClick={() => setScTab(2)}>Innings 2</button>
                        </div>
                        {(() => {
                            const data = scTab === 1 ? match.inn1 : match.inn2;
                            const teamName = scTab === 1 ? (match.battingTeam === match.t1 ? match.t1 : match.t2) : (match.battingTeam === match.t1 ? match.t2 : match.t1);
                            if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Innings not started</div>;
                            const s = getStats(data, match.extraVal ?? 1);
                            let legals = 0, run = 0, blocks = [], curOv = [];
                            data.forEach(b => {
                                curOv.push(b);
                                if (['WD', 'NB'].includes(b.type)) run += (b.runs + (match.extraVal ?? 1));
                                else { run += b.runs; legals++; }
                                if (legals > 0 && legals % 6 === 0 && !['WD', 'NB'].includes(b.type)) {
                                    blocks.push({ balls: [...curOv], runs: run, num: blocks.length + 1 });
                                    curOv = []; run = 0;
                                }
                            });
                            if (curOv.length) blocks.push({ balls: curOv, runs: run, num: blocks.length + 1 });
                            return (
                                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
                                    <div className="match-summary-card">
                                        <div className="summary-team">{teamName}</div>
                                        <div className="summary-score">{s.r}/{s.w}</div>
                                        <div className="summary-overs">{s.ov} Overs</div>
                                    </div>
                                    {blocks.slice().reverse().map((blk, i) => (
                                        <div key={i} className="sc-over-block">
                                            <div className="sc-over-header"><span>OVER {blk.num}</span><span>{blk.runs} runs</span></div>
                                            <div className="sc-ball-row">
                                                {blk.balls.map((b, j) => (
                                                    <div key={j} className={`ball ${b.runs === 4 ? 'four' : b.runs === 6 ? 'six' : b.isWicket ? 'out' : ['WD', 'NB'].includes(b.type) ? 'wd' : ''}`}>
                                                        {getBallDisplay(b)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}