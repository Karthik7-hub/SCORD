import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import {
    Database, Download, Upload, Trash2, ChevronLeft,
    CheckCircle2, AlertTriangle, RefreshCw, Layers
} from 'lucide-react';

export default function BackupManager() {
    const navigate = useNavigate();
    const {
        state,
        getLocalDbSize,
        exportBackup,
        importBackup,
        checkBackupFile,
        wipeData
    } = useMatch();

    const [dbSize, setDbSize] = useState('0 KB');
    const [selectedFile, setSelectedFile] = useState(null);
    const [importStats, setImportStats] = useState(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Calculate DB Size
    const updateDbSize = () => {
        if (getLocalDbSize) {
            setDbSize(getLocalDbSize());
        }
    };

    useEffect(() => {
        updateDbSize();
    }, [state?.matches, getLocalDbSize]);

    // Calculate stats
    const totalMatches = state?.matches?.length || 0;
    const liveMatches = state?.matches?.filter(m => !m.isDone)?.length || 0;
    const completedMatches = state?.matches?.filter(m => m.isDone)?.length || 0;

    // Handle File Selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setStatusMessage(null);

        checkBackupFile(file)
            .then(stats => {
                setImportStats(stats);
                setShowConflictModal(true);
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: `Invalid backup file: ${err.message}` });
                setSelectedFile(null);
            });

        // Reset file input value so same file can be imported again if needed
        e.target.value = '';
    };

    // Run import strategy
    const runImport = (strategy) => {
        if (!selectedFile) return;

        importBackup(selectedFile, strategy)
            .then(result => {
                setShowConflictModal(false);
                updateDbSize();
                let msg = '';
                if (strategy === 'replace') {
                    msg = `Successfully replaced database with ${result.total} matches from backup.`;
                } else {
                    msg = `Import completed! Added ${result.stats.added} new matches and updated ${result.stats.updated} duplicates. (Total: ${result.total} matches)`;
                }
                setStatusMessage({ type: 'success', text: msg });
                setSelectedFile(null);
                setImportStats(null);
            })
            .catch(err => {
                setShowConflictModal(false);
                setStatusMessage({ type: 'error', text: `Failed to import backup: ${err.message}` });
                setSelectedFile(null);
                setImportStats(null);
            });
    };

    const handleClearDb = () => {
        if (window.confirm("WARNING: This will permanently delete all local matches and settings. This cannot be undone! Are you sure?")) {
            wipeData();
            updateDbSize();
            setStatusMessage({ type: 'success', text: "Local database wiped successfully." });
        }
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: 'var(--app-bg)',
            padding: '24px',
            paddingTop: '80px', // Below glass navbar
            boxSizing: 'border-box',
            width: '100%',
            height: '100%'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
                <button className="nav-btn" onClick={() => {
                    if (window.history.state && window.history.state.idx > 0) {
                        navigate(-1);
                    } else {
                        navigate('/', { replace: true });
                    }
                }} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Storage & Backups</h1>
            </div>

            {/* Status Notifications */}
            {statusMessage && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    border: '1px solid',
                    fontSize: '0.9rem',
                    background: statusMessage.type === 'success' ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                    borderColor: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            {/* Statistics Section */}
            <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 700 }}>Database Health</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ background: 'var(--glass-card)', backdropFilter: 'var(--glass-frosted)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage Used</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{dbSize}</strong>
                </div>
                <div style={{ background: 'var(--glass-card)', backdropFilter: 'var(--glass-frosted)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Matches</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{totalMatches}</strong>
                </div>
                <div style={{ background: 'var(--glass-card)', backdropFilter: 'var(--glass-frosted)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active (Live)</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>{liveMatches}</strong>
                </div>
                <div style={{ background: 'var(--glass-card)', backdropFilter: 'var(--glass-frosted)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{completedMatches}</strong>
                </div>
            </div>

            {/* Operations cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                
                {/* Export Card */}
                <div style={{
                    background: 'var(--glass-card)',
                    backdropFilter: 'var(--glass-frosted)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'rgba(10, 132, 255, 0.1)', borderRadius: '14px', color: 'var(--primary)' }}>
                            <Download size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Export Local Backup</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Download your database as a portable JSON file.</p>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Exports all scored matches, balls, run details, and teams currently stored on this device. You can import this file later on any browser or phone to restore your scoring logs instantly.
                    </span>
                    <button className="btn btn-primary" onClick={exportBackup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '48px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 600 }}>
                        <Download size={18} />
                        <span>Export Backup File</span>
                    </button>
                </div>

                {/* Import Card */}
                <div style={{
                    background: 'var(--glass-card)',
                    backdropFilter: 'var(--glass-frosted)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'rgba(48, 209, 88, 0.1)', borderRadius: '14px', color: 'var(--success)' }}>
                            <Upload size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Import Backup</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Restore matches from a JSON backup file.</p>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Upload a `.json` backup file. The app will inspect the matches and let you choose between merging files or replacing the current database completely.
                    </span>
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '48px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', margin: 0, boxSizing: 'border-box' }}>
                        <Upload size={18} />
                        <span>Select Backup File</span>
                        <input type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Clear Database Card */}
                <div style={{
                    background: 'var(--glass-card)',
                    backdropFilter: 'var(--glass-frosted)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255, 69, 58, 0.1)', borderRadius: '14px', color: 'var(--danger)' }}>
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Destructive Actions</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Wipe local data permanently.</p>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Wipes all matches and scoring logs from this browser storage. Make sure you have exported a backup file first if you wish to keep your records!
                    </span>
                    <button className="btn btn-danger" onClick={handleClearDb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '48px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 600 }}>
                        <Trash2 size={18} />
                        <span>Clear All Local Data</span>
                    </button>
                </div>
            </div>

            {/* Overrides Conflict Modal */}
            {showConflictModal && importStats && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        background: 'rgba(30, 30, 32, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '28px',
                        padding: '28px',
                        maxWidth: '450px',
                        width: '100%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        animation: 'scaleUp 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                            <div style={{ color: 'var(--warning)', display: 'flex' }}><AlertTriangle size={24} /></div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Import Strategy</h3>
                        </div>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                            We inspected the backup file and found conflicts with your current data. Choose how Scord should proceed:
                        </p>

                        {/* File details stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Matches in Backup:</span>
                                <strong style={{ color: '#fff' }}>{importStats.matchesCount}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>New matches to add:</span>
                                <strong style={{ color: 'var(--success)' }}>+{importStats.newCount}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Conflicting duplicates:</span>
                                <strong style={{ color: 'var(--warning)' }}>{importStats.conflictsCount}</strong>
                            </div>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                            
                            {/* Merge Option */}
                            <button onClick={() => runImport('merge')} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(10, 132, 255, 0.1)',
                                border: '1px solid var(--primary)',
                                borderRadius: '18px',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ color: 'var(--primary)', display: 'flex' }}><Layers size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>Merge & Update (Recommended)</strong>
                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        Keep current matches, add new ones, and overwrite duplicates with import details.
                                    </span>
                                </div>
                            </button>

                            {/* Replace Option */}
                            <button onClick={() => runImport('replace')} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '18px',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ color: 'var(--danger)', display: 'flex' }}><RefreshCw size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>Replace Entire Database</strong>
                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        Wipe current database and set it exactly to the backup matches.
                                    </span>
                                </div>
                            </button>

                        </div>

                        {/* Cancel Button */}
                        <button onClick={() => { setShowConflictModal(false); setSelectedFile(null); }} style={{
                            marginTop: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            padding: '12px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease'
                        }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
