import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- IMPORT THIS
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- WRAP EVERYTHING HERE */}
      <AuthProvider>
        <MatchProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </MatchProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);