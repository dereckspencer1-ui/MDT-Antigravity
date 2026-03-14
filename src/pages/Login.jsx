import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMdtData, loginUser } from '../store/mockDB';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialEmail = location.state?.email || '';
    
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const user = loginUser(initialEmail, password);
        
        if (user) {
            // Redirect based on contract status
            if (user.contractStatus === 'ACTIVE') {
                navigate('/dashboard');
            } else {
                navigate('/comprar');
            }
        } else {
            setError('Contraseña incorrecta.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }} className="animate-reveal">
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' }}>INICIAR SESIÓN</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
                    Bienvenido de vuelta, <br/>
                    <strong style={{color: '#fff'}}>{initialEmail}</strong>
                </p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Ingresa tu Contraseña" 
                            className="glass-input"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            required
                        />
                        {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', textAlign: 'left' }}>{error}</p>}
                    </div>
                    
                    <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '16px' }}>
                        Entrar al Ecosistema
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => navigate('/')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', marginTop: '16px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Cambiar Correo
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
