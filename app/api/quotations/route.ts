import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTotals } from '@/lib/quotation/calculations';
import { quotationPayloadSchema } from '@/lib/validation/quotation';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(sp.get('pageSize') || 20)));
  const search = (sp.get('search') || '').trim();
  const status = sp.get('status') || '';
  const createdBy = sp.get('createdBy') || '';
  const from = sp.get('from') || '';
  const to = sp.get('to') || '';
  const fromRow = (page - 1) * pageSize;
  const toRow = fromRow + pageSize - 1;

  let query = supabase
    .from('quotations')
    .select('id, quotation_number, customer_name, customer_company, customer_phone, customer_reference, quotation_date, grand_total, status, created_by, created_at, updated_at, profiles!quotations_created_by_fkey(full_name,email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(fromRow, toRow);

  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(`quotation_number.ilike.%${escaped}%,customer_name.ilike.%${escaped}%,customer_company.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%,customer_reference.ilike.%${escaped}%`);
  }
  if (status) query = query.eq('status', status);
  if (createdBy) query = query.eq('created_by', createdBy);
  if (from) query = query.gte('quotation_date', from);
  if (to) query = query.lte('quotation_date', to);

  const { data, error, count } = await query;
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data, total: count ?? 0, page, pageSize });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    const raw = await request.json();
    const parsed = quotationPayloadSchema.safeParse(raw);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid quotation data');
    const input = parsed.data;
    const totals = calculateTotals(input.items, input.discount, input.tax);

    const payload = {
      ...input,
      ...totals,
      items: input.items.map((item, index) => ({ ...item, total_price: undefined, sort_order: index })),
    };

    const { data, error } = await supabase.rpc('create_quotation_transaction', { p_data: payload });
    if (error) return jsonError(error.message, 500);

    return NextResponse.json({ data: { ...data, totals } }, { status: 201 });
  } catch {
    return jsonError('Unable to save quotation.', 500);
  }
}
