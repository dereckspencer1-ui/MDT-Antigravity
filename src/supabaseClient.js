import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://isdkhmgxnyullvymirwi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CTsVCU0cUgkgVJmLWtC-Ng_lipjBKIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
