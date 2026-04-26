import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Gallery from '@/pages/Gallery';
import Editor from '@/pages/Editor';
import Sales from '@/pages/Sales';
import Academy from '@/pages/Academy';
import Wallet from '@/pages/Wallet';
import Profile from '@/pages/Profile';
import AdminPanel from '@/pages/admin/AdminPanel';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<Gallery />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/billetera" element={<Wallet />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
        
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AuthProvider>
  );
}
