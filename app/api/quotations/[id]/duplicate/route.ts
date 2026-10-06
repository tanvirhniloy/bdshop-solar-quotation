import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase.rpc(
    'duplicate_quotation_transaction',
    {
      p_id: id,
    }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === 'Quotation not found' ? 404 : 500 }
    );
  }

  return NextResponse.json(
    { data },
    { status: 201 }
  );
}