import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppShell() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const earnings = user?.total_earnings || 0;

  return (
    <div className="min-h-screen bg-background font-inter">
      <TopBar earnings={earnings} />
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
