import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build or in environments without env vars, avoid throwing — provide a noop/stub
// so server-side prerender won't fail. Runtime client code should rely on the real
// `NEXT_PUBLIC_SUPABASE_*` vars being set in production.
let supabase: any = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Minimal stub implementing commonly used methods to avoid runtime exceptions
  const noopAsync = async () => ({ data: null, error: null });
  const chainable = () => ({ select: noopAsync, eq: () => ({ single: noopAsync, limit: noopAsync }), order: () => ({ limit: noopAsync }), insert: noopAsync });
  supabase = {
    auth: { getSession: async () => ({ data: { session: null } }), signOut: async () => ({ error: null }) },
    from: () => chainable(),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}), unsubscribe: () => ({}) }),
    removeChannel: () => {},
  } as any;
}

export { supabase };

