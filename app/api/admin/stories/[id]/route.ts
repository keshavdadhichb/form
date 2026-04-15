import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Only allow toggling `hidden`
    const allowed: Record<string, unknown> = {};
    if (typeof body.hidden === 'boolean') allowed.hidden = body.hidden;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
    }

    const { error } = await supabase.from('stories').update(allowed).eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
