import { createClient } from '@supabase/supabase-js';

// Browser/client-side client (lazy singleton)
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Keep the named export for convenience in client code
export const supabase = {
  storage: {
    from: (bucket: string) => getSupabase().storage.from(bucket),
  },
};

// Server-side admin client (bypasses RLS — server only, never exposed to browser)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type Story = {
  id: string;
  created_at: string;
  name: string;
  dob: string | null;
  father_name: string | null;
  mother_name: string | null;
  qualifications: string | null;
  achievements: string | null;
  hobbies: string | null;
  story_type: 'text' | 'audio' | 'video' | 'upload';
  story_text: string | null;
  photo_url: string | null;
  media_url: string | null;
  language: 'hi' | 'en';
  hidden: boolean;
};
