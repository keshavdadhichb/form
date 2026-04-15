import { NextRequest, NextResponse } from 'next/server';
import { getPersonalisedPrompts } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { name, birthYear, language } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const prompts = await getPersonalisedPrompts(
      name.trim(),
      birthYear ? Number(birthYear) : null,
      language ?? 'hi'
    );
    return NextResponse.json({ prompts });
  } catch (err) {
    console.error('AI prompts error:', err);
    return NextResponse.json({ error: 'Could not generate prompts' }, { status: 500 });
  }
}
