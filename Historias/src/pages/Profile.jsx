import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Phone, Instagram, LogOut, Save, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GradientButton from '@/components/shared/GradientButton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState({
    display_name: '',
    whatsapp_number: '',
    instagram_handle: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || user.full_name || '',
        whatsapp_number: user.whatsapp_number || '',
        instagram_handle: user.instagram_handle || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Perfil actualizado');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-3">
          <span className="text-3xl font-black text-black">
            {(form.display_name || user?.email || 'U')[0].toUpperCase()}
          </span>
        </div>
        <h2 className="text-lg font-bold">{form.display_name || 'Usuario'}</h2>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        {user?.is_licensed && (
          <div className="flex items-center gap-1 mt-2 px-3 py-1 rounded-full glass">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Licencia Activa</span>
          </div>
        )}
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-5 space-y-4"
      >
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Nombre para mostrar
          </Label>
          <Input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder="Tu nombre o marca"
            className="bg-white/5 border-white/10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Número de WhatsApp
          </Label>
          <Input
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            placeholder="+506 8888 8888"
            className="bg-white/5 border-white/10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Instagram className="w-3.5 h-3.5" /> Instagram Handle
          </Label>
          <Input
            value={form.instagram_handle}
            onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
            placeholder="@tuusuario"
            className="bg-white/5 border-white/10 rounded-xl"
          />
        </div>

        <GradientButton
          className="w-full"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </GradientButton>
      </motion.div>

      {/* Admin access */}
      {user?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="glass rounded-2xl p-4 w-full flex items-center justify-between hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Panel de Administrador</span>
          </div>
          <span className="text-xs text-muted-foreground">→</span>
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Cerrar Sesión</span>
      </button>
    </div>
  );
}
