import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';

export default function Sales() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['myReferrals'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.Payment.filter({ referrer_email: me.email, status: 'completed' }, '-created_date', 100);
    },
  });

  const totalEarnings = payments.reduce((sum, p) => sum + (p.referrer_commission || 0), 0);
  const thisMonth = payments.filter(p => {
    const d = new Date(p.created_date || p.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Build chart data from last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayPayments = payments.filter(p => {
      const d = new Date(p.created_date || p.created_at);
      return d.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('es', { weekday: 'short' }),
      ventas: dayPayments.length,
      monto: dayPayments.reduce((s, p) => s + (p.referrer_commission || 0), 0),
    };
  });

  return (
    <div className="px-4 pt-4 space-y-5">
      <h1 className="text-xl font-bold">Factura de Ventas</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ventas del Mes', value: thisMonth.length, icon: Target, color: 'text-primary' },
          { label: 'Ganado este Mes', value: `$${thisMonth.reduce((s, p) => s + (p.referrer_commission || 0), 0)}`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Total Referidos', value: user?.referral_count || 0, icon: Users, color: 'text-accent' },
          { label: 'Total Ganado', value: `$${totalEarnings}`, icon: Zap, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-3xl p-5"
      >
        <h3 className="text-sm font-bold mb-4">Últimos 7 Días</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(30,30,30,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="monto" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#7c4dff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
