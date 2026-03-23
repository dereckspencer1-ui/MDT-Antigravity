import React, { useState } from 'react';
import { Users, Link as LinkIcon, Copy, CheckCircle2, HandCoins, Send } from 'lucide-react';
import { getGlobalMetrics, sendMDT } from '../store/mockDB';

const MyNetwork = ({ user, metrics }) => {
  const [copied, setCopied] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendEmail, setSendEmail] = useState('');
  
  // Create a local reactive state for the user to guarantee UI updates when the "Matrix" button is clicked
  const [localUser, setLocalUser] = useState(user);

  React.useEffect(() => {
     const handleStorage = () => {
         const storedUser = JSON.parse(localStorage.getItem('mdt_current_user') || 'null');
         if (storedUser) setLocalUser(storedUser);
     };
     window.addEventListener('storage', handleStorage);
     return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refLink = `${window.location.origin}/?ref=${localUser?.wallet}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (Number(sendAmount) <= 0) return;
    try {
      sendMDT(user.id, sendEmail, Number(sendAmount));
      alert(`Enviados ${sendAmount} MDT a ${sendEmail}`);
      setSendAmount('');
      setSendEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amountToWithdraw = localUser.mdtBalance || 0;
    if (amountToWithdraw <= 0) {
        alert("No tienes saldo suficiente para realizar un retiro.");
        return;
    }
    
    if (!window.confirm(`¿Estás seguro de que deseas retirar la totalidad de tus MDTs (${amountToWithdraw.toFixed(4)} MDT)?`)) return;

    try {
      import('../store/mockDB').then(({ withdrawMDT }) => {
          const usdtReceived = withdrawMDT(user.id, amountToWithdraw);
          alert(`¡Retiro Exitoso! Has quemado la totalidad de tus MDT (${amountToWithdraw.toFixed(4)} MDT).\nHas recibido $${usdtReceived.toFixed(2)} USDT en tu Billetera Externa.`);
      });
    } catch (err) {
      alert(err.message || 'Error processing withdrawal');
    }
  };

  return (
    <div style={{ padding: '0px 16px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeInSlideUp 0.6s ease forwards' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Referral and Stats Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ 
            padding: '40px 32px', 
            background: 'linear-gradient(145deg, rgba(2, 6, 23, 0.8) 0%, rgba(2, 20, 10, 0.6) 100%)', 
            border: '2px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              <LinkIcon size={24} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }} /> Tu Link de Referido
            </h3>
            
            <div style={{ 
                display: 'flex', 
                gap: '0px', 
                alignItems: 'stretch',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(0,255,136,0.2)',
                padding: '8px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <div style={{
                  flex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden'
              }}>
                <a  
                    href={refLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '16px', 
                    color: 'var(--primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(0,255,136,0.4)',
                    letterSpacing: '0.5px',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}>
                    {refLink}
                </a>
              </div>
              <button 
                  onClick={handleCopy} 
                  className="glass-btn" 
                  style={{ 
                      padding: '0 24px', 
                      background: copied ? 'var(--primary)' : 'rgba(0, 255, 136, 0.1)', 
                      color: copied ? '#000' : 'var(--primary)',
                      border: `1px solid ${copied ? 'transparent' : 'var(--primary)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxShadow: copied ? '0 0 15px var(--primary)' : 'none'
                  }}
              >
                {copied ? (
                    <>
                        <CheckCircle2 size={18} /> COPIADO
                    </>
                ) : (
                    <>
                        <Copy size={18} /> COPIAR
                    </>
                )}
              </button>
            </div>
            
            <div style={{ marginTop: '32px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)', position: 'relative' }}>
                <img src="/power-of-6.jpg" alt="El Poder del 6 - Estrategia MDT" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                {/* Subtle gradient overlay to blend the bottom edge with the UI */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', background: 'linear-gradient(to top, rgba(2,6,23,0.8), transparent)' }}></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px', background: 'rgba(2, 6, 23, 0.5)' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#F59E0B' }}>
              <Users size={20} color="var(--accent)" /> Estadísticas de Contrato
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', borderLeft: '3px solid var(--primary)' }}>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Ventas directas (Nivel Actual)</span>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#F59E0B' }}>{localUser.activeContractSales || 0} / 66</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Contratos Completados</span>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--primary)' }}>{localUser.completedContracts || 0}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Billetera Interna MDT</span>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent)' }}>{(localUser.mdtBalance || 0).toFixed(2)}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Withdraw / Burn Column */}
        <div className="glass-panel" style={{ padding: '32px', flex: 2, background: 'rgba(2, 6, 23, 0.6)' }}>
           {/* WALLET ADDRESS BLOCK */}
           <div style={{ padding: '24px', marginBottom: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                   TU DIRECCIÓN DE BILLETERA (RECEPTOR)
               </h4>
               <p style={{ fontFamily: 'monospace', fontSize: '18px', color: 'var(--primary)', fontWeight: 'bold', margin: '8px 0 0 0', wordBreak: 'break-all' }}>
                   {localUser?.wallet}
               </p>
           </div>

           {/* QUEMA */}
           <div style={{ padding: '0px', borderTop: '4px solid #F59E0B', paddingTop: '32px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', marginBottom: '24px', fontWeight: '900', color: '#fff' }}>
                  <HandCoins size={24} color="#F59E0B" /> Quema Criptográfica (MDT → USDT)
              </h4>
              <form onSubmit={handleWithdraw} style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                  <p style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>Monto a Liquidar (100% de la Billetera Interna)</p>
                 <div style={{ position: 'relative' }}>
                     <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B', fontWeight: 'bold' }}>$</span>
                     <input type="text" value={(localUser.mdtBalance || 0).toFixed(4)} readOnly className="glass-input" style={{ width: '100%', padding: '16px 16px 16px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', color: '#555', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'not-allowed' }} />
                 </div>
                 <button type="submit" className="glass-btn" style={{ padding: '16px', borderColor: '#F59E0B', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', fontWeight: 'bold', textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>[ RETIRAR TODO AL 100% 🔥 ]</button>
              </form>
              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(245,158,11,0.05)', borderRadius: '8px', border: '1px dashed rgba(245,158,11,0.2)' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                      <strong style={{color: '#F59E0B'}}>Sanción 6.66%:</strong> Al retirar, se aplica un fee automático que se bloquea en la Pool de Liquidez para aumentar el respaldo global del token. Confirmarás en Metamask.
                  </p>
              </div>
           </div>

           {/* P2P TRANSFER */}
           <div style={{ padding: '0px', borderTop: '4px solid #3B82F6', marginTop: '32px', paddingTop: '32px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', marginBottom: '24px', fontWeight: '900', color: '#fff' }}>
                  <Send size={24} color="#3B82F6" /> Enlace P2P Red Interna
              </h4>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                 <input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="Dirección Email o Wallet Destino" className="glass-input" style={{ padding: '16px', borderRadius: '8px', fontSize: '16px' }} required />
                 <div style={{ position: 'relative' }}>
                     <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#3B82F6', fontWeight: 'bold' }}>$</span>
                     <input type="number" min="0.1" step="0.1" value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="0.00 MDT" className="glass-input" style={{ width: '100%', padding: '16px 16px 16px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', color: '#3B82F6' }} required />
                 </div>
                 <button type="submit" className="glass-btn" style={{ padding: '16px', borderColor: '#3B82F6', color: '#3B82F6', textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>[ TRANSFERIR OFF-CHAIN ]</button>
              </form>
              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px dashed rgba(59,130,246,0.2)' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                      <strong style={{color: '#3B82F6'}}>0% Red Fee:</strong> Las transferencias internas entre cuentas de la plataforma evitan por completo el gas de la red principal, permitiendo P2P atómico.
                  </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default MyNetwork;
