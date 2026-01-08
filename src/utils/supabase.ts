import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Do not throw when env vars are missing; use empty defaults and a lightweight stub
// to avoid build-time prerender errors when env vars are not configured yet.
let supabase: any = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
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
