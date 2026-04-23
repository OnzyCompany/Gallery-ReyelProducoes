import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://asfqluyekvureosyhlgg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZnFsdXlla3Z1cmVvc3lobGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MjMyMTAsImV4cCI6MjA4MTk5OTIxMH0.JEvFj5suvt1jGQivHMOClHJ0bXSl1MkaRcdV4LpA1KY';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Usando credenciais padrão do Supabase. Para segurança, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
