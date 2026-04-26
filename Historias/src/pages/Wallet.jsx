import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, DollarSign, ArrowUpRight, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Wallet() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.Payment.filter({ referrer_email: me.email, status: 'completed' }, '-created_date', 50);
    },
  });

  const earnings = user?.total_earnings || 0;
  const referralCount = user?.referral_count || 0;
  const affiliateId = user?.affiliate_id || user?.id || 'N/A';
  const referralLink = `https://wa.me/?text=${encodeURIComponent(`¡Únete a Historias! Usa mi código: ${affiliateId}`)}`;

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    toast.success('Link de referido copiado');
  };

  const stats = [
    { label: 'Ganancias Totales', value: `$${earnings}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Referidos Activos', value: referralCount, icon: Users, color: 'text-primary' },
    { label: 'Comisión por Venta', value: '$25', icon: TrendingUp, color: 'text-accent' },
  ];

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Earnings hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-3xl p-6 text-center"
      >
        <p className="text-xs font-semibold text-black/60 uppercase tracking-wider">Mis Ganancias</p>
        <p className="text-5xl font-black text-black mt-2">${earnings}</p>
        <p className="text-xs text-black/60 mt-2">USD acumulados</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-3 text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral link */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Tu Link de Referido</h3>
          <button
            onClick={copyReferralLink}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Copy className="w-4 h-4 text-primary" />
          </button>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-muted-foreground break-all font-mono">
            Código: {affiliateId}
          </p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold">Transacciones Recientes</h3>
        {payments.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-muted-foreground text-xs">No hay transacciones aún</p>
            <p className="text-muted-foreground/60 text-[10px] mt-1">Comparte tu link para ganar comisiones</p>
          </div>
        ) : (
          payments.map((payment, i) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Comisión Referido</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(payment.created_date || payment.created_at).toLocaleDateString('es')}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-green-400">+${payment.referrer_commission}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
