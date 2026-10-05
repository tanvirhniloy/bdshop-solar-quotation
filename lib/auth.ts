import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/quotation';

export async function getSessionContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { user, profile: profile as Profile | null };
}

export async function requireUser() {
  const context = await getSessionContext();
  if (!context.user) redirect('/login');
  return context as { user: NonNullable<typeof context.user>; profile: Profile | null };
}
