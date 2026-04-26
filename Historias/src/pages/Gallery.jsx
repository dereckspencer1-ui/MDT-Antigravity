import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import TabSwitcher from '@/components/shared/TabSwitcher';
import ContentCard from '@/components/shared/ContentCard';
import GradientButton from '@/components/shared/GradientButton';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'video', label: 'Vídeos' },
  { id: 'photo', label: 'Fotos' },
  { id: 'script', label: 'Scripts' },
];

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('video');
  const navigate = useNavigate();

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['mediaContent', activeTab],
    queryFn: () => base44.entities.MediaContent.filter({ type: activeTab, is_active: true }, '-created_date', 50),
  });

  const handleItemClick = (item) => {
    if (item.type === 'script') return;
    navigate(`/editor?id=${item.id}`);
  };

  return (
    <div className="px-4 pt-4 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <GradientButton variant="small" onClick={() => navigate('/editor')}>
          <Plus className="w-4 h-4 mr-1" />
          Crear
        </GradientButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : content.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-muted-foreground text-sm">No hay contenido disponible aún</p>
          <p className="text-muted-foreground/60 text-xs mt-1">El contenido premium aparecerá aquí</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'script' ? (
              <div className="space-y-3">
                {content.map((item) => (
                  <ContentCard key={item.id} item={item} onClick={handleItemClick} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {content.map((item) => (
                  <ContentCard key={item.id} item={item} onClick={handleItemClick} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => navigate('/editor?tool=text')}
          className="glass rounded-2xl py-3 px-4 text-left hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="text-xs font-bold gradient-primary-text uppercase tracking-wide">
            Agregar Texto Dinámico
          </span>
        </button>
        <button
          onClick={() => navigate('/editor?tool=sticker')}
          className="glass rounded-2xl py-3 px-4 text-left hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="text-xs font-bold gradient-primary-text uppercase tracking-wide">
            Aplicar Estíker
          </span>
        </button>
      </div>
    </div>
  );
}
