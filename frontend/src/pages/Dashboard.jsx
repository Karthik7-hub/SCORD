import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { Plus, ArrowLeft, RefreshCw, Trophy, Trash2, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { state, createMatch, setActive, deleteMatch, getStats } = useMatch();

    const [step, setStep] = useState(0);
    const [filter, setFilter] = useState('live');
    const [form, setForm] = useState({ t1: '', t2: '', ov: 10, wk: 10, extraVal: 1 });
    const [toss, setToss] = useState({ winner: 't1', choice: 'bat' });
    const [coinRot, setCoinRot] = useState(0);

    // NEW: State for the Custom Delete Modal
    const [deleteModal, setDeleteModal] = useState(null); // Stores the ID to delete

    // --- HANDLERS ---
    const handleFlip = () => {
        const isHeads = Math.random() < 0.5;
        const spins = 1800;
        let nextRot = coinRot + spins;
        const currentMod = nextRot % 360;
        if (isHeads) nextRot = nextRot - currentMod;
        else nextRot = nextRot - currentMod + 180;
        setCoinRot(nextRot);
    };

    const handleStart = () => {
        const finalT1 = form.t1.trim() || "Team A";
        const finalT2 = form.t2.trim() || "Team B";
        const batFirst = toss.winner === 't1'
            ? (toss.choice === 'bat' ? finalT1 : finalT2)
            : (toss.choice === 'bat' ? finalT2 : finalT1);

        const tossWinnerName = toss.winner === 't1' ? finalT1 : finalT2;
        const tossAction = toss.choice === 'bat' ? 'bat' : 'bowl';
        const tossResultText = `${tossWinnerName} elected to ${tossAction}`;

        createMatch({
            id: Date.now(), ...form, t1: finalT1, t2: finalT2,
            inn1: [], inn2: [], activeInn: 1,
            battingTeam: batFirst, bowlingTeam: batFirst === finalT1 ? finalT2 : finalT1,
            isDone: false,
            tossResult: tossResultText,
            createdAt: new Date().toISOString()
        });
        setStep(0);
        navigate('/scorer');
    };

    // 1. TRIGGER MODAL INSTEAD OF WINDOW.CONFIRM
    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setDeleteModal(id);
    };

    // 2. ACTUAL DELETE ACTION
    const performDelete = () => {
        if (deleteModal) {
            deleteMatch(deleteModal);
            setDeleteModal(null);
        }
    };

    // --- WIZARD: STEP 1 (DETAILS) ---
    if (step === 1) return (
        <div className="wizard-container">
            <div className="wizard-header">
                <button className="btn-icon" onClick={() => setStep(0)}><ArrowLeft size={22} /></button>
                <h2 className="wizard-title">Match Details</h2>
            </div>

            {/* Team Names */}
            <div className="input-group">
                <span className="input-label">Teams</span>
                <input className="input-field" placeholder="Team A" value={form.t1} onChange={e => setForm({ ...form, t1: e.target.value })} style={{ marginBottom: 12 }} />
                <input className="input-field" placeholder="Team B" value={form.t2} onChange={e => setForm({ ...form, t2: e.target.value })} />
            </div>

            {/* Overs & Wickets */}
            <div className="input-group" style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <span className="input-label">Overs</span>
                    <input type="number" className="input-field" value={form.ov} onChange={e => setForm({ ...form, ov: parseInt(e.target.value) || 1 })} />
                </div>
                <div style={{ flex: 1 }}>
                    <span className="input-label">Wickets</span>
                    <input type="number" className="input-field" value={form.wk} onChange={e => setForm({ ...form, wk: parseInt(e.target.value) || 1 })} />
                </div>
            </div>

            {/* --- THIS IS THE EXTRAS TOGGLE --- */}
            <div className="input-group">
                <span className="input-label">Wide/No Ball Runs</span>
                <div className="toggle-row">
                    <button
                        className={`toggle-opt ${form.extraVal === 0 ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, extraVal: 0 })}
                    >
                        0 Run
                    </button>
                    <button
                        className={`toggle-opt ${form.extraVal === 1 ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, extraVal: 1 })}
                    >
                        1 Run
                    </button>
                </div>
            </div>

            <button className="btn btn-primary" onClick={() => setStep(2)}>Next &gt; Toss</button>
        </div>
    );

    // --- WIZARD: STEP 2 ---
    if (step === 2) return (
        <div className="wizard-container">
            <div className="wizard-header">
                <button className="btn-icon" onClick={() => setStep(1)}><ArrowLeft size={22} /></button>
                <h2 className="wizard-title">Toss</h2>
            </div>
            <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div id="coinContainer">
                    <div id="coin" style={{ transform: `rotateX(${coinRot}deg)` }}>
                        <div className="coin-face heads">HEADS</div>
                        <div className="coin-face tails">TAILS</div>
                    </div>
                </div>
                <button className="btn-ghost" onClick={handleFlip} style={{ width: 'auto', padding: '10px 24px', borderRadius: 20, background: 'var(--glass-card)', border: '1px solid var(--glass-border)' }}>
                    <RefreshCw size={18} style={{ marginRight: 8 }} /> Flip Coin
                </button>
            </div>
            <div className="glass-card" style={{ marginTop: 20 }}>
                <div className="input-group">
                    <span className="input-label">Who Won Toss?</span>
                    <div className="toggle-row">
                        <button className={`toggle-opt ${toss.winner === 't1' ? 'active' : ''}`} onClick={() => setToss({ ...toss, winner: 't1' })}>{form.t1 || 'Team A'}</button>
                        <button className={`toggle-opt ${toss.winner === 't2' ? 'active' : ''}`} onClick={() => setToss({ ...toss, winner: 't2' })}>{form.t2 || 'Team B'}</button>
                    </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <span className="input-label">Decision</span>
                    <div className="toggle-row" style={{ marginBottom: 0 }}>
                        <button className={`toggle-opt ${toss.choice === 'bat' ? 'active' : ''}`} onClick={() => setToss({ ...toss, choice: 'bat' })}>Bat First</button>
                        <button className={`toggle-opt ${toss.choice === 'bowl' ? 'active' : ''}`} onClick={() => setToss({ ...toss, choice: 'bowl' })}>Bowl First</button>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary" onClick={handleStart} style={{ marginTop: 20 }}>Start Match</button>
        </div>
    );

    // --- DASHBOARD LIST ---
    const filteredMatches = (state.matches || []).filter(m => {
        if (filter === 'live') return !m.isDone;
        if (filter === 'finished') return m.isDone;
        return true;
    }).slice().reverse();

    return (
        <div className="scroll-area">

            <div style={{ marginBottom: 20 }}>
                <div className="toggle-row" style={{ marginBottom: 0 }}>
                    <button className={`toggle-opt ${filter === 'live' ? 'active' : ''}`} onClick={() => setFilter('live')}>Live</button>
                    <button className={`toggle-opt ${filter === 'finished' ? 'active' : ''}`} onClick={() => setFilter('finished')}>History</button>
                </div>
            </div>

            {filteredMatches.length > 0 ? (
                filteredMatches.map(m => {
                    const s1 = getStats(m.inn1, m.extraVal);
                    const s2 = getStats(m.inn2, m.extraVal);
                    const team1Score = m.battingTeam === m.t1 ? s1 : s2;
                    const team2Score = m.battingTeam === m.t1 ? s2 : s1;

                    return (
                        <div key={m.id} className="glass-card" onClick={() => { setActive(m.id); navigate('/scorer'); }} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: m.isDone ? 'var(--bg-input)' : 'rgba(16, 185, 129, 0.2)', color: m.isDone ? 'var(--text-muted)' : 'var(--success)' }}>
                                    {m.isDone ? 'FINISHED' : 'LIVE'}
                                </span>
                                <button className="btn-icon" style={{ width: 36, height: 36, background: 'rgba(255, 69, 58, 0.1)', color: 'var(--danger)' }} onClick={(e) => confirmDelete(e, m.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>{m.t1}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{team1Score.r}/{team1Score.w}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{team1Score.ov} ov</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, opacity: 0.3 }}>VS</div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>{m.t2}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{team2Score.r}/{team2Score.w}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{team2Score.ov} ov</div>
                                </div>
                            </div>

                            <div className="card-footer">
                                {m.tossResult && <div className="toss-badge">{m.tossResult}</div>}
                                {m.isDone && m.result && (
                                    <div className="result-badge">
                                        <Trophy size={14} fill="currentColor" /><span>{m.result}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Trophy size={48} style={{ opacity: 0.2, marginBottom: 15 }} />
                    <h3 style={{ margin: 0 }}>No Matches</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Tap + to start a new match</p>
                </div>
            )}

            <button className="fab-btn" onClick={() => setStep(1)}><Plus size={32} /></button>

            {/* --- NEW: CUSTOM DELETE MODAL --- */}
            {deleteModal && (
                <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ width: '85%', padding: 30, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="modal-danger-icon">
                                <AlertTriangle size={32} />
                            </div>
                        </div>

                        <h3 className="modal-title">Delete Match?</h3>
                        <p className="modal-desc">This action cannot be undone. All scores and stats will be lost.</p>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={performDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}