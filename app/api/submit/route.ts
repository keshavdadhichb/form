import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { generateSummaryAndTags } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await request.formData();

    // Extract text fields
    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const fatherName = formData.get('father_name') as string;
    const motherName = formData.get('mother_name') as string;
    const qualifications = formData.get('qualifications') as string;
    const achievements = formData.get('achievements') as string;
    const hobbies = formData.get('hobbies') as string;
    const storyType = formData.get('story_type') as 'text' | 'audio' | 'video' | 'upload';
    const storyText = formData.get('story_text') as string;
    const language = formData.get('language') as 'hi' | 'en';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Upload photo
    let photoUrl: string | null = null;
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile.size > 0) {
      const photoPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('pariwar-photos')
        .upload(photoPath, photoFile, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
      } else {
        const { data } = supabase.storage.from('pariwar-photos').getPublicUrl(photoPath);
        photoUrl = data.publicUrl;
      }
    }

    // Upload media
    let mediaUrl: string | null = null;
    const mediaFile = formData.get('media') as File | null;
    if (mediaFile && mediaFile.size > 0) {
      const ext = mediaFile.name.split('.').pop() ?? 'webm';
      const mediaPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: mediaError } = await supabase.storage
        .from('pariwar-media')
        .upload(mediaPath, mediaFile, {
          contentType: mediaFile.type || 'application/octet-stream',
          cacheControl: '3600',
        });
      if (mediaError) {
        console.error('Media upload error:', mediaError);
      } else {
        const { data } = supabase.storage.from('pariwar-media').getPublicUrl(mediaPath);
        mediaUrl = data.publicUrl;
      }
    }

    // Parse DOB safely
    let dobDate: string | null = null;
    if (dob && dob !== '--') {
      const parts = dob.split('-').filter(Boolean);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2] && Number(parts[0]) > 1900) {
        dobDate = dob;
      }
    }

    // Insert row
    const { data, error: insertError } = await supabase
      .from('stories')
      .insert({
        name,
        dob: dobDate,
        father_name: fatherName || null,
        mother_name: motherName || null,
        qualifications: qualifications || null,
        achievements: achievements || null,
        hobbies: hobbies || null,
        story_type: storyType,
        story_text: storyText || null,
        photo_url: photoUrl,
        media_url: mediaUrl,
        language,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    // Fire-and-forget: generate AI summary + tags in the background
    // Only when there is text content to summarise
    const textForSummary = storyText || [qualifications, achievements, hobbies].filter(Boolean).join(' ');
    if (textForSummary.trim().length > 30 && process.env.GEMINI_API_KEY) {
      generateSummaryAndTags(textForSummary, name, language)
        .then(({ summary, tags }) => {
          if (!summary && !tags.length) return;
          supabase
            .from('stories')
            .update({ summary, tags })
            .eq('id', data.id)
            .then(({ error }) => {
              if (error) console.error('Summary update error:', error);
            });
        })
        .catch((err) => console.error('Summary generation error:', err));
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
