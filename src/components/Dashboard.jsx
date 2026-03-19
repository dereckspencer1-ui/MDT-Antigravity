import React, { useState, useEffect } from 'react';
import { getGlobalMetrics, injectMatrixTest } from '../store/mockDB';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap } from 'lucide-react';

const COLORS = ['#00E676']; // Matrix Green Only for Price

// Custom Format Time HH:MM:SS
const formatTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const Dashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(getGlobalMetrics());
  const [priceHistory, setPriceHistory] = useState([
      { name: formatTime(), price: Number(getGlobalMetrics().currentPrice) }
  ]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [testUsed, setTestUsed] = useState(false);

  useEffect(() => {
    const fetchSupabaseMetrics = async () => {
      try {
        const { data, error } = await supabase.from('contadores1').select('*').limit(1);
        if (!error && data && data.length > 0) {
           const row = data[0];
           
           setMetrics(prev => {
             const updated = {
                 ...prev,
                 minted: row.mdt_acunado ?? prev.minted,
                 burned: row.mdt_quemado ?? prev.burned,
                 circulating: row.mdt_circulante ?? prev.circulating,
                 usdtVault: row.mdt_balance ?? prev.usdtVault,
                 activeContracts: row.ventas_globales ?? prev.activeContracts,
                 fomoDays: row.contador_fomo ?? prev.fomoDays
             };
             // Calculamos el valor de 1 MDT en Dólares (Vault / Circulante)
             if (updated.usdtVault > 0 && updated.circulating > 0) {
                 updated.currentPrice = (updated.usdtVault / updated.circulating).toFixed(4);
                 updated.backing = updated.currentPrice; 
             }
             return updated;
           });
           
           // Update chart
           setPriceHistory(prevHist => {
               // El chart también necesita mostrar el valor en dólares (USD por Token)
               const currentPrice = (row.mdt_circulante > 0) 
                 ? Number((row.mdt_balance / row.mdt_circulante).toFixed(4)) 
                 : prevHist[prevHist.length - 1]?.price || 1;
                 
               const newPoint = { name: formatTime(), price: currentPrice };
               const updated = [...prevHist, newPoint];
               return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
           });
        }
      } catch (e) {
        console.error("Supabase fetch error:", e);
      }
    };

    const interval = setInterval(() => {
      fetchSupabaseMetrics();
    }, 5000);
    
    // Initial fetch
    fetchSupabaseMetrics();

    return () => clearInterval(interval);
  }, []);

  const handleStressTest = () => {
      // Only the Founder can run this full simulation
      const isFounder = user.email === 'admin@mendigotoken.com' || user.email === 'dereckspencer1@gmail.com' || user.email === 'fundador@mendigotoken.com' || user.username?.toUpperCase() === 'FUNDADOR';
      if (!isFounder) {
          setMsg({ type: 'error', text: '⛔ Simulación no autorizada. Solo el Fundador puede inyectar tráfico.' });
          return;
      }
      
      // Clear any existing simulation
      if (window.matrixInterval) clearInterval(window.matrixInterval);
      
      localStorage.removeItem('mdt_matrix_queue');
      localStorage.removeItem('mdt_matrix_counts');
      
      setTestUsed(true);
      setMsg({ type: 'success', text: '⚡ SIMULACIÓN MATRIZ 6x6 INICIADA: Llenando 9,330 Contratos ⚡' });
      
      let purchasesMade = 0;
      const TARGET_PURCHASES = 9330; 
      
      window.matrixInterval = setInterval(() => {
          if (purchasesMade >= TARGET_PURCHASES) {
              clearInterval(window.matrixInterval);
              setMsg({ type: 'success', text: '✅ SIMULACIÓN COMPLETADA: Matriz 6x6 (5 Niveles) llena.' });
              return;
          }

          // Acceleration logic: 1 per tick initially, then +1 every 50 sales to reach 9330 smoothly.
          const currentRate = Math.floor(purchasesMade / 50) + 1;
          const batchSize = Math.min(currentRate, TARGET_PURCHASES - purchasesMade);
          
          // Passing 'ADMIN_DSF' to ensure the simulation uses the Founder's referral link
          injectMatrixTest(batchSize, 'ADMIN_DSF');
          purchasesMade += batchSize;
          
          // Force UI refresh with new metrics
          const newMetrics = getGlobalMetrics();
          setMetrics(newMetrics);
          
          // Trigger storage event so App.jsx updates the `user` prop (shows incoming money dynamically)
          window.dispatchEvent(new Event('storage'));
          
          // Update Chart
          setPriceHistory(prev => {
              const newPoint = { name: formatTime(), price: Number(newMetrics.currentPrice) };
              const updated = [...prev, newPoint];
              if (updated.length > 20) return updated.slice(updated.length - 20);
              return updated;
          });
      }, 800); // Trigger slightly faster for visual effect (0.8s) 
  };

  return (
    <div style={{ padding: '0px 16px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeInSlideUp 0.6s ease forwards' }}>
      
      {msg.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '24px', background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 230, 118, 0.1)', color: msg.type === 'error' ? 'var(--danger)' : 'var(--primary)', border: `1px solid ${msg.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 230, 118, 0.3)'}` }}>
          {msg.text}
        </div>
      )}

      {/* Top Section: Title & Spline Chart with Hero Background */}
      <div className="glass-panel" style={{ 
          padding: '32px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          marginBottom: '32px',
          background: 'rgba(2, 6, 23, 0.55)', 
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
          borderRadius: '16px',
          position: 'relative'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* ... removed duplicate logo ... */}
                  <div>
                      <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          <span style={{ color: 'var(--primary)', textShadow: '0 0 15px rgba(0,255,100,0.4)' }}>DASHBOARD</span>
                      </h1>
                      <div style={{ fontSize: '14px', color: '#F59E0B', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px', fontWeight: '800' }}>
                          MENDIGOTOKEN FACTORY V4.0
                      </div>
                  </div>
              </div>

              {/* MASSIVE STRESS TEST BUTTON (ONLY FOR FOUNDER) */}
              {(user.email === 'admin@mendigotoken.com' || user.email === 'dereckspencer1@gmail.com' || user.email === 'fundador@mendigotoken.com' || user.username?.toUpperCase() === 'FUNDADOR') && (
                  <button 
                      onClick={handleStressTest} 
                      className="glass-btn"
                      disabled={testUsed}
                      style={{ 
                          background: testUsed ? 'rgba(100, 100, 100, 0.2)' : 'rgba(245, 158, 11, 0.1)', 
                          border: testUsed ? '2px solid #555' : '2px solid #F59E0B', 
                          cursor: testUsed ? 'not-allowed' : 'pointer', 
                          padding: '16px 32px', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '18px',
                          fontWeight: '900',
                          color: testUsed ? '#888' : '#F59E0B',
                          boxShadow: testUsed ? 'none' : '0 0 30px rgba(245, 158, 11, 0.3)',
                          transition: 'all 0.2s ease',
                          textTransform: 'uppercase',
                          opacity: testUsed ? 0.6 : 1
                      }} 
                      title="SIMULAR MATRIZ 6x6 REAL"
                      onMouseOver={(e) => { if(!testUsed) { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                      onMouseOut={(e) => { if(!testUsed) { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                  >
                      <Zap size={28} color={testUsed ? '#555' : '#F59E0B'} style={{ filter: testUsed ? 'none' : 'drop-shadow(0 0 8px #F59E0B)' }} />
                      {testUsed ? 'SIMULACIÓN REALIZADA' : 'INICIAR MATRIZ 6x6 (9330)'}
                  </button>
              )}
          </div>

          {/* Spline Chart */}
          <div style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 MDT / USDT <span style={{fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal'}}>(Vivo)</span>
             </h2>
             <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[0], boxShadow: `0 0 8px ${COLORS[0]}` }}/> Precio Real</div>
             </div>
          </div>
          
          <div style={{ flex: 1, width: '100%', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.05)" vertical={true} />
                <XAxis dataKey="name" stroke="none" fill="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tick={{fill: 'rgba(255,255,255,0.4)'}} dy={10} />
                {/* Dynamically scale the Y axis to the min/max of the data to show extreme volatility in the stress test */}
                <YAxis stroke="none" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toFixed(4)}`} tick={{fill: 'rgba(255,255,255,0.4)'}} dx={-10} domain={['auto', 'auto']} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'var(--primary)', borderRadius: '8px' }} itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Precio']} />
                
                {/* Green Line (Price) */}
                <Area type="monotone" dataKey="price" stroke={COLORS[0]} fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} isAnimationActive={true} activeDot={{ r: 6, fill: COLORS[0], stroke: '#fff', strokeWidth: 2 }} />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
         
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(2, 20, 10, 0.4)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             {/* Neon glow effect */}
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                         {/* Default Track */}
                         <Pie data={[{value:100}]} cx="50%" cy="50%" innerRadius={65} outerRadius={70} stroke="none" fill="rgba(0, 255, 136, 0.05)" />
                         {/* LED Progress Ring */}
                         <Pie data={[{value: metrics.minted}, {value: Math.max(0, metrics.maxSupply - metrics.minted)}]} cx="50%" cy="50%" innerRadius={65} outerRadius={72} stroke="none" startAngle={90} endAngle={-270} dataKey="value" cornerRadius={40}>
                             <Cell fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                             <Cell fill="transparent" />
                         </Pie>
                     </PieChart>
                 </ResponsiveContainer>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B', textShadow: '0 0 10px rgba(0,230,118,0.5)', marginBottom: '4px' }}>
                         {Math.min(100, (metrics.minted / metrics.maxSupply) * 100).toFixed(2)}%
                     </span>
                     <span style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Progreso</span>
                 </div>
             </div>
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#F59E0B', fontWeight: '500' }}>Ventas Globales</h3>
                 <p style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px' }}>{metrics.activeContracts || 0} Contratos</p>
             </div>
         </div>

         {/* Contenedor MDT Circulante */}
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(2, 20, 10, 0.4)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ position: 'absolute', width: '90%', height: '90%', border: '2px solid rgba(0, 255, 136, 0.2)', borderRadius: '50%', borderTopColor: 'var(--primary)', animation: 'spin 10s linear infinite' }} />
                 <div style={{ position: 'absolute', width: '75%', height: '75%', border: '1px dashed rgba(0, 255, 136, 0.4)', borderRadius: '50%', animation: 'spin 15s linear infinite reverse' }} />
                 
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                     <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textShadow: '0 0 10px rgba(0,255,136,0.6)', marginBottom: '4px' }}>
                         {Number(metrics.circulating || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                     </span>
                     <span style={{ fontSize: '10px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px' }}>MDT</span>
                 </div>
             </div>
             
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#F59E0B', fontWeight: '500' }}>Circulante Vivo</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Tokens en el Mercado</p>
             </div>
         </div>

         {/* Precio MDT */}
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(2, 20, 10, 0.4)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             {/* Neon glow effect */}
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                         <Pie data={[{value:100}]} cx="50%" cy="50%" innerRadius={65} outerRadius={70} stroke="none" fill="rgba(0, 255, 136, 0.05)" />
                         <Pie data={[{value: Number(metrics.currentPrice)}, {value: Math.max(0.1, 10 - Number(metrics.currentPrice))}]} cx="50%" cy="50%" innerRadius={65} outerRadius={72} stroke="none" startAngle={90} endAngle={-270} dataKey="value" cornerRadius={40}>
                             <Cell fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                             <Cell fill="transparent" />
                         </Pie>
                     </PieChart>
                 </ResponsiveContainer>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B', textShadow: '0 0 10px rgba(0,255,65,0.5)', marginBottom: '4px' }}>
                         ${Number(metrics.currentPrice).toFixed(4)}
                     </span>
                     <span style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Precio</span>
                 </div>
             </div>
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#F59E0B', fontWeight: '500' }}>Backing Target</h3>
                 <p style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px' }}>${Number(metrics.backing || 0).toFixed(4)} USD</p>
             </div>
         </div>

         {/* Contenedor Bóveda USDT */}
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(20, 20, 2, 0.4)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: '#F59E0B', filter: 'blur(80px)', opacity: 0.1 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ position: 'absolute', width: '90%', height: '90%', border: '4px solid rgba(245, 158, 11, 0.05)', borderRadius: '50%' }} />
                 <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid rgba(245, 158, 11, 0.3)', borderRadius: '50%', animation: 'spin 15s linear infinite' }} />
                 
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                     <span style={{ fontSize: '22px', fontWeight: '900', color: '#F59E0B', textShadow: '0 0 15px rgba(245,158,11,0.5)', marginBottom: '4px' }}>
                         ${Number(metrics.usdtVault || 0).toLocaleString()}
                     </span>
                     <span style={{ fontSize: '10px', color: 'rgba(245, 158, 11, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>USDT Total</span>
                 </div>
             </div>
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>Bóveda Central</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Respaldo Económico Global</p>
             </div>
         </div>

         {/* Contenedor Pool MDT (Liquidez) */}
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(2, 10, 20, 0.4)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: '#3B82F6', filter: 'blur(80px)', opacity: 0.1 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed rgba(59, 130, 246, 0.3)', borderRadius: '50%', animation: 'spin 20s linear infinite reverse' }} />
                 <div style={{ position: 'absolute', width: '80%', height: '80%', border: '3px solid rgba(59, 130, 246, 0.1)', borderRadius: '50%' }} />
                 
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                     <span style={{ fontSize: '22px', fontWeight: '900', color: '#3B82F6', textShadow: '0 0 15px rgba(59,130,246,0.6)', marginBottom: '4px' }}>
                         {Number(metrics.lpBalance || 0).toLocaleString()}
                     </span>
                     <span style={{ fontSize: '10px', color: 'rgba(59, 130, 246, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>MDT Pool</span>
                 </div>
             </div>
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>Pool de Liquidez</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Comisiones & Desarrollo</p>
             </div>
         </div>

         {/* Contenedor FOMO */}
         <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(20, 2, 2, 0.4)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: '#EF4444', filter: 'blur(80px)', opacity: 0.1 }}></div>
             
             <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {/* Círculos pulsantes para el efecto FOMO */}
                 <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed rgba(239, 68, 68, 0.3)', borderRadius: '50%', animation: 'spin 20s linear infinite' }} />
                 <div style={{ position: 'absolute', width: '80%', height: '80%', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '50%', animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.5 }} />
                 
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                     <span style={{ fontSize: '48px', fontWeight: '900', color: '#EF4444', textShadow: '0 0 25px rgba(239,68,68,0.8)', marginBottom: '4px' }}>
                         {metrics.fomoDays}
                     </span>
                     <span style={{ fontSize: '10px', color: 'rgba(239, 68, 68, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>Días Restantes</span>
                 </div>
             </div>
             <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>Próximo Halving</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Escasez de Red</p>
             </div>
         </div>
      </div>

      {/* Hierarchy List & Global Counters Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
         {/* HIERARCHY LIST */}
         <div className="glass-panel" style={{ padding: '32px', borderTop: '4px solid #F59E0B' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#F59E0B' }}>
              Lista Heredable (Jerarquía Actual)
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
              Esta es tu distribución de contrato. Cuando un referido nuevo ingresa con tu link, se pagan comisiones a esta lista, y tú avanzas posiciones.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', padding: '8px 24px', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>Pos</span>
                <span>Usuario</span>
                <span style={{ textAlign: 'right' }}>Billetera</span>
              </div>
              
              {(user.contractList || []).map((item, index) => {
                 const isCurrentUser = item.wallet === user.wallet;
                 const isDSF = item.user.includes('MENDIGO');
                 const walletShort = `${item.wallet.substring(0,6)}...${item.wallet.substring(item.wallet.length - 4)}`;

                 return (
                  <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '60px 1fr 1fr', 
                    padding: '20px 24px', 
                    background: isCurrentUser ? 'rgba(0, 230, 118, 0.15)' : 'rgba(0,0,0,0.4)', 
                    border: isCurrentUser ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    alignItems: 'center',
                    boxShadow: isCurrentUser ? '0 0 20px rgba(0,230,118,0.1)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: isCurrentUser ? 'var(--primary)' : isDSF ? 'var(--accent)' : 'var(--text-main)', opacity: isCurrentUser || isDSF ? 1 : 0.8 }}>
                      {item.position}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: isCurrentUser || isDSF ? 'bold' : '500', color: isCurrentUser ? 'var(--primary)' : isDSF ? 'var(--accent)' : '#F59E0B' }}>
                      {item.user} {isCurrentUser && <span style={{fontSize: '11px', background: 'var(--primary)', color: '#000', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px'}}>MÍO</span>}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text-muted)', textAlign: 'right' }}>
                      {walletShort}
                    </span>
                  </div>
                );
              })}
            </div>
         </div>

         {/* GLOBAL COUNTERS */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #3B82F6' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Ventas Globales</span>
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#3B82F6', textShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
                    {metrics.activeContracts.toLocaleString()}
                </span>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #10B981' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Acuñación Global (Minted)</span>
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#10B981', textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>
                    {Math.round(metrics.minted || 0).toLocaleString()} MDT
                </span>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #EF4444' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Quema Global (Burned)</span>
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#EF4444', textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>
                    {Math.round(metrics.burned || 0).toLocaleString()} MDT
                </span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
