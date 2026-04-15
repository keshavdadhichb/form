import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) ?? 'hi';

    if (!audioFile) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = audioFile.type || 'audio/webm';

    const transcription = await transcribeAudio(base64, mimeType, language as 'hi' | 'en');
    return NextResponse.json({ transcription });
  } catch (err) {
    console.error('AI transcribe error:', err);
    return NextResponse.json({ error: 'Transcription unavailable, please try again' }, { status: 500 });
  }
}
