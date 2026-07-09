import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const MatchContext = createContext();

// --- 1. INITIALIZER ---
const init = () => {
    const savedActiveId = localStorage.getItem('cricket_pro_active_id');
    let initialMatches = [];
    try {
        const saved = localStorage.getItem('cricket_pro_db_v2');
        const parsed = saved ? JSON.parse(saved) : { matches: [] };
        initialMatches = parsed.matches || [];
    } catch {
        initialMatches = [];
    }
    return {
        matches: initialMatches,
        activeId: savedActiveId ? parseInt(savedActiveId) : null,
        dataMode: 'guest'
    };
};

// --- 2. REDUCER ---
const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_DATA':
            return {
                ...state,
                matches: action.payload.matches,
                dataMode: 'guest',
                activeId: action.payload.activeId !== undefined ? action.payload.activeId : state.activeId
            };

        case 'WIPE_DATA':
            return { matches: [], activeId: null, dataMode: 'guest' };

        case 'CREATE_MATCH':
            return { ...state, matches: [action.payload, ...state.matches], activeId: action.payload.id };

        case 'SET_ACTIVE':
            return { ...state, activeId: action.payload };

        case 'DELETE_MATCH':
            return {
                ...state,
                matches: state.matches.filter(m => m.id !== action.payload),
                activeId: state.activeId === action.payload ? null : state.activeId
            };

        case 'UPDATE_MATCH':
            return {
                ...state,
                matches: state.matches.map(m => m.id === state.activeId ? { ...m, ...action.payload } : m)
            };

        case 'ADD_BALL':
            return {
                ...state,
                matches: state.matches.map(m => {
                    if (m.id !== state.activeId) return m;
                    const key = m.activeInn === 1 ? 'inn1' : 'inn2';
                    return { ...m, [key]: [...(m[key] || []), action.payload] };
                })
            };

        case 'UNDO':
            return {
                ...state,
                matches: state.matches.map(m => {
                    if (m.id !== state.activeId) return m;
                    let modMatch = { ...m, isDone: false, result: null };
                    const key = m.activeInn === 1 ? 'inn1' : 'inn2';
                    const arr = m[key] || [];

                    if (m.activeInn === 2 && arr.length === 0) {
                        return { ...modMatch, activeInn: 1 };
                    }
                    if (arr.length === 0) return modMatch;
                    return { ...modMatch, [key]: arr.slice(0, -1) };
                })
            };

        case 'END_INN':
            return { ...state, matches: state.matches.map(m => m.id === state.activeId ? { ...m, activeInn: 2 } : m) };

        case 'FINISH':
            return { ...state, matches: state.matches.map(m => m.id === state.activeId ? { ...m, isDone: true, result: action.payload } : m) };

        default: return state;
    }
};

// --- 3. PROVIDER ---
export const MatchProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, null, init);
    const [uiState, setUiState] = useState({ menu: false, scorecard: false });

    // --- EFFECTS ---
    useEffect(() => {
        if (state && state.activeId) localStorage.setItem('cricket_pro_active_id', state.activeId);
        else localStorage.removeItem('cricket_pro_active_id');
    }, [state?.activeId]);

    useEffect(() => {
        if (state) {
            localStorage.setItem('cricket_pro_db_v2', JSON.stringify({ matches: state.matches }));
        }
    }, [state?.matches]);

    // --- HELPER UTILITIES ---
    const getLocalDbSize = () => {
        let totalBytes = 0;
        const keys = ['cricket_pro_db_v2', 'cricket_pro_active_id'];
        keys.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                totalBytes += val.length * 2;
            }
        });
        if (totalBytes === 0) return '0 KB';
        if (totalBytes < 1024) return `${totalBytes} B`;
        if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(2)} KB`;
        return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const exportBackup = () => {
        const matchesData = localStorage.getItem('cricket_pro_db_v2') || '{"matches":[]}';
        const activeId = localStorage.getItem('cricket_pro_active_id') || 'null';
        const backupData = {
            version: 'scord-backup-v1',
            timestamp: new Date().toISOString(),
            matches: JSON.parse(matchesData).matches || [],
            activeId: activeId !== 'null' ? parseInt(activeId) : null
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scord-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const checkBackupFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || !Array.isArray(data.matches)) {
                        throw new Error("Invalid backup format: 'matches' must be an array.");
                    }
                    const localData = JSON.parse(localStorage.getItem('cricket_pro_db_v2') || '{"matches":[]}');
                    const localMatches = localData.matches || [];
                    const localIds = new Set(localMatches.map(m => m.id));
                    
                    let conflictsCount = 0;
                    data.matches.forEach(m => {
                        if (localIds.has(m.id)) {
                            conflictsCount++;
                        }
                    });
                    
                    resolve({
                        valid: true,
                        matchesCount: data.matches.length,
                        conflictsCount,
                        newCount: data.matches.length - conflictsCount,
                        data
                    });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("File reading failed."));
            reader.readAsText(file);
        });
    };

    const importBackup = (file, strategy = 'merge') => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || !Array.isArray(data.matches)) {
                        throw new Error("Invalid backup format: 'matches' must be an array.");
                    }
                    
                    const localData = JSON.parse(localStorage.getItem('cricket_pro_db_v2') || '{"matches":[]}');
                    const localMatches = localData.matches || [];
                    
                    let finalMatches = [];
                    let stats = { added: 0, updated: 0, replaced: 0 };
                    
                    if (strategy === 'replace') {
                        finalMatches = data.matches;
                        stats.replaced = data.matches.length;
                    } else {
                        // Merge strategy
                        const localMap = new Map(localMatches.map(m => [m.id, m]));
                        data.matches.forEach(importedMatch => {
                            if (localMap.has(importedMatch.id)) {
                                localMap.set(importedMatch.id, importedMatch);
                                stats.updated++;
                            } else {
                                localMap.set(importedMatch.id, importedMatch);
                                stats.added++;
                            }
                        });
                        finalMatches = Array.from(localMap.values());
                    }
                    
                    finalMatches.sort((a, b) => b.id - a.id);
                    localStorage.setItem('cricket_pro_db_v2', JSON.stringify({ matches: finalMatches }));
                    
                    const activeId = strategy === 'replace' ? data.activeId : (localStorage.getItem('cricket_pro_active_id') || data.activeId);
                    if (activeId) {
                        localStorage.setItem('cricket_pro_active_id', activeId.toString());
                    } else {
                        localStorage.removeItem('cricket_pro_active_id');
                    }
                    
                    dispatch({
                        type: 'SET_DATA',
                        payload: {
                            matches: finalMatches,
                            activeId: activeId ? parseInt(activeId) : null
                        }
                    });
                    
                    resolve({ success: true, stats, total: finalMatches.length });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("File reading failed."));
            reader.readAsText(file);
        });
    };

    // --- ACTIONS ---

    const createMatch = (d) => {
        const newMatch = {
            ...d,
            inn1: d.inn1 || [],
            inn2: d.inn2 || [],
            activeInn: d.activeInn || 1,
            isDone: false,
            result: "",
            tossResult: d.tossResult || ""
        };
        dispatch({ type: 'CREATE_MATCH', payload: newMatch });
    };

    const deleteMatch = (id) => {
        dispatch({ type: 'DELETE_MATCH', payload: id });
    };

    const updateMatch = (d) => {
        dispatch({ type: 'UPDATE_MATCH', payload: d });
    };

    const addBall = (r, t, w) => {
        const ball = { id: Date.now(), runs: r, type: t || 'LEGAL', isWicket: !!w };
        dispatch({ type: 'ADD_BALL', payload: ball });
    };

    const undo = () => {
        dispatch({ type: 'UNDO' });
    };

    const endInnings = () => {
        dispatch({ type: 'END_INN' });
    };

    const endMatch = (res) => {
        dispatch({ type: 'FINISH', payload: res });
    };

    const wipeData = () => {
        dispatch({ type: 'WIPE_DATA' });
        localStorage.removeItem('cricket_pro_db_v2');
        localStorage.removeItem('cricket_pro_active_id');
    };

    const getStats = (balls, extraVal) => {
        const ev = extraVal !== undefined ? extraVal : 1;
        if (!balls) return { r: 0, w: 0, legal: 0, ov: '0.0' };
        let r = 0, w = 0, legal = 0;
        balls.forEach(b => {
            if (['WD', 'NB'].includes(b.type)) { r += (b.runs + ev); }
            else { r += b.runs; legal++; }
            if (b.isWicket) w++;
        });
        return { r, w, legal, ov: `${Math.floor(legal / 6)}.${legal % 6}` };
    };

    const toggleMenu = (val) => setUiState(prev => ({ ...prev, menu: val !== undefined ? val : !prev.menu }));
    const toggleScorecard = (val) => setUiState(prev => ({ ...prev, scorecard: val !== undefined ? val : !prev.scorecard }));

    const activeMatch = state.matches.find(m => m.id === state.activeId) || null;

    return (
        <MatchContext.Provider value={{
            state,
            match: activeMatch,
            uiState,
            toggleMenu,
            toggleScorecard,
            createMatch,
            setActive: (id) => dispatch({ type: 'SET_ACTIVE', payload: id }),
            deleteMatch,
            addBall,
            undo,
            updateMatch,
            endInnings,
            endMatch,
            getStats,
            wipeData,
            getLocalDbSize,
            exportBackup,
            importBackup,
            checkBackupFile
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => useContext(MatchContext);