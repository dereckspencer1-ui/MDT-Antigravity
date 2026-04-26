import { motion } from 'framer-motion';
import { X, MessageCircle, Instagram, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ShareSheet({ content, user, onClose }) {
  const [copied, setCopied] = useState(false);

  const whatsapp = user?.whatsapp_number || '';
  const displayName = user?.display_name || user?.full_name || '';
  const copyText = content?.copy_text || '¡Mira este contenido increíble! 🔥';
  const fullText = `${copyText}\n\n📲 ${displayName}\n📞 ${whatsapp}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Texto copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg glass-strong rounded-t-3xl p-6 space-y-5"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Compartir</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground whitespace-pre-line">{fullText}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 p-4 glass rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </button>
          <button
            onClick={() => window.open('https://instagram.com', '_blank')}
            className="flex flex-col items-center gap-2 p-4 glass rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-[10px] font-semibold">Instagram</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-4 glass rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              {copied ? (
                <Check className="w-6 h-6 text-primary" />
              ) : (
                <Copy className="w-6 h-6 text-primary" />
              )}
            </div>
            <span className="text-[10px] font-semibold">Copiar</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
