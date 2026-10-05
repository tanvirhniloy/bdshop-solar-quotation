import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTotals } from '@/lib/quotation/calculations';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: source, error } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', id).single();
  if (error || !source) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });

  const items = [...source.quotation_items].sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
    category: item.category,
    item_name: item.item_name,
    description: item.description || '',
    quantity: Number(item.quantity),
    unit: item.unit,
    unit_price: Number(item.unit_price),
    sort_order: item.sort_order,
  }));
  const totals = calculateTotals(items, Number(source.discount), Number(source.tax));
 const payload = {
  customer_name: source.customer_name,
  customer_company: source.customer_company,
  customer_phone: source.customer_phone,
  customer_email: source.customer_email,
  customer_address: source.customer_address,
  customer_reference: source.customer_reference,
  quotation_date: source.quotation_date,
  validity_days: Number(source.validity_days),
  terms_and_conditions: source.terms_and_conditions,
  ...totals,
};

  const { data: created, error: createError } = await supabase.rpc('create_quotation_transaction', { p_data: payload });
  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
  await supabase.from('quotation_activity').insert({ quotation_id: created.id, user_id: user.id, action: 'Duplicated', metadata: { source_quotation_id: id } });
  return NextResponse.json({ data: created }, { status: 201 });
}
