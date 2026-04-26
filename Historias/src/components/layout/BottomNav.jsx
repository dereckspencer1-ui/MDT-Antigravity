import { Link, useLocation } from 'react-router-dom';
import { BarChart3, GraduationCap, Wallet, User } from 'lucide-react';

const navItems = [
  { icon: BarChart3, label: 'Ventas', path: '/ventas' },
  { icon: GraduationCap, label: 'Academy', path: '/academy' },
  { icon: Wallet, label: 'Billetera', path: '/billetera' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full gradient-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
