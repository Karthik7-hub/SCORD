import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// --- COMPONENTS ---
import Navbar from './components/Navbar';

// --- PAGES ---
import Dashboard from './pages/Dashboard';
import Scorer from './pages/Scorer';
import BackupManager from './pages/BackupManager';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isBootstrapped = useRef(false);

  useEffect(() => {
    if (isBootstrapped.current) return;
    isBootstrapped.current = true;

    const isRoot = location.pathname === '/';
    const state = window.history.state;
    const isDirectLaunch = !state || state.idx === 0 || (state.usr && state.usr.idx === 0);

    if (!isRoot && isDirectLaunch) {
      const subRoute = location.pathname + location.search;
      navigate('/', { replace: true });
      navigate(subRoute);
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="app-shell">

      {/* 1. NAVBAR (Fixed at Top) */}
      <Navbar />

      {/* 2. CONTENT AREA (Grows to fill space) */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scorer" element={<Scorer />} />
        <Route path="/data" element={<BackupManager />} />
        <Route path="/login" element={<Navigate to="/data" replace />} />

        {/* Fallback route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>

    </div>
  );
}