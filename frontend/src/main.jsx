import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { MatchProvider } from './context/MatchContext';
import { ThemeProvider } from './context/ThemeContext';

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MatchProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </MatchProvider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered with scope:', reg.scope))
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}