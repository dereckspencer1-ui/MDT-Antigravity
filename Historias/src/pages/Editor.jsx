import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Crop, Type, Smile, Share2, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import GradientButton from '@/components/shared/GradientButton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import EditorToolbar from '@/components/editor/EditorToolbar';
import EditorCanvas from '@/components/editor/EditorCanvas';
import ShareSheet from '@/components/editor/ShareSheet';

export default function Editor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('id');
  const initialTool = urlParams.get('tool');

  const [activeTool, setActiveTool] = useState(initialTool || null);
  const [overlayText, setOverlayText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  const { data: content } = useQuery({
    queryKey: ['mediaContent', contentId],
    queryFn: () => base44.entities.MediaContent.filter({ id: contentId }),
    enabled: !!contentId,
    select: (data) => data?.[0],
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleShare = async () => {
    const copyText = content?.copy_text || '¡Mira este contenido increíble! 🔥';
    const whatsappNumber = user?.whatsapp_number || '';
    const displayName = user?.display_name || user?.full_name || '';

    const fullText = `${copyText}\n\n📲 ${displayName}\n📞 ${whatsappNumber}`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success('Texto copiado al portapapeles');
    } catch {
      // Fallback
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Historias',
          text: fullText,
        });
      } catch {
        // User cancelled
      }
    } else {
      setShowShare(true);
    }
  };

  return (
    <div className="px-4 pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {content?.title || 'Nuevo Proyecto'}
          </span>
        </div>
        <div />
      </div>

      {/* Canvas */}
      <EditorCanvas
        content={content}
        overlayText={overlayText}
        selectedSticker={selectedSticker}
        user={user}
        trimStart={trimStart}
        trimEnd={trimEnd}
      />

      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        overlayText={overlayText}
        setOverlayText={setOverlayText}
        selectedSticker={selectedSticker}
        setSelectedSticker={setSelectedSticker}
        trimStart={trimStart}
        setTrimStart={setTrimStart}
        trimEnd={trimEnd}
        setTrimEnd={setTrimEnd}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTool('text')}
          className="glass rounded-2xl py-3 text-center hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="text-[10px] font-bold gradient-primary-text uppercase tracking-wider">
            Agregar Texto
          </span>
        </button>
        <button
          onClick={() => setActiveTool('sticker')}
          className="glass rounded-2xl py-3 text-center hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="text-[10px] font-bold gradient-primary-text uppercase tracking-wider">
            Aplicar Estíker
          </span>
        </button>
        <GradientButton variant="small" className="text-[10px]" onClick={handleShare}>
          Listo para Compartir
        </GradientButton>
      </div>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShare && (
          <ShareSheet
            content={content}
            user={user}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
