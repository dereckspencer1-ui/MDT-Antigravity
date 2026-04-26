import { motion } from 'framer-motion';
import { Play, Lock, BookOpen, Video, Star } from 'lucide-react';

const modules = [
  {
    title: 'Bienvenida a Historias',
    description: 'Aprende cómo funciona el sistema de micro-franquicia',
    duration: '5 min',
    locked: false,
    icon: '🎯',
  },
  {
    title: 'Cómo Editar Contenido',
    description: 'Domina las herramientas de edición como un pro',
    duration: '8 min',
    locked: false,
    icon: '✂️',
  },
  {
    title: 'Estrategias de Venta',
    description: 'Técnicas para cerrar ventas por WhatsApp',
    duration: '12 min',
    locked: false,
    icon: '💰',
  },
  {
    title: 'Efecto de Revelación',
    description: 'Cómo usar la capa dinámica de impacto',
    duration: '6 min',
    locked: true,
    icon: '💎',
  },
  {
    title: 'Escalando tu Negocio',
    description: 'De 0 a 100 referidos en 30 días',
    duration: '15 min',
    locked: true,
    icon: '🚀',
  },
];

export default function Academy() {
  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Academy</h1>
        <p className="text-xs text-muted-foreground mt-1">Aprende, domina y genera ingresos</p>
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-black">Tu Progreso</p>
            <p className="text-xs text-black/60">3 de 5 módulos completados</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <Star key={i} className="w-4 h-4 text-black fill-black" />
            ))}
            {[4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 text-black/30" />
            ))}
          </div>
        </div>
        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-black/40 rounded-full" />
        </div>
      </motion.div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-4 flex items-center gap-4 ${
              mod.locked ? 'opacity-50' : 'hover:bg-white/10 cursor-pointer'
            } transition-all active:scale-[0.98]`}
          >
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shrink-0">
              <span className="text-xl">{mod.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate">{mod.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{mod.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Video className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">{mod.duration}</span>
              </div>
            </div>
            <div className="shrink-0">
              {mod.locked ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
