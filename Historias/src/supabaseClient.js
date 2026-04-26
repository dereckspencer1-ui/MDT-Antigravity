import { createClient } from '@supabase/supabase-js';

// Conexión forzada y pura para evitar errores de inyección del archivo .env en entornos Vercel
const supabaseUrl = 'https://isdkhmgxnyullvymirwi.supabase.co';
const supabaseAnonKey = 'sb_publishable_CTsVCU0cUgkgVJmLWtC-Ng_lipjBKIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
