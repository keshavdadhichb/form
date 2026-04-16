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

    // Only allow toggling `hidden` or updating `story_text` (for AI transcriptions)
    const allowed: Record<string, unknown> = {};
    if (typeof body.hidden === 'boolean') allowed.hidden = body.hidden;
    if (typeof body.story_text === 'string') allowed.story_text = body.story_text;

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch the story first to get file URLs for cleanup
    const { data: story } = await supabase.from('stories').select('photo_url, media_url').eq('id', id).single();

    // Delete storage files if they exist
    if (story) {
      const bucket = 'stories';
      const filesToDelete: string[] = [];

      if (story.photo_url) {
        // Extract path from the full URL (after /object/public/stories/)
        const photoMatch = story.photo_url.match(/\/stories\/(.+)$/);
        if (photoMatch) filesToDelete.push(photoMatch[1]);
      }
      if (story.media_url) {
        const mediaMatch = story.media_url.match(/\/stories\/(.+)$/);
        if (mediaMatch) filesToDelete.push(mediaMatch[1]);
      }

      if (filesToDelete.length > 0) {
        await supabase.storage.from(bucket).remove(filesToDelete);
      }
    }

    // Delete the row
    const { error } = await supabase.from('stories').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

