import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const MatchContext = createContext();

// CONFIG: Change this to your live server URL when deploying
// Tries to load from .env, falls back to localhost if missing
// --- FIX: USE VITE SYNTAX ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
                dataMode: action.payload.mode,
                activeId: action.payload.mode === 'user' ? state.activeId : (state.activeId || null)
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
    const { user } = useAuth();
    const [state, dispatch] = useReducer(reducer, null, init);
    const [uiState, setUiState] = useState({ menu: false, scorecard: false });
    const [syncStatus, setSyncStatus] = useState('online');
    const [pendingQueue, setPendingQueue] = useState(() => {
        const saved = localStorage.getItem('cricket_pro_sync_queue');
        return saved ? JSON.parse(saved) : [];
    });

    // --- EFFECTS ---
    useEffect(() => {
        if (state.activeId) localStorage.setItem('cricket_pro_active_id', state.activeId);
        else localStorage.removeItem('cricket_pro_active_id');
    }, [state.activeId]);

    useEffect(() => {
        if (state.dataMode === 'guest') {
            localStorage.setItem('cricket_pro_db_v2', JSON.stringify({ matches: state.matches }));
        }
    }, [state.matches, state.dataMode]);

    useEffect(() => {
        localStorage.setItem('cricket_pro_sync_queue', JSON.stringify(pendingQueue));
    }, [pendingQueue]);

    // --- SYNC ENGINE ---
    const syncToServer = async (endpoint, method, body) => {
        if (!user) return;
        const request = { id: Date.now(), endpoint, method, body };

        if (syncStatus === 'offline') {
            setPendingQueue(prev => [...prev, request]);
            return;
        }

        try {
            setSyncStatus('syncing');
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error("Server Error");
            setSyncStatus('online');
        } catch (err) {
            console.error("Sync Failed, Queueing...", err);
            setSyncStatus('offline');
            setPendingQueue(prev => [...prev, request]);
        }
    };

    useEffect(() => {
        if (pendingQueue.length === 0) {
            if (syncStatus === 'offline') setSyncStatus('online');
            return;
        }
        const processQueue = async () => {
            const itemToSync = pendingQueue[0];
            try {
                const res = await fetch(`${API_URL}/${itemToSync.endpoint}`, {
                    method: itemToSync.method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                    body: JSON.stringify(itemToSync.body)
                });
                if (!res.ok) throw new Error("Retry Failed");
                setPendingQueue(prev => prev.slice(1));
                setSyncStatus('syncing');
            } catch (err) {
                setSyncStatus('offline');
            }
        };
        const interval = setInterval(processQueue, 3000);
        return () => clearInterval(interval);
    }, [pendingQueue, user, syncStatus]);

    useEffect(() => {
        if (user) {
            fetch(`${API_URL}/matches`, { headers: { 'Authorization': `Bearer ${user.token}` } })
                .then(res => res.json())
                .then(data => dispatch({ type: 'SET_DATA', payload: { matches: data, mode: 'user' } }))
                .catch(() => setSyncStatus('offline'));
        } else {
            const saved = localStorage.getItem('cricket_pro_db_v2');
            const parsed = saved ? JSON.parse(saved) : { matches: [] };
            dispatch({ type: 'SET_DATA', payload: { matches: parsed.matches || [], mode: 'guest' } });
        }
    }, [user]);

    // --- ACTIONS ---

    const createMatch = (d) => {
        // Prepare match object with defaults + Toss Result
        const newMatch = {
            ...d,
            inn1: d.inn1 || [],
            inn2: d.inn2 || [],
            activeInn: d.activeInn || 1,
            isDone: false,
            result: "",
            tossResult: d.tossResult || "" // <--- NEW: Ensures tossResult is stored
        };

        dispatch({ type: 'CREATE_MATCH', payload: newMatch });
        syncToServer('matches', 'POST', newMatch);
    };

    const deleteMatch = (id) => {
        dispatch({ type: 'DELETE_MATCH', payload: id });
        syncToServer(`matches/${id}`, 'DELETE');
    };

    const updateMatch = (d) => {
        dispatch({ type: 'UPDATE_MATCH', payload: d });
        syncToServer(`matches/${state.activeId}`, 'PATCH', d);
    };

    const addBall = (r, t, w) => {
        const ball = { id: Date.now(), runs: r, type: t || 'LEGAL', isWicket: !!w };
        dispatch({ type: 'ADD_BALL', payload: ball });
        const currentMatch = state.matches.find(m => m.id === state.activeId);
        if (user && currentMatch) {
            const innKey = currentMatch.activeInn === 1 ? 'inn1' : 'inn2';
            const updatedInnings = [...(currentMatch[innKey] || []), ball];
            syncToServer(`matches/${state.activeId}`, 'PATCH', { [innKey]: updatedInnings });
        }
    };

    const undo = () => {
        const m = state.matches.find(m => m.id === state.activeId);
        dispatch({ type: 'UNDO' });
        if (user && m) {
            const key = m.activeInn === 1 ? 'inn1' : 'inn2';
            const currentArr = m[key] || [];
            if (m.activeInn === 2 && currentArr.length === 0) {
                syncToServer(`matches/${state.activeId}`, 'PATCH', { activeInn: 1, isDone: false, result: null });
                return;
            }
            if (currentArr.length === 0) {
                syncToServer(`matches/${state.activeId}`, 'PATCH', { isDone: false, result: null });
                return;
            }
            const updatedInnings = currentArr.slice(0, -1);
            syncToServer(`matches/${state.activeId}`, 'PATCH', { [key]: updatedInnings, isDone: false, result: null });
        }
    };

    const endInnings = () => {
        dispatch({ type: 'END_INN' });
        syncToServer(`matches/${state.activeId}`, 'PATCH', { activeInn: 2 });
    };

    const endMatch = (res) => {
        dispatch({ type: 'FINISH', payload: res });
        syncToServer(`matches/${state.activeId}`, 'PATCH', { isDone: true, result: res });
    };

    const wipeData = () => {
        dispatch({ type: 'WIPE_DATA' });
        localStorage.removeItem('cricket_pro_db_v2');
        localStorage.removeItem('cricket_pro_active_id');
        localStorage.removeItem('cricket_pro_sync_queue');
        setPendingQueue([]);
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
            syncState: { status: syncStatus, pendingCount: pendingQueue.length },
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
            wipeData
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => useContext(MatchContext);