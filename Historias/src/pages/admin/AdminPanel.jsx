import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Users, BarChart3, Trash2 } from 'lucide-react';
import TabSwitcher from '@/components/shared/TabSwitcher';
import AdminContentManager from '@/components/admin/AdminContentManager';
import AdminMetrics from '@/components/admin/AdminMetrics';
import AdminUsers from '@/components/admin/AdminUsers';

const tabs = [
  { id: 'content', label: 'Contenido' },
  { id: 'metrics', label: 'Métricas' },
  { id: 'users', label: 'Socios' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('content');
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Acceso denegado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/perfil')}
          className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Panel de Admin</h1>
          <p className="text-xs text-muted-foreground">Control total de Historias</p>
        </div>
      </div>

      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'content' && <AdminContentManager />}
      {activeTab === 'metrics' && <AdminMetrics />}
      {activeTab === 'users' && <AdminUsers />}
    </div>
  );
}
