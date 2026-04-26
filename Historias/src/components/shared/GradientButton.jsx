import { cn } from '@/lib/utils';

export default function GradientButton({ children, className, variant = 'primary', ...props }) {
  const base = 'font-semibold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center';

  const variants = {
    primary: 'gradient-primary text-black px-6 py-3 text-sm shadow-lg shadow-primary/20',
    outline: 'border border-primary/40 text-primary px-6 py-3 text-sm hover:bg-primary/10',
    ghost: 'text-muted-foreground px-4 py-2 text-sm hover:text-foreground hover:bg-white/5',
    small: 'gradient-primary text-black px-4 py-2 text-xs shadow-md shadow-primary/20',
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
