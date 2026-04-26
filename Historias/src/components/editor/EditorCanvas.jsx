import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EditorCanvas({ content, overlayText, selectedSticker, user, trimStart, trimEnd }) {
  const [showReveal, setShowReveal] = useState(false);
  const canvasRef = useRef(null);

  const whatsapp = user?.whatsapp_number || '+XXX XXXX XXXX';
  const displayName = user?.display_name || user?.full_name || '@usuario';
  const instagram = user?.instagram_handle ? `@${user.instagram_handle}` : displayName;

  const triggerReveal = () => {
    setShowReveal(true);
    setTimeout(() => setShowReveal(false), 4000);
  };

  return (
    <div
      ref={canvasRef}
      className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-secondary"
      onClick={triggerReveal}
    >
      {/* Media content */}
      {content?.file_url ? (
        content.type === 'video' ? (
          <video
            src={content.file_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={content.file_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
          <div className="text-center">
            <span className="text-4xl">🎬</span>
            <p className="text-muted-foreground text-xs mt-3">Selecciona contenido para editar</p>
          </div>
        </div>
      )}

      {/* Overlay text */}
      {overlayText && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center px-6">
          <p className="text-white text-lg font-bold drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {overlayText}
          </p>
        </div>
      )}

      {/* Sticker overlay */}
      {selectedSticker && (
        <motion.div
          className="absolute bottom-20 right-4"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <span className="text-5xl">{selectedSticker}</span>
        </motion.div>
      )}

      {/* Impact Reveal Animation */}
      {showReveal && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#00e5ff' : '#7c4dff',
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 400,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: Math.random() * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Reveal card */}
          <motion.div
            className="glass-strong rounded-3xl p-6 mx-8 text-center"
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              bounce: 0.3,
              delay: 0.2,
            }}
          >
            <motion.p
              className="text-lg font-black gradient-primary-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {instagram}
            </motion.p>
            <motion.p
              className="text-xl font-bold text-white mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {whatsapp}
            </motion.p>
            <motion.div
              className="flex justify-center gap-1 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {['✨', '🔥', '✨'].map((emoji, i) => (
                <span key={i} className="text-lg">{emoji}</span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Trim indicators */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        <div className="glass rounded-full h-1 overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all"
            style={{ marginLeft: `${trimStart}%`, width: `${trimEnd - trimStart}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground font-mono">00:0{Math.floor(trimStart / 10)}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {content?.type === 'video' ? '00:30' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
