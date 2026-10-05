import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTotals } from '@/lib/quotation/calculations';
import { quotationPayloadSchema } from '@/lib/validation/quotation';

function errorResponse(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('quotations')
    .select('*, profiles!quotations_created_by_fkey(full_name,email), quotation_items(*)')
    .eq('id', id)
    .single();
  if (error || !data) return errorResponse('Quotation not found', 404);
  const items = [...(data.quotation_items || [])].sort((a, b) => a.sort_order - b.sort_order);
  return NextResponse.json({ data: { ...data, items, creator: data.profiles || null } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);

  try {
    const raw = await request.json();
    const parsed = quotationPayloadSchema.safeParse({ ...raw, id });
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message || 'Invalid quotation data');
    const input = parsed.data;
    const totals = calculateTotals(input.items, input.discount, input.tax);
    const payload = {
      ...input,
      ...totals,
      items: input.items.map((item, index) => ({ ...item, total_price: undefined, sort_order: index })),
    };
    const { data, error } = await supabase.rpc('update_quotation_transaction', { p_id: id, p_data: payload });
    if (error) return errorResponse(error.message.includes('Forbidden') ? 'You do not have permission to edit this quotation.' : error.message, error.message.includes('Forbidden') ? 403 : 500);
    return NextResponse.json({ data: { ...data, totals } });
  } catch {
    return errorResponse('Unable to update quotation.', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') return errorResponse('Admin permission required', 403);

  const { error } = await supabase.from('quotations').delete().eq('id', id);
  if (error) return errorResponse(error.message, 500);
  return NextResponse.json({ ok: true });
}
