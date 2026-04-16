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
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Send to Gemini for transcription
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = language === 'hi'
      ? 'यह एक ऑडियो/वीडियो रिकॉर्डिंग है जिसमें कोई व्यक्ति अपनी जीवन कहानी बता रहा है। कृपया इसे हिंदी में ट्रांसक्राइब करें। केवल ट्रांसक्रिप्शन लिखें, कोई अन्य टिप्पणी नहीं।'
      : 'This is an audio/video recording of a person sharing their life story. Please transcribe it accurately in English. Only provide the transcription, no other commentary.';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: contentType,
          data: base64,
        },
      },
    ]);

    const transcription = result.response.text().trim();
    return NextResponse.json({ transcription });
  } catch (err) {
    console.error('Transcribe-url error:', err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
