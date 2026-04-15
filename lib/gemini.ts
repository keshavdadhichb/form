import { GoogleGenAI } from '@google/genai';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY');
  return new GoogleGenAI({ apiKey: key });
}

const MODEL = 'gemini-2.5-flash';

// ─── 1. Story expansion ──────────────────────────────────────────────────────
// Takes rough notes, returns a warm 200-300 word first-person narrative.
export async function expandStory(roughNotes: string, language: 'hi' | 'en'): Promise<string> {
  const langName = language === 'hi' ? 'Hindi (Devanagari script)' : 'English';
  const prompt = `You are helping a family member write their life story for a cherished family archive.
They have provided rough notes below. Expand these into a warm, personal, first-person narrative.

Rules:
- Language: ${langName}
- Length: 200-300 words
- Tone: warm, personal, like they are speaking to their grandchildren
- Use first-person ("मैं" / "I")
- Do NOT add fictional details — only expand what is given
- Do NOT add a title or heading
- Return only the story text, nothing else

Rough notes:
${roughNotes}`;

  const ai = getClient();
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return (result.text ?? '').trim();
}

// ─── 2. Audio transcription ──────────────────────────────────────────────────
// Takes audio as base64 + mimeType, returns transcription text.
export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
  language: 'hi' | 'en'
): Promise<string> {
  const langHint = language === 'hi' ? 'The speaker is likely speaking in Hindi.' : 'The speaker is likely speaking in English.';
  const prompt = `Transcribe this audio recording accurately. ${langHint} The speaker may mix languages. Return only the transcription — no commentary, no timestamps, no labels.`;

  const ai = getClient();
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { inlineData: { data: audioBase64, mimeType } },
      { text: prompt },
    ],
  });
  return (result.text ?? '').trim();
}

// ─── 3. Personalised prompts ─────────────────────────────────────────────────
// Returns 3 era-appropriate story starter prompts based on the person's age.
export async function getPersonalisedPrompts(
  name: string,
  birthYear: number | null,
  language: 'hi' | 'en'
): Promise<[string, string, string]> {
  const langName = language === 'hi' ? 'Hindi (Devanagari script)' : 'English';
  const ageInfo = birthYear
    ? `born in ${birthYear} (approximately ${new Date().getFullYear() - birthYear} years old)`
    : 'age unknown';

  const prompt = `Generate 3 personal story prompts for a family archive submission.
Person: ${name}, ${ageInfo}
Language: ${langName}

Rules:
- Each prompt is a first-person sentence starter (10-12 words max)
- Make them era-appropriate and personal (e.g. for someone born 1940s, reference partition/independence era; for 1960s-70s, reference Green Revolution or migration to cities; for 1980s+, reference modern India)
- Warm, inviting, not generic
- Return ONLY a JSON array of exactly 3 strings, nothing else

Example format: ["Prompt one...", "Prompt two...", "Prompt three..."]`;

  try {
    const ai = getClient();
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = (result.text ?? '').trim();
    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');
    const parsed = JSON.parse(match[0]) as string[];
    if (parsed.length >= 3) return [parsed[0], parsed[1], parsed[2]];
    throw new Error('Not enough prompts');
  } catch {
    // Fallback to defaults if anything fails
    return language === 'hi'
      ? ['जो मुझे प्रेरित करता है...', 'एक मुश्किल जो मैंने पार की...', 'परिवार के बारे में मेरे विचार...']
      : ['What inspires me...', 'A difficulty I overcame...', 'My thoughts on our family...'];
  }
}

// ─── 4. Auto summary + tags ──────────────────────────────────────────────────
// Returns a 1-sentence summary and 3-5 tags for admin display.
export async function generateSummaryAndTags(
  storyText: string,
  name: string,
  language: 'hi' | 'en'
): Promise<{ summary: string; tags: string[] }> {
  const prompt = `Given this family story from someone named ${name}, provide:
1. A 1-sentence summary in English (max 20 words, neutral tone)
2. 3-5 tags in English — single words or short phrases about their life (profession, location, era, themes)

Story:
${storyText.slice(0, 2000)}

Return ONLY valid JSON in this exact format, nothing else:
{"summary": "...", "tags": ["tag1", "tag2", "tag3"]}`;

  try {
    const ai = getClient();
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = (result.text ?? '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    const parsed = JSON.parse(match[0]) as { summary: string; tags: string[] };
    return {
      summary: parsed.summary || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch {
    return { summary: '', tags: [] };
  }
}
