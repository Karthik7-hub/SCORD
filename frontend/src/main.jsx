import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- IMPORT THIS
import App from './App.jsx';
import './index.css';
import { MatchProvider } from './context/MatchContext';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- WRAP EVERYTHING HERE */}
      <MatchProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MatchProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered with scope:', reg.scope))
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}