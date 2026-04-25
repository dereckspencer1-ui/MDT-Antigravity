import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUserByEmail, getNetworkIsActive } from '../store/mockDB';
import { LogIn } from 'lucide-react';
import YinYang from '../components/YinYang';

const Home = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isPro, setIsPro] = useState(document.body.classList.contains('theme-pro'));

  useEffect(() => {
    const handleThemeChange = () => setIsPro(document.body.classList.contains('theme-pro'));
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  const handleNext = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsProcessing(true);
    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
          // Pass the email to the Login page
          navigate('/login', { state: { email } });
        } else {
          const isNetworkLive = await getNetworkIsActive();
          
          // DIAGRAMA DE FLUJO: Si la red no ha arrancado (Génesis), SÓLO el fundador puede registrarse.
          if (!isNetworkLive && email.toLowerCase() !== 'dereckspencer1@gmail.com') {
             setError('Acceso Denegado: La red aún no ha sido inicializada. Solo el Fundador puede crear el Bloque Génesis.');
             setIsProcessing(false);
             return;
          }

          // Extraemos el parámetro ref si existe
          const searchParams = new URLSearchParams(location.search);
          const referralId = searchParams.get('ref');
          
          const registerPath = referralId ? `/register?ref=${referralId}` : '/register';

          // Pass the email to the Register page
          navigate(registerPath, { state: { email } });
        }
    } catch (err) {
        setError('Error de conexión.');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }} className="animate-reveal">
      {/* THEME TOGGLE FOR PUBLIC HOME - FIXED POSITION */}
      <button 
          onClick={() => {
              const themeIsPro = document.body.classList.contains('theme-pro');
              localStorage.setItem('mdt_theme', themeIsPro ? 'dark' : 'pro');
              window.dispatchEvent(new Event('theme-changed'));
          }}
          style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              zIndex: 100
          }}
          title="Cambiar Diseño"
      >
          <YinYang size={36} isPro={isPro} />
      </button>

      <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {isPro && <img src="/nuevo-logo-claro.png" alt="Logo" style={{ width: '80px', marginBottom: '20px' }} />}
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
          <button type="submit" className="glass-btn" style={{ width: '100%' }} disabled={isProcessing}>
            {isProcessing ? 'Procesando...' : 'Continuar'}
          </button>
        </form>


        { (email.toLowerCase().includes('dereckspencer1@gmail.com') || email.toLowerCase().includes('admin@mendigotoken.com') || email.toLowerCase().includes('fundador@mendigotoken.com')) && (
          <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,0,0,0.3)', paddingTop: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Herramientas de Desarrollador (Fundador Detectado)</p>
            <button 
              type="button" 
              onClick={async () => {
                if (window.confirm('¿Borrar toda la red y volver al estado vacío (Pre-Génesis)?')) {
                  const { resetToGenesis } = await import('../store/mockDB');
                  await resetToGenesis();
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
