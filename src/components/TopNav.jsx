import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, FileText, Download } from 'lucide-react';
import YinYang from './YinYang';
import { resetToGenesis } from '../store/mockDB';

const TopNav = ({ user }) => {
    const [animations, setAnimations] = useState([]); // [{id, type, amount}]
    const prevBalance = React.useRef(user?.mdtBalance || 0);
    const navigate = useNavigate();
    const location = useLocation();
    const [isProTheme, setIsProTheme] = useState(localStorage.getItem('mdt_theme') === 'pro');

    useEffect(() => {
        const handleTheme = () => setIsProTheme(localStorage.getItem('mdt_theme') === 'pro');
        window.addEventListener('theme-changed', handleTheme);
        return () => window.removeEventListener('theme-changed', handleTheme);
    }, []);

    // Detect balance changes and trigger floating animation
    useEffect(() => {
        if (user && user.mdtBalance !== undefined) {
            const currentLabel = (user.mdtBalance || 0);
            const previousLabel = prevBalance.current;

            const diff = currentLabel - previousLabel;

            if (Math.abs(diff) > 0.001) {
                // Create a unique ID for the animation
                const id = Date.now();
                const type = diff > 0 ? 'gain' : 'loss';
                const absDiff = Math.abs(diff);

                setAnimations(prev => [...prev, { id, type, amount: absDiff }]);

                // Remove animation from state after it finishes (1s)
                setTimeout(() => {
                    setAnimations(prev => prev.filter(anim => anim.id !== id));
                }, 1000);
            }

            prevBalance.current = currentLabel;
        }
    }, [user?.mdtBalance]);

    const handleLogout = () => {
        localStorage.removeItem('mdt_current_user');
        window.dispatchEvent(new Event('session-changed'));
        navigate('/');
    };

    const currentPath = location.pathname;

    return (
        <header style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderBottom: '1px solid rgba(0, 230, 118, 0.1)',
            background: 'rgba(2, 6, 23, 0.6)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible'
                }}>
                    <img src="/new-logo-neon.jpg" alt="MDT Logo" style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain',
                        mixBlendMode: 'screen', /* Magically removes the black background */
                        filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))'
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '900', letterSpacing: '1px', color: 'var(--foreground)' }}>
                        @{user?.username || 'Usuario'}
                    </h1>
                </div>
            </div>

            {/* Navigation Pills */}
            <div style={{ display: 'flex', gap: '8px' }} translate="no">
                <NavPill label="Dashboard" icon={<LayoutDashboard size={16} />} isActive={currentPath === '/dashboard'} path="/dashboard" />
                <NavPill label="Whitepaper" icon={<FileText size={16} />} isActive={currentPath === '/whitepaper'} path="/whitepaper" />
                <NavPill label="Retiro" icon={<Download size={16} />} isActive={currentPath === '/red'} path="/red" />
            </div>

            {/* Wallet & Auth Control */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                {/* Live User Balance with Floating Animation */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        color: '#F59E0B',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(245, 158, 11, 0.1)',
                        height: '40px'
                    }}>
                        {(user?.mdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MDT
                    </div>

                    {/* Render active floating animations */}
                    {animations.map(anim => {
                        const isGain = anim.type === 'gain';
                        return (
                            <div key={anim.id} style={{
                                position: 'absolute',
                                top: 0,
                                right: '50%',
                                transform: 'translateX(50%)',
                                color: isGain ? '#00E676' : '#EF4444',
                                fontWeight: '900',
                                fontSize: '18px',
                                textShadow: isGain ? '0 0 10px rgba(0,255,100,0.8)' : '0 0 10px rgba(239,68,68,0.8)',
                                pointerEvents: 'none',
                                animation: 'floatUpAndFade 1s ease-out forwards',
                                zIndex: 100,
                                whiteSpace: 'nowrap'
                            }}>
                                {isGain ? '+' : '-'}${anim.amount.toFixed(2)} USD
                            </div>
                        );
                    })}
                </div>

                {/* THEME TOGGLE */}
                <button
                    onClick={() => {
                        const newTheme = isProTheme ? 'dark' : 'pro';
                        localStorage.setItem('mdt_theme', newTheme);
                        window.dispatchEvent(new Event('theme-changed'));
                    }}
                    style={{
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    title={isProTheme ? "Modo Oscuro (MDT Clásico)" : "Modo Claro (MDT PRO)"}
                >
                    <YinYang size={32} isPro={isProTheme} />
                </button>

                {(user?.email === 'dereckspencer1@gmail.com' || user?.email === 'admin@mendigotoken.com' || user?.email === 'fundador@mendigotoken.com' || user?.username?.toUpperCase() === 'FUNDADOR') && (
                    <button
                        onClick={async () => {
                            if (window.confirm('¿Borrar toda la red y volver al estado previo al Génesis?')) {
                                const { resetToGenesis } = await import('../store/mockDB');
                                await resetToGenesis();
                            }
                        }}
                        style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: '12px', padding: '0 12px', borderRadius: '4px', height: '40px', display: 'flex', alignItems: 'center' }}>
                        ⚠️ PURGAR RED ⚠️
                    </button>
                )}
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', padding: '0 16px', borderRadius: '8px', height: '40px', display: 'flex', alignItems: 'center' }}>
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};

import { Link } from 'react-router-dom';

const NavPill = ({ label, icon, isActive, path }) => (
    <Link
        to={path}
        style={{
            padding: '8px 16px',
            background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '8px',
            fontWeight: isActive ? '600' : '500',
            fontSize: '14px',
            textDecoration: 'none',
            cursor: 'pointer',
            border: isActive ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            boxShadow: isActive ? '0 0 10px rgba(0, 255, 136, 0.1)' : 'none',
            height: '36px',
            whiteSpace: 'nowrap'
        }}
    >
        {icon}
        {label}
    </Link>
);

export default TopNav;
