import { Crop, Type, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const tools = [
  { id: 'trim', icon: Crop, label: 'Recortar' },
  { id: 'text', icon: Type, label: 'Texto' },
  { id: 'sticker', icon: Smile, label: 'Estíkers' },
];

const stickers = ['🔥', '💎', '💰', '🚀', '⭐', '👑', '💪', '🎯', '✅', '📲', '💬', '🔗'];

export default function EditorToolbar({
  activeTool,
  setActiveTool,
  overlayText,
  setOverlayText,
  selectedSticker,
  setSelectedSticker,
  trimStart,
  setTrimStart,
  trimEnd,
  setTrimEnd,
}) {
  return (
    <div className="space-y-3">
      {/* Tool icons */}
      <div className="flex items-center justify-center gap-6">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${
                isActive ? 'glass text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tool.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool panels */}
      <AnimatePresence mode="wait">
        {activeTool === 'trim' && (
          <motion.div
            key="trim"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Inicio</label>
              <Slider
                value={[trimStart]}
                onValueChange={([v]) => setTrimStart(v)}
                max={trimEnd - 5}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Fin</label>
              <Slider
                value={[trimEnd]}
                onValueChange={([v]) => setTrimEnd(v)}
                min={trimStart + 5}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </motion.div>
        )}

        {activeTool === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4"
          >
            <Input
              placeholder="Escribe tu texto aquí..."
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground rounded-xl"
            />
          </motion.div>
        )}

        {activeTool === 'sticker' && (
          <motion.div
            key="sticker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4"
          >
            <div className="grid grid-cols-6 gap-3">
              {stickers.map((sticker) => (
                <button
                  key={sticker}
                  onClick={() => setSelectedSticker(selectedSticker === sticker ? null : sticker)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    selectedSticker === sticker
                      ? 'glass scale-110'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
