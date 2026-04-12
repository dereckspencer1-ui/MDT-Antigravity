import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseContract } from '../store/mockDB';
import { Key } from 'lucide-react';

const ContractPurchase = ({ user }) => {
    const navigate = useNavigate();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState('');

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const success = await purchaseContract(user.wallet);
            if (success) {
                setTimeout(() => {
                    navigate('/dashboard'); // Go to dashboard!
                }, 1000);
            } else {
                setError('Error al procesar el contrato.');
                setIsPurchasing(false);
            }
        } catch (e) {
            setError(e.message || 'Error de procesamiento.');
            setIsPurchasing(false);
        }
    };

    if (!user) return null;

    if (user.contractStatus === 'ACTIVE') {
        // Redirigir si ya tiene contrato
        setTimeout(() => navigate('/dashboard'), 0);
        return null;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%', paddingTop: '60px' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '40px', textAlign: 'center', border: '1px solid var(--primary)' }}>
                <Key size={48} color="var(--primary)" style={{ marginBottom: '24px' }} />
                
                <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#fff' }}>Activar Contrato Inteligente</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Hola, <strong>{user.username}</strong>. Para acceder al ecosistema y a tu Dashboard, debes activar tu contrato inyectando liquidez a la fábrica.
                </p>

                <div style={{ 
                    background: 'rgba(0, 0, 0, 0.5)', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    marginBottom: '32px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Costo del Contrato:</span>
                        <strong style={{ color: '#fff' }}>6 USDT</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Distribución en Red (5 Niveles):</span>
                        <strong style={{ color: '#fff' }}>5.00 USDT</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>MDT Liquidity Pool:</span>
                        <strong style={{ color: '#fff' }}>0.50 USDT</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Desarrollo e Inversores (Gas + Proyectos):</span>
                        <strong style={{ color: '#fff' }}>0.50 USDT</strong>
                    </div>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

                <button 
                    onClick={handlePurchase} 
                    className="glass-btn" 
                    disabled={isPurchasing}
                    style={{ width: '100%', fontSize: '18px', padding: '16px' }}
                >
                    {isPurchasing ? 'Procesando en Blockchain...' : 'Inyectar 6 USDT'}
                </button>
                
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
                    Enviarás MDT a la red.
                </p>
            </div>
        </div>
    );
};

export default ContractPurchase;
