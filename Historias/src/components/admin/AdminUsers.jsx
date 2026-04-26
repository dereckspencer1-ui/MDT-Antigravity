import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{users.length} socios registrados</p>
      </div>

      {users.map((u, i) => (
        <motion.div
          key={u.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-black">
              {(u.full_name || u.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{u.full_name || u.display_name || 'Sin nombre'}</p>
              {u.role === 'admin' && <Shield className="w-3 h-3 text-primary shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
            {u.whatsapp_number && (
              <p className="text-[10px] text-muted-foreground">📞 {u.whatsapp_number}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {u.is_licensed ? (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">Activo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <XCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">Sin Licencia</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              ${u.total_earnings || 0} ganados
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
