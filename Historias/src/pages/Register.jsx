import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import GradientButton from '@/components/shared/GradientButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Register() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [referral, setReferral] = useState(refCode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!referral) {
      toast.error('¡El código de afiliado es OBLIGATORIO para registrarte!');
      return;
    }

    setLoading(true);
    
    // 1. Validate ref exists (mock check for demo, in prod check DB)
    const { data: refUser } = await supabase.from('profiles').select('id').eq('affiliate_id', referral).single();
    
    if (!refUser && referral !== 'ADMIN') { // Allow ADMIN as fallback
        toast.error('Código de referido inválido.');
        setLoading(false);
        return;
    }

    // 2. Sign up
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const myAffiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
      // 3. Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: name,
        whatsapp_number: whatsapp,
        affiliate_id: myAffiliateId,
        referred_by: referral,
        is_licensed: false,
      });

      toast.success('Cuenta creada. Ya puedes iniciar sesión.');
      navigate('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black gradient-primary-text">HISTORIAS</h1>
          <p className="text-sm text-muted-foreground mt-2">Únete a la plataforma</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="bg-white/5 border-white/10"
            />
          </div>
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
            <Label>WhatsApp</Label>
            <Input 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              required 
              placeholder="+506 8888 8888"
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
          <div className="space-y-2">
            <Label className="text-primary">Código de Afiliado (Obligatorio)</Label>
            <Input 
              value={referral} 
              onChange={(e) => setReferral(e.target.value)} 
              required 
              readOnly={!!refCode}
              placeholder="Introduce código de invitación"
              className={`border-primary/50 ${refCode ? 'bg-primary/10' : 'bg-white/5'}`}
            />
            {!referral && (
              <p className="text-[10px] text-destructive">No puedes ingresar sin un código válido</p>
            )}
          </div>
          <GradientButton type="submit" className="w-full" disabled={loading || !referral}>
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </GradientButton>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
