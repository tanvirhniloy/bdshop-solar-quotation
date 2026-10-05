import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || '').trim();
  if (!['Downloaded','Generated','Status Changed'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  const { error } = await supabase.from('quotation_activity').insert({ quotation_id: id, user_id: user.id, action, metadata: body.metadata || {} });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
