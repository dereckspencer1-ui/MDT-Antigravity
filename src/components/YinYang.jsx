import React from 'react';

const YinYang = ({ size = 24, isPro = false }) => {
  // White color for the light side
  const cLight = '#ffffff';
  
  // Theme-sensitive vivid color for the dark/colored side
  // Morado para el tema Blanco(Pro), Esmeralda para el tema Oscuro(Clásico)
  const cColor = isPro ? '#8b5cf6' : '#00e676';

  return (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        style={{ 
            transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
            transform: `rotate(${isPro ? 180 : 0}deg)`,
            filter: `drop-shadow(0 0 8px ${cColor})`
        }}
    >
      {/* Background circle (Left Side + Top Right scooped out) */}
      <circle cx="50" cy="50" r="48" fill={cLight} stroke={cColor} strokeWidth="1"/>
      
      {/* Right Side S Curve (Right arc, plus bottom left scoop, minus top right scoop) */}
      <path d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 0 50 50 A 24 24 0 0 1 50 2" fill={cColor} />
      
      {/* Top Dot (Enclosed in the white background) */}
      <circle cx="50" cy="26" r="8" fill={cColor} />
      
      {/* Bottom Dot (Enclosed in the colored S curve) */}
      <circle cx="50" cy="74" r="8" fill={cLight} />
    </svg>
  );
};

export default YinYang;
