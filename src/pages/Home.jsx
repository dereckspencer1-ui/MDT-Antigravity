import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserByEmail } from '../store/mockDB';
import { LogIn, Sun, Moon } from 'lucide-react';

const Home = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const existingUser = getUserByEmail(email);

    if (existingUser) {
      // Pass the email to the Login page
      navigate('/login', { state: { email } });
    } else {
      // Pass the email to the Register page
      navigate('/register', { state: { email } });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }} className="animate-reveal">
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', width: '100%', position: 'absolute', top: '20px', right: '20px' }}>
            {/* THEME TOGGLE FOR PUBLIC HOME */}
            <button 
                onClick={() => {
                    const isPro = document.body.classList.contains('theme-pro');
                    localStorage.setItem('mdt_theme', isPro ? 'dark' : 'pro');
                    window.dispatchEvent(new Event('theme-changed'));
                }}
                className="glass-btn"
                style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    cursor: 'pointer'
                }}
                title="Cambiar Diseño"
            >
                {document.body.classList.contains('theme-pro') ? <Moon size={20} /> : <Sun size={20} />}
            </button>

          <Link to="/login" className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <LogIn size={18} /> Entrar
          </Link>
        </div>
        <img src="/Mendigotoken-logo.png" alt="Logo" style={{ width: '80px', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' }}>MENDIGOTOKEN PRO</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>Smart Contract Factory V4.0</p>
        
        <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input 
              type="email" 
              placeholder="Ingresa tu Correo Electrónico" 
              className="glass-input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', textAlign: 'left' }}>{error}</p>}
          </div>
          <button type="submit" className="glass-btn" style={{ width: '100%' }}>
            Continuar
          </button>
        </form>

        { (email.toLowerCase().includes('dereckspencer1@gmail.com') || email.toLowerCase().includes('admin@mendigotoken.com') || email.toLowerCase().includes('fundador@mendigotoken.com')) && (
          <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,0,0,0.3)', paddingTop: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Herramientas de Desarrollador (Fundador Detectado)</p>
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm('¿Borrar toda la red y volver al estado vacío (Pre-Génesis)?')) {
                  localStorage.clear();
                  window.location.href = '/registro';
                }
              }}
              style={{ 
                background: 'rgba(255, 0, 0, 0.2)', 
                color: '#ff4444', 
                border: '1px solid #ff4444', 
                padding: '8px 16px', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                width: '100%'
              }}
            >
              ⚠️ PURGAR RED (HARD RESET) ⚠️
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
