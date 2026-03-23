import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { getCurrentUser, getMdtData, syncUsersFromSupabase } from './store/mockDB';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ContractPurchase from './pages/ContractPurchase';
import Desktop from './pages/Desktop';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    // 0. Pull global entire network tree from cloud on app boot
    syncUsersFromSupabase();

    // Theme initialization
    const savedTheme = localStorage.getItem('mdt_theme') || 'dark';
    if (savedTheme === 'pro') document.body.classList.add('theme-pro');
    else document.body.classList.remove('theme-pro');

    const handleThemeChange = () => {
      const theme = localStorage.getItem('mdt_theme');
      if (theme === 'pro') document.body.classList.add('theme-pro');
      else document.body.classList.remove('theme-pro');
    };
    window.addEventListener('theme-changed', handleThemeChange);

    // 1. Listen for user changes in localStorage (auth simulation)
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Fallback: check on every route change
    setUser(getCurrentUser());
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  useEffect(() => {
    // 2. Auth Guards and Routing Logic
    const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
    
    if (!user && !isPublicRoute) {
      // Not logged in, trying to access protected route -> go to Home
      navigate('/', { replace: true });
    } else if (user) {
      // Logged in
      if (user.contractStatus === 'PENDING' && location.pathname !== '/comprar') {
        // Needs to buy contract
        navigate('/comprar', { replace: true });
      } else if (user.contractStatus === 'ACTIVE' && (isPublicRoute || location.pathname === '/comprar')) {
        // Permitir que usuarios activos vean la página de inicio o registro si están probando un link de referido
        if ((location.pathname === '/register' || location.pathname === '/') && location.search.includes('ref=')) {
          // No redirigir
        } else {
          // Active user trying to access public/purchase routing -> go to dashboard
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/comprar" element={<ContractPurchase user={user} />} />
      
      {/* The Dashboard area (Desktop) acts as a layout for /dashboard, /red, /whitepaper */}
      <Route path="/*" element={user && user.contractStatus === 'ACTIVE' ? <Desktop user={user} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
