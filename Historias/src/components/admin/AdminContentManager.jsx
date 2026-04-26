import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, Trash2, Plus, Film, Image, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import GradientButton from '@/components/shared/GradientButton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminContentManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'video',
    copy_text: '',
    category: '',
    file_url: '',
    thumbnail_url: '',
  });

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['allContent'],
    queryFn: () => base44.entities.MediaContent.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MediaContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allContent'] });
      setShowForm(false);
      setForm({ title: '', type: 'video', copy_text: '', category: '', file_url: '', thumbnail_url: '' });
      toast.success('Contenido creado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allContent'] });
      toast.success('Contenido eliminado');
    },
  });

  const purgeAllMutation = useMutation({
    mutationFn: async () => {
      const all = await base44.entities.MediaContent.list('-created_date', 500);
      for (const item of all) {
        await base44.entities.MediaContent.delete(item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allContent'] });
      toast.success('Todo el contenido ha sido purgado');
    },
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [field]: file_url }));
    setUploading(false);
    toast.success('Archivo subido');
  };

  const typeIcon = { video: Film, photo: Image, script: FileText };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <GradientButton variant="small" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo Contenido
        </GradientButton>
        <button
          onClick={() => {
            if (confirm('¿Eliminar TODO el contenido? Esta acción no se puede deshacer.')) {
              purgeAllMutation.mutate();
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" /> Purgar Todo
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-3xl p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nombre del contenido"
                className="bg-white/5 border-white/10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Categoría</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="luxury, food, motivation..."
              className="bg-white/5 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Texto de copiado automático</Label>
            <Textarea
              value={form.copy_text}
              onChange={(e) => setForm({ ...form, copy_text: e.target.value })}
              placeholder="Texto que se copiará al compartir..."
              className="bg-white/5 border-white/10 rounded-xl h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Archivo Principal</Label>
              <label className="flex items-center justify-center gap-2 p-3 glass rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="text-xs">{form.file_url ? 'Cambiar' : 'Subir'}</span>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'file_url')} />
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Thumbnail</Label>
              <label className="flex items-center justify-center gap-2 p-3 glass rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <Image className="w-4 h-4" />
                <span className="text-xs">{form.thumbnail_url ? 'Cambiar' : 'Subir'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
              </label>
            </div>
          </div>

          <GradientButton
            className="w-full"
            onClick={() => createMutation.mutate({ ...form, is_active: true })}
            disabled={!form.title || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Contenido'}
          </GradientButton>
        </motion.div>
      )}

      {/* Content list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {content.map((item) => {
            const Icon = typeIcon[item.type] || FileText;
            return (
              <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.type} • {item.category || 'Sin categoría'}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
