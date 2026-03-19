import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Component
import TopNav from '../components/TopNav';

// Child components
import Dashboard from '../components/Dashboard';
import MyNetwork from '../components/MyNetwork';
import Philosophy from '../components/Philosophy'; // Will act as Whitepaper

const Desktop = ({ user }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent' }}>
      {/* Universal Top Navigation */}
      <TopNav user={user} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/red" element={<MyNetwork user={user} />} />
            <Route path="/whitepaper" element={<Philosophy />} />
            {/* Fallback internal redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
      </main>
    </div>
  );
};

export default Desktop;
