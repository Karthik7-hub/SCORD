import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- CONTEXT PROVIDERS ---
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MatchProvider } from './context/MatchContext';

// --- COMPONENTS ---
import Navbar from './components/Navbar';

// --- PAGES ---
import Dashboard from './pages/Dashboard';
import Scorer from './pages/Scorer';
import Login from './pages/Login'; // See code below if you don't have this

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MatchProvider>

          {/* THE MAIN CONTAINER (Handles the Flex Layout) */}
          <div className="app-shell">

            {/* 1. NAVBAR (Fixed at Top) */}
            <Navbar />

            {/* 2. CONTENT AREA (Grows to fill space) */}
            {/* The pages (Dashboard/Scorer) have 'flex: 1' to fill the remaining height */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scorer" element={<Scorer />} />
              <Route path="/login" element={<Login />} />

              {/* Fallback route */}
              <Route path="*" element={<Dashboard />} />
            </Routes>

          </div>

        </MatchProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}