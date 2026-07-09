import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isBootstrapping, setIsBootstrapping] = useState(() => {
        const isRoot = window.location.pathname === '/';
        const state = window.history.state;
        const isDirectLaunch = !state || state.idx === 0 || (state.usr && state.usr.idx === 0);
        return !isRoot && isDirectLaunch;
    });
    const isBootstrapped = useRef(false);

    // Bootstrap deep links to prepend Home "/" behind sub-routes
    useEffect(() => {
        if (isBootstrapped.current) return;
        isBootstrapped.current = true;

        const isRoot = location.pathname === '/';
        const state = window.history.state;
        
        // React Router v7 indexes its history stack in window.history.state.idx
        const isDirectLaunch = !state || state.idx === 0 || (state.usr && state.usr.idx === 0);

        if (!isRoot && isDirectLaunch) {
            const targetPath = location.pathname + location.search;
            
            // Set global and local bootstrapping flags
            window.__scord_bootstrapping = true;

            // Replace history state index 0 with Home, then push the target sub-route
            navigate('/', { replace: true });
            
            // Queue the forward push
            setTimeout(() => {
                navigate(targetPath);
                
                // Allow the router to settle before clearing the bootstrapping splash
                setTimeout(() => {
                    window.__scord_bootstrapping = false;
                    setIsBootstrapping(false);
                }, 50);
            }, 0);
        }
    }, [location.pathname, location.search, navigate]);

    const goBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    };

    const push = (path, options = {}) => {
        navigate(path, options);
    };

    const replace = (path, options = {}) => {
        navigate(path, { ...options, replace: true });
    };

    const goHome = () => {
        navigate('/', { replace: true });
    };

    const canGoBack = () => {
        return !!(window.history.state && window.history.state.idx > 0);
    };

    return (
        <NavigationContext.Provider value={{
            isBootstrapping,
            goBack,
            push,
            replace,
            goHome,
            canGoBack
        }}>
            {isBootstrapping ? (
                /* Glassmorphic Splash Screen to prevent Home screen flicker during history prepend */
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'var(--app-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    <div className="app-shell" style={{ height: 'auto', background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <svg width="60" height="60" viewBox="0 0 512 512" fill="none" style={{ marginBottom: 20, animation: 'pulse 1.5s infinite ease-in-out' }}>
                            <rect width="512" height="512" rx="120" fill="#3B82F6" />
                            <path d="M 316 136 C 226 136, 196 196, 256 256 C 316 316, 286 376, 196 376"
                                stroke="white" strokeWidth="60" strokeLinecap="round" />
                        </svg>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '2px' }}>SCORD</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Restoring match session...</p>
                    </div>
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(0.95); opacity: 0.8; }
                        }
                    `}</style>
                </div>
            ) : (
                children
            )}
        </NavigationContext.Provider>
    );
};

export const useAppNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useAppNavigation must be used within a NavigationProvider');
    }
    return context;
};
