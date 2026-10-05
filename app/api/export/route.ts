import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });

  const { data, error } = await supabase.from('quotations').select('quotation_number,customer_name,customer_company,quotation_date,grand_total,created_by,status,profiles!quotations_created_by_fkey(full_name,email)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const lines = [
    ['Quotation Number','Customer','Company','Date','Amount','Created By','Status'].map(csvEscape).join(','),
    ...(data || []).map((row: any) => [row.quotation_number,row.customer_name,row.customer_company,row.quotation_date,row.grand_total,row.profiles?.full_name || row.profiles?.email || row.created_by,row.status].map(csvEscape).join(',')),
  ];
  return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="bdshop-quotations.csv"' } });
}
