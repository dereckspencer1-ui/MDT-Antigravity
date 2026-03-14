import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, Users, Link as LinkIcon, Download, Fuel, Monitor, Zap } from 'lucide-react';

const WhitepaperSection = ({ number, title, icon: Icon, children }) => (
    <div className="glass-panel" style={{ 
        padding: '32px', 
        marginBottom: '24px', 
        position: 'relative', 
        overflow: 'hidden',
        borderLeft: '4px solid var(--primary)',
        background: 'linear-gradient(90deg, rgba(0,255,136,0.05) 0%, rgba(2,6,23,0.8) 100%)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)'
    }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', fontWeight: '900', color: 'rgba(255,255,255,0.02)', pointerEvents: 'none', lineHeight: 1 }}>
            {number}
        </div>
        
        <h3 style={{ fontSize: '22px', color: '#F59E0B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
            <Icon size={28} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }} /> {title}
        </h3>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '2.2', paddingLeft: '8px' }}>
            {children}
        </div>
    </div>
);

const BulletPoint = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{ marginTop: '6px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, boxShadow: '0 0 10px var(--primary)' }} />
        <p style={{ margin: 0, color: 'rgba(245, 158, 11, 0.85)', fontSize: '16px', lineHeight: '1.7', letterSpacing: '0.3px' }}>
            {children}
        </p>
    </div>
);

const Philosophy = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '0px 16px 64px 16px', maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px', animation: 'fadeInSlideUp 0.6s ease forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: '20px', color: 'var(--primary)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
                <Shield size={14} /> Auditoría Técnica v4.0
            </div>
            
            <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'var(--primary)', textShadow: '0 0 40px rgba(0, 230, 118, 0.3)', letterSpacing: '4px', marginBottom: '16px' }}>
                WHITEPAPER
            </h1>
            <h2 style={{ fontSize: '18px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '24px' }}>
                GUÍA TÉCNICA DE IMPLEMENTACIÓN
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                Arquitectura Smart Contract Factory — Modelo descentralizado, deflacionario y de ciclo cerrado.
            </p>
        </div>

        <WhitepaperSection number="1" title="El Motor: Smart Contract Factory" icon={Settings}>
            <BulletPoint>El ecosistema no reside en un solo contrato, sino en una Fábrica de Contratos.</BulletPoint>
            <BulletPoint>Cada vez que un usuario realiza la inyección de 6 USDT, la Fábrica despliega un Contrato Individual en la blockchain.</BulletPoint>
            <BulletPoint>Cada contrato gestiona sus propias 66 ventas de forma independiente.</BulletPoint>
            <BulletPoint>La destrucción de un contrato tras cumplir su ciclo no afecta al resto de la red.</BulletPoint>
        </WhitepaperSection>

        <WhitepaperSection number="2" title="Regla de Oro: Activación y Flujo" icon={Shield}>
            <BulletPoint>Solo se activa mediante 6 USDT provenientes de billetera externa (Phantom o similar en producción de Solana).</BulletPoint>
            <BulletPoint>La Fábrica emite 6 MDT vinculados al nuevo contrato individual.</BulletPoint>
            <BulletPoint><strong style={{color: '#F59E0B'}}>$5.00 USDT</strong> → $1.00 directo a cada una de las 5 billeteras activas de la lista ascendente.</BulletPoint>
            <BulletPoint><strong style={{color: '#F59E0B'}}>$0.50 USDT</strong> → Pool de Liquidez MDT para crear un respaldo de precio inquebrantable.</BulletPoint>
            <BulletPoint><strong style={{color: '#F59E0B'}}>$0.50 USDT</strong> → Billetera del Desarrollador (Cubre el micro-gas de Solana, garantizando el resto para retornos a inversores iniciales y fondeo de nuevos proyectos comunitarios).</BulletPoint>
        </WhitepaperSection>

        {/* --- SECCIÓN LA MATEMÁTICA DEL ÉXITO --- */}
        <div className="glass-panel" style={{ 
            padding: '48px', 
            marginTop: '32px', 
            marginBottom: '64px',
            position: 'relative', 
            overflow: 'hidden',
            animation: 'fadeInSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(2, 20, 10, 0.8) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.1)'
        }}>
            {/* Glow Background */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Zap size={32} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                    La Matemática del Éxito: <span style={{ color: 'var(--primary)' }}>El Poder del 6</span> 🚀
                </h2>
                <p style={{ color: 'rgba(245, 158, 11, 0.7)', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                    ¿Qué pasa cuando unes el mínimo esfuerzo con una progresión geométrica perfecta? En Mendigotoken Pro, no necesitas convencer al mundo entero, solo necesitas activar tu <strong style={{color: '#F59E0B'}}>Poder del 6</strong>.
                </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)' }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px auto' }}>Si tú logras solo 6 ventas de contratos y cada una de las personas en tus 5 niveles hace exactamente lo mismo, la red se expande de forma imparable, creando una máquina de 9,330 contratos trabajando para ti.</p>
                
                <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.4)' }}>
                    {/* Immersive 3D Coin Render */}
                    <img src="/power-of-6.jpg" alt="Poder del 6 - 9330 Contratos" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }}></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', borderLeft: '4px solid #F59E0B' }}>
                    <h4 style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Esfuerzo Realista</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>No te pedimos 100 ventas, solo 6. Es el 10% de esfuerzo que genera el 100% de los resultados al apalancarte en la red.</p>
                </div>
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Acuñación Blindada</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>Cada contrato activa la emisión de MDT proporcional a $6 USD, alimentando el Pool, la Quema, el Staking y el Bloque DeFi simultáneamente.</p>
                </div>
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', borderLeft: '4px solid #3B82F6', gridColumn: '1 / -1' }}>
                    <h4 style={{ color: '#3B82F6', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Escasez Garantizada</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>Con un suministro máximo de 66.6 millones, esta progresión de $6^5$ empuja el valor del token hacia arriba por pura ley de oferta y demanda.</p>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', color: '#F59E0B', fontWeight: 'bold', marginBottom: '16px' }}>💰 Tu Posición 5 te Espera</h3>
                <p style={{ color: 'rgba(245, 158, 11, 0.7)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Al entrar en la <strong style={{color: 'var(--primary)'}}>Posición 5</strong>, inicias tu camino hacia el Bloque Génesis. El sistema verifica tu actividad en tiempo real y te desplaza automáticamente mientras tu red de 6 en 6 construye tu libertad financiera.<br/><br/>
                    <em style={{ color: '#F59E0B' }}>"No es magia, es matemática aplicada al DeFi."</em>
                </p>
            </div>
        </div>

        <WhitepaperSection number="3" title="La Carátula y Desplazamiento" icon={Users}>
            <BulletPoint>Al activarse, el contrato registra un alias visible en la lista de 5 posiciones.</BulletPoint>
            <BulletPoint>Al generar una venta (invitación): se elimina la billetera #1 (la más antigua de esa rama), y las demás suben un nivel.</BulletPoint>
            <BulletPoint>El nuevo comprador entra en la Posición #5, empujando la red.</BulletPoint>
            <BulletPoint>No se permite duplicar direcciones o alias dentro de una misma lista activa.</BulletPoint>
            <BulletPoint>Al llegar a la venta 66 (cuando el propietario sube y sale de la #1 de sus ramas de nivel 5), el contrato se considera "completado" y su instancia en memoria es congelada.</BulletPoint>
        </WhitepaperSection>

        <WhitepaperSection number="4" title="Billetera Interna y Economía MDT" icon={LinkIcon}>
            <BulletPoint>La billetera interna dApp solo permite enviar y recibir MDT entre usuarios (P2P).</BulletPoint>
            <BulletPoint>Los USDT de la inyección original NO se mueven para transacciones entre billeteras. El USDT va directamente a Metamask en su fase de subida de niveles.</BulletPoint>
            <BulletPoint>Los USDT de la Pool existen estrictamente como reserva de valor inmutable para el retiro final.</BulletPoint>
            <BulletPoint>Circuito cerrado que protege la economía del ecosistema sin inflación externa.</BulletPoint>
        </WhitepaperSection>

        <WhitepaperSection number="5" title="Protocolo de Retiro (Burn Mechanism)" icon={Download}>
            <BulletPoint>Quema del 100%: Al retirar, todos los MDT vinculados al correo del usuario se queman irreversiblemente.</BulletPoint>
            <BulletPoint>El contrato oráculo calcula el valor proporcional exacto en USDT según el total de respaldo / MDT circulante.</BulletPoint>
            <BulletPoint>Existe una retención (sanción) del 6.6% que no se le da al usuario, sino que se reinyecta a la Pool de Liquidez.</BulletPoint>
            <BulletPoint>El usuario recibe el 93.4% del equivalente USDT directamente en su billetera externa vinculada.</BulletPoint>
        </WhitepaperSection>

        <WhitepaperSection number="6" title="Gestión de Red (Solana Ultra-Fast Gas)" icon={Fuel}>
            <BulletPoint>Para asegurar que los usuarios no paguen comisiones de red por operaciones internas, el Gas (SOL) se toma de la fracción de los <strong>$0.50 USDT</strong> del Desarrollador, la cual gracias a Solana, sobra casi en su totalidad para financiar el ecosistema.</BulletPoint>
            <BulletPoint>Las billeteras externas de los usuarios solo se comunican con la Fábrica central (entrada) y la Pool (salida del MDT).</BulletPoint>
            <BulletPoint>La comunicación P2P o de escalafón ocurre estrictamente entre sub-contratos gestionados vía la Fábrica a velocidades de &lt;400ms.</BulletPoint>
        </WhitepaperSection>

        <WhitepaperSection number="7" title="Interfaz DApp Desktop" icon={Monitor}>
            <BulletPoint><strong>Dashboard Dashboard:</strong> Visualización global del "Edificio" (Contratos vivos vs Completados) y curvas de valoración Spline.</BulletPoint>
            <BulletPoint><strong>Métrica de Actividad FOMO:</strong> (Futuro) Cronómetro global vinculado al ritmo de acuñación para inyectar escasez acelerada al sistema.</BulletPoint>
            <BulletPoint><strong>Panel de Retiro (Quema):</strong> Cálculo asíncrono en tiempo real del valor exacto de tus tokens frente a la bóveda.</BulletPoint>
        </WhitepaperSection>

    </div>
  );
};

export default Philosophy;
