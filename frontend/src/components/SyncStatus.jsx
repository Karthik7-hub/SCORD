import React from 'react';
import { useMatch } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext'; // Import Auth to check Guest status
import { Wifi, WifiOff, Save, RefreshCw, CloudOff } from 'lucide-react';

const SyncStatus = () => {
    const { syncState } = useMatch(); // { status: 'online'|'offline'|'syncing' }
    const { user } = useAuth();       // Check if logged in

    // --- 1. GUEST MODE (Not Logged In) ---
    if (!user) {
        return (
            <div className="sync-badge guest">
                <Save size={14} />
                <span className="sync-text">Guest Mode</span>
                <style>{`
                    .sync-badge.guest {
                        display: flex; align-items: center; gap: 6px;
                        padding: 6px 12px; borderRadius: 20px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: var(--text-muted);
                        font-size: 0.75rem; font-weight: 700;
                    }
                    /* Mobile: Show dot only (Grey) */
                    @media (max-width: 480px) {
                        .sync-badge.guest .sync-text { display: none; }
                        .sync-badge.guest { padding: 8px; border-radius: 50%; width: 32px; height: 32px; justify-content: center; }
                    }
                `}</style>
            </div>
        );
    }

    // --- 2. LOGGED IN MODES ---
    let color = 'var(--success)';
    let icon = <Wifi size={14} />;
    let text = "Synced";
    let bg = "rgba(16, 185, 129, 0.1)"; // Green Tint
    let border = "rgba(16, 185, 129, 0.3)";

    if (syncState.status === 'syncing') {
        color = 'var(--warning)';
        icon = <RefreshCw size={14} className="spin" />;
        text = "Syncing...";
        bg = "rgba(255, 214, 10, 0.1)";
        border = "rgba(255, 214, 10, 0.3)";
    } else if (syncState.status === 'offline') {
        color = 'var(--danger)';
        icon = <WifiOff size={14} />; // Changed to WiFi Off
        text = "Offline";
        bg = "rgba(255, 69, 58, 0.1)";
        border = "rgba(255, 69, 58, 0.3)";
    }

    return (
        <div className="sync-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: bg,
            border: `1px solid ${border}`,
            color: color,
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
        }}>
            {icon}
            <span className="sync-text">{text}</span>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                /* Mobile Compact View */
                @media (max-width: 480px) {
                    .sync-badge .sync-text { display: none; }
                    .sync-badge { 
                        padding: 0 !important; 
                        width: 32px; height: 32px; 
                        border-radius: 50% !important; 
                        justify-content: center; 
                    }
                }
            `}</style>
        </div>
    );
};

export default SyncStatus;