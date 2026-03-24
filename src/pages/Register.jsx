import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { registerUser, getAllUsers, getCurrentUser, getSyncStatus } from '../store/mockDB';
import { Shield, UserPlus, Fingerprint, Lock, Mail, Users, ArrowRight } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Auto-fill email if passed from Home
    const initialEmail = location.state?.email || '';
    
    // Check for referral link
    const searchParams = new URLSearchParams(location.search);
    const referralId = searchParams.get('ref');
    
    // Check if user is testing their link
    const currentUser = getCurrentUser();
    
    const [formData, setFormData] = useState({
        email: initialEmail,
        username: '',
        password: '',
        wallet: ''
    });
    const [inviter, setInviter] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [userCount, setUserCount] = useState(getAllUsers().length);
    const [isSyncing, setIsSyncing] = useState(getSyncStatus());
    const [debugInfo, setDebugInfo] = useState('');
    
    const [isPro, setIsPro] = useState(document.body.classList.contains('theme-pro'));

    useEffect(() => {
        const handleThemeChange = () => setIsPro(document.body.classList.contains('theme-pro'));
        window.addEventListener('theme-changed', handleThemeChange);
        return () => window.removeEventListener('theme-changed', handleThemeChange);
    }, []);

    useEffect(() => {
        // Function to check inviter either on mount or when Supabase finishes downloading the users
        const checkInviter = () => {
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
        };

        checkInviter();

        // When App.jsx finishes fetching 'usuarios_json' from Supabase, it fires 'storage'
        const handleStorage = () => {
            checkInviter();
            setUserCount(getAllUsers().length);
            setIsSyncing(getSyncStatus());
            const debugLog = localStorage.getItem('mockdb_debug') || '';
            if (debugLog) setDebugInfo(debugLog);
        };
        
        window.addEventListener('storage', handleStorage);
        window.addEventListener('session-changed', handleStorage);
        window.addEventListener('sync-complete', handleStorage);
        
        // Initial check
        const debugLog = localStorage.getItem('mockdb_debug') || '';
        if (debugLog) setDebugInfo(debugLog);
        
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('session-changed', handleStorage);
            window.removeEventListener('sync-complete', handleStorage);
        };
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
        
        // GENESIS BLOCK AUTHORIZATION CHECK
        if (users.length === 0) {
            const validEmails = ['fundador@mendigotoken.com', 'admin@mendigotoken.com', 'dereckspencer1@gmail.com'];
            if (!validEmails.includes(formData.email.toLowerCase())) {
                setError('Error de Seguridad: Sólo el Fundador Creador está autorizado para inicializar el Bloque Génesis.');
                setIsProcessing(false);
                return;
            }
            if (!formData.username.toUpperCase().includes('FUNDADOR')) {
                setError('Error: El nombre de usuario en el Bloque Génesis debe contener la palabra FUNDADOR.');
                setIsProcessing(false);
                return;
            }
        }

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

        if (newUser && !newUser.error) {
            // Success! The user is now logged in via mockDB (it sets 'mdt_current_user')
            // Send them directly to the Contract Purchase View
            navigate('/comprar');
        } else {
            setError(newUser?.error || 'Error al registrar. Intenta de nuevo.');
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }} className="animate-reveal">
            
            {/* LOADING STATE - PREVENTS GENESIS FALSE POSITIVES */}
            {isSyncing ? (
                <div className="glass-panel" style={{ padding: '60px', maxWidth: '500px', width: '100%', textAlign: 'center', background: 'rgba(2, 6, 23, 0.6)' }}>
                    <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}></div>
                    <h3 style={{ color: 'var(--text-main)', fontSize: '20px' }}>Sincronizando Nodo...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Cargando participantes globales de la red MDT.</p>
                </div>
            ) : userCount === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', maxWidth: '500px', width: '100%', textAlign: 'center', background: 'rgba(0, 51, 20, 0.4)' }}>
                    <Shield size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
                    {debugInfo && (
                        <div style={{ background: 'rgba(255, 255, 0, 0.1)', border: '1px solid #FFD700', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '11px', color: '#FFD700', textAlign: 'left', wordBreak: 'break-all' }}>
                            <strong>DEBUG LOG:</strong><br/>
                            {debugInfo.substring(0, 300)}...
                        </div>
                    )}
                    
                    <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Inicialización Génesis
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
                        El sistema detecta que la red está vacía. Estás a punto de crear el Bloque Génesis.<br/>
                        <span style={{color: 'var(--primary)'}}>Este usuario ocupará las primeras 4 posiciones del contrato inmutable.</span>
                    </p>

                    <button 
                        type="button"
                        onClick={() => setFormData({ email: 'fundador@mendigotoken.com', username: 'FUNDADOR', password: '123', wallet: '' })}
                        style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '13px', width: '100%' }}
                    >
                        ⚡ Autocompletar Llave de Fundador ⚡
                    </button>
                    
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        <input type="email" name="email" placeholder="Correo Génesis" className="glass-input" value={formData.email} onChange={handleInputChange} required />
                        <input type="text" name="username" placeholder="Usuario (Ej. FUNDADOR)" className="glass-input" value={formData.username} onChange={handleInputChange} required />
                        <input type="password" name="password" placeholder="Contraseña Segura" className="glass-input" value={formData.password} onChange={handleInputChange} required />
                        
                        {error && <div style={{ color: '#ff4444', marginBottom: '8px', fontSize: '13px', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '16px', background: 'var(--primary)', color: '#000' }} disabled={isProcessing}>
                            {isProcessing ? 'INICIALIZANDO...' : 'INICIALIZAR GÉNESIS'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => { if(window.confirm('¿Borrar memoria local de simulador?')) { localStorage.clear(); window.location.href = '/login'; } }}
                            style={{ background: 'transparent', border: 'none', color: '#ff4444', marginTop: '16px', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                        >
                            ⚠️ Purgar Simulador Local (Lleno)
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    {isPro && <img src="/nuevo-logo-claro.png" alt="Logo" style={{ width: '60px', marginBottom: '20px' }} />}
                    <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' }}>NUEVO REGISTRO</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
                        Crea tu perfil en la red MDT Pro.
                    </p>

                    {currentUser && referralId && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#F59E0B', textAlign: 'center' }}>
                            <strong>Estás en Modo Vista Previa.</strong> Cierra sesión o abre en modo Incógnito para registrar a un referido real.
                        </div>
                    )}

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

                        <button 
                            type="button"
                            onClick={() => { if(window.confirm('¿Borrar memoria local de simulador?')) { localStorage.clear(); window.location.href = '/login'; } }}
                            style={{ background: 'transparent', border: 'none', color: '#ff4444', marginTop: '16px', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                        >
                            ⚠️ Purgar Simulador Local (Lleno)
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Register;
