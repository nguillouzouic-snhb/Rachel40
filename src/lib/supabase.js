import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification : si les vars ne sont pas lues, on a un problème
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Supabase non configuré. Vérifie ton fichier .env :\n' +
    '  VITE_SUPABASE_URL\n' +
    '  VITE_SUPABASE_ANON_KEY\n' +
    'Puis redémarre : npm run dev'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})