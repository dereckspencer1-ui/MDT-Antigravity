import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByEmail } from '../store/mockDB';

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

        {/* Developer Reset Button */}
        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: 'var(--danger)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            ⚠️ Borrar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
