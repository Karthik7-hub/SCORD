import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';

// --- COMPONENTS ---
import Navbar from './components/Navbar';

// --- PAGES ---
import Dashboard from './pages/Dashboard';
import Scorer from './pages/Scorer';
import BackupManager from './pages/BackupManager';

export default function App() {
  return (
    <NavigationProvider>
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
    </NavigationProvider>
  );
}