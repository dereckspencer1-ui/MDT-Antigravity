import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, TrendingUp, Package } from 'lucide-react';

const COLORS = ['#00e5ff', '#7c4dff', '#ff4081', '#ffc107'];

export default function AdminMetrics() {
  const { data: payments = [] } = useQuery({
    queryKey: ['allPayments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const { data: content = [] } = useQuery({
    queryKey: ['allContent'],
    queryFn: () => base44.entities.MediaContent.list('-created_date', 500),
  });

  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const platformFees = completedPayments.reduce((s, p) => s + (p.platform_fee || 0), 0);
  const licensedUsers = users.filter(u => u.is_licensed);

  const stats = [
    { label: 'Ingresos Totales', value: `$${totalRevenue}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Socios Activos', value: licensedUsers.length, icon: Users, color: 'text-primary' },
    { label: 'Comisión Plataforma', value: `$${platformFees}`, icon: TrendingUp, color: 'text-accent' },
    { label: 'Contenido', value: content.length, icon: Package, color: 'text-yellow-400' },
  ];

  const contentByType = [
    { name: 'Videos', value: content.filter(c => c.type === 'video').length },
    { name: 'Fotos', value: content.filter(c => c.type === 'photo').length },
    { name: 'Scripts', value: content.filter(c => c.type === 'script').length },
  ].filter(c => c.value > 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4"
          >
            <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content breakdown */}
      {contentByType.length > 0 && (
        <div className="glass rounded-3xl p-5">
          <h3 className="text-sm font-bold mb-4">Contenido por Tipo</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contentByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30,30,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {contentByType.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-muted-foreground">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
