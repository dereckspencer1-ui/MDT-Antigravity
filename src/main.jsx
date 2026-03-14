import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { initDB } from './store/mockDB';

// Optional Reset for testing Genesis Mode
if (window.location.search.includes('reset')) {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
}

// Initialize our mock database on app start
initDB();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
