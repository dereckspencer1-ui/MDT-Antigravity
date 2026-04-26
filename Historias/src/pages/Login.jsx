import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import GradientButton from '@/components/shared/GradientButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('¡Bienvenido!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black gradient-primary-text">HISTORIAS</h1>
          <p className="text-sm text-muted-foreground mt-2">Inicia sesión en tu franquicia</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="bg-white/5 border-white/10"
            />
          </div>
          <GradientButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </GradientButton>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes cuenta? <Link to="/register" className="text-primary hover:underline">Solicita un acceso</Link>
        </p>
      </div>
    </div>
  );
}
