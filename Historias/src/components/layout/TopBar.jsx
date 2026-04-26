import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar({ earnings = 0 }) {
  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight gradient-primary-text">HISTORIAS</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">MIS GANANCIAS:</span>
            <span className="text-sm font-bold gradient-primary-text">${earnings.toFixed(0)}</span>
          </div>
          <button className="relative p-2 rounded-full glass hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full gradient-primary" />
          </button>
        </div>
      </div>
    </header>
  );
}
