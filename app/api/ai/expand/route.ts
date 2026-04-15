import { NextRequest, NextResponse } from 'next/server';
import { expandStory } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { roughNotes, language } = await request.json();

    if (!roughNotes?.trim()) {
      return NextResponse.json({ error: 'roughNotes is required' }, { status: 400 });
    }

    const story = await expandStory(roughNotes.trim(), language ?? 'hi');
    return NextResponse.json({ story });
  } catch (err) {
    console.error('AI expand error:', err);
    return NextResponse.json({ error: 'AI unavailable, please try again' }, { status: 500 });
  }
}
