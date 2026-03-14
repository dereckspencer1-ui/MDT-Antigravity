import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllUsers, registerUser } from '../store/mockDB';
import { Shield, ChevronRight } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Auto-fill email if passed from Home
    const initialEmail = location.state?.email || '';
    
    // Check for referral link
    const searchParams = new URLSearchParams(location.search);
    const referralId = searchParams.get('ref');
    
    const [formData, setFormData] = useState({
        email: initialEmail,
        username: '',
        password: '',
        wallet: ''
    });
    const [inviter, setInviter] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // If a referral link is used, find the inviter
        if (referralId) {
            const users = getAllUsers();
            const foundInviter = users.find(u => 
                u.wallet === referralId || 
                u.id === referralId || 
                u.username.toLowerCase() === referralId.toLowerCase()
            );
            if (foundInviter) {
                setInviter(foundInviter);
            }
        }
    }, [referralId]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        if (isProcessing) return;
        setIsProcessing(true);

        const users = getAllUsers();
        
        if (!formData.email || !formData.username || !formData.password) {
            setError('Por favor completa los campos obligatorios.');
            setIsProcessing(false);
            return;
        }

        if (users.find(u => u.email === formData.email)) {
            setError('Este correo ya está registrado.');
            setIsProcessing(false);
            return;
        }
        
        if (users.find(u => u.username === formData.username)) {
            setError('Este nombre de usuario ya existe.');
            setIsProcessing(false);
            return;
        }

        // Generate a mock wallet if none provided (for demo purposes)
        const mockWallet = formData.wallet || `0x${Math.random().toString(16).slice(2, 10)}...demo`;

        // Register the user
        const newUser = registerUser(
            formData.email,
            formData.username,
            formData.password,
            inviter ? inviter.id : null
        );

        if (newUser) {
            // Success! The user is now logged in via mockDB (it sets 'mdt_current_user')
            // Send them directly to the Contract Purchase View
            navigate('/comprar');
        } else {
            setError('Error al registrar. Intenta de nuevo.');
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }} className="animate-reveal">
            
            {/* INICIO DE GÉNESIS (Only visible if the system is completely empty) */}
            {getAllUsers().length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', maxWidth: '500px', width: '100%', textAlign: 'center', background: 'rgba(0, 51, 20, 0.4)' }}>
                    <Shield size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Inicialización Génesis
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
                        El sistema detecta que la red está vacía. Estás a punto de crear el Bloque Génesis.<br/>
                        <span style={{color: 'var(--primary)'}}>Este usuario ocupará las primeras 4 posiciones del contrato inmutable.</span>
                    </p>
                    
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        <input type="email" name="email" placeholder="Correo Génesis" className="glass-input" value={formData.email} onChange={handleInputChange} required />
                        <input type="text" name="username" placeholder="Usuario (Ej. FUNDADOR)" className="glass-input" value={formData.username} onChange={handleInputChange} required />
                        <input type="password" name="password" placeholder="Contraseña Segura" className="glass-input" value={formData.password} onChange={handleInputChange} required />
                        
                        <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '24px', background: 'var(--primary)', color: '#000' }} disabled={isProcessing}>
                            {isProcessing ? 'INICIALIZANDO...' : 'INICIALIZAR GÉNESIS'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <img src="/Mendigotoken-logo.png" alt="Logo" style={{ width: '60px', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' }}>NUEVO REGISTRO</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
                        Crea tu perfil en la red MDT Pro.
                    </p>

                    {inviter && (
                        <div style={{ background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Referido por:</span> {inviter.username}
                        </div>
                    )}
                    
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <input type="email" name="email" placeholder="Correo Electrónico" className="glass-input" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <input type="text" name="username" placeholder="Nombre de Usuario (Alias)" className="glass-input" value={formData.username} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <input type="password" name="password" placeholder="Contraseña" className="glass-input" value={formData.password} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <input type="text" name="wallet" placeholder="Billetera Externa (Opcional Demo)" className="glass-input" value={formData.wallet} onChange={handleInputChange} />
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', textAlign: 'left' }}>{error}</p>}
                        
                        <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '16px' }} disabled={isProcessing}>
                            {isProcessing ? 'Procesando...' : 'CREAR CUENTA'} <ChevronRight size={18} />
                        </button>

                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', marginTop: '16px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Volver al Inicio
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Register;
