import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Création du client Supabase avec fallback robuste
// Si les variables d'environnement sont manquantes, on utilise un stub
// pour éviter les erreurs lors du build côté serveur
let supabase: any = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  // Client réel pour le navigateur avec env vars configurées
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Stub minimal pour éviter les erreurs en développement/build
  const noopAsync = async () => ({ data: null, error: null });
  const chainable = () => ({
    select: noopAsync,
    eq: () => ({ single: noopAsync, limit: noopAsync }),
    order: () => ({ limit: noopAsync }),
    insert: noopAsync,
    update: noopAsync,
    delete: noopAsync,
  });
  
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ error: null, data: {} }),
    },
    from: () => chainable(),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
      unsubscribe: () => ({}),
    }),
    removeChannel: () => {},
  } as any;
}

export { supabase };

