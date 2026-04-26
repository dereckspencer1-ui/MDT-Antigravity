import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentCard({ item, onClick }) {
  const isVideo = item.type === 'video';
  const isScript = item.type === 'script';

  if (isScript) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onClick?.(item)}
        className="glass rounded-3xl p-5 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl gradient-primary-text font-black">"</span>
          <div className="flex-1">
            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
              {item.copy_text || item.title}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{item.title}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick?.(item)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group"
    >
      <div className={`relative ${isVideo ? 'aspect-[9/12]' : 'aspect-[4/3]'} bg-secondary`}>
        {item.thumbnail_url || item.file_url ? (
          <img
            src={item.thumbnail_url || item.file_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Sin preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wide truncate">
            {item.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
