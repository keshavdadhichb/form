import { NextRequest, NextResponse } from 'next/server';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini not configured' }, { status: 503 });
  }

  try {
    const { mediaUrl, language } = await request.json() as { mediaUrl: string; language: 'hi' | 'en' };

    if (!mediaUrl) {
      return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 });
    }

    // Fetch the media file from the URL
    const mediaRes = await fetch(mediaUrl);
    if (!mediaRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch media file' }, { status: 500 });
    }

    const contentType = mediaRes.headers.get('content-type') || 'audio/webm';
    const arrayBuffer = await mediaRes.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

    // Send to Gemini for transcription
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const langHint = language === 'hi'
      ? 'The speaker is likely speaking in Hindi.'
      : 'The speaker is likely speaking in English.';
    const prompt = `Transcribe this audio/video recording accurately. ${langHint} The speaker may mix languages. Return only the transcription — no commentary, no timestamps, no labels.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: audioBase64, mimeType: contentType } },
        { text: prompt },
      ],
    });

    const transcription = (result.text ?? '').trim();
    return NextResponse.json({ transcription });
  } catch (err) {
    console.error('Transcribe-url error:', err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
