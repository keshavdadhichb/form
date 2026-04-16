'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Story } from '@/lib/supabase';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDob(dob: string | null): string {
  if (!dob) return '';
  try {
    return new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dob;
  }
}

interface StoryModalProps {
  story: Story | null;
  onClose: () => void;
  token: string;
  onStoryUpdate?: (id: string, updates: Partial<Story>) => void;
  onDelete?: (story: Story) => void;
}

export default function StoryModal({ story, onClose, token, onStoryUpdate, onDelete }: StoryModalProps) {
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset transcription state when story changes
  useEffect(() => {
    setTranscription(null);
    setTranscribeError('');
    setSaved(false);
  }, [story?.id]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (story) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [story]);

  const handleGetText = async () => {
    if (!story?.media_url) return;
    setTranscribing(true);
    setTranscribeError('');
    try {
      const res = await fetch('/api/ai/transcribe-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mediaUrl: story.media_url, language: story.language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transcription failed');
      setTranscription(data.transcription);
    } catch (err) {
      setTranscribeError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSaveTranscription = async () => {
    if (!story || !transcription) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ story_text: transcription }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      onStoryUpdate?.(story.id, { story_text: transcription });
    } catch {
      setTranscribeError('Failed to save transcription');
    } finally {
      setSaving(false);
    }
  };

  const hasMediaStory = story && (story.story_type === 'audio' || story.story_type === 'video') && story.media_url;

  return (
    <AnimatePresence>
      {story && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40"
            style={{ backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-6"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="bg-paper rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header */}
              <div className="sticky top-0 bg-paper border-b border-border-soft px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  {story.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={story.photo_url} alt={story.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-wheat flex items-center justify-center">
                      <span className="text-sm font-medium text-wheat-ink font-sans">
                        {story.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-ink font-sans">{story.name}</p>
                    <p className="text-xs text-ink-hint font-sans">{formatDate(story.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-border-soft flex items-center justify-center
                    text-ink-muted hover:text-ink hover:border-ink-muted transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Photo (large) */}
                {story.photo_url && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.photo_url}
                      alt={story.name}
                      className="w-36 h-36 rounded-full object-cover border-2 border-border-soft"
                    />
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge label={story.language === 'hi' ? 'हिन्दी' : 'English'} color="wheat" />
                  <Badge label={story.story_type} color="sage" />
                  {story.hidden && <Badge label="Hidden" color="rose" />}
                </div>

                {/* Details */}
                {story.phone && <Field label="Phone" value={story.phone} />}
                {story.dob && (
                  <Field label="Date of birth" value={formatDob(story.dob)} />
                )}
                {story.father_name && <Field label="Father" value={story.father_name} />}
                {story.mother_name && <Field label="Mother" value={story.mother_name} />}
                {story.qualifications && <Field label="Qualifications" value={story.qualifications} />}
                {story.achievements && <Field label="Achievements" value={story.achievements} />}
                {story.hobbies && <Field label="Hobbies" value={story.hobbies} />}

                {/* Story */}
                {story.story_type === 'text' && story.story_text && (
                  <div>
                    <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">Story</p>
                    <p className="text-base text-ink font-sans leading-relaxed whitespace-pre-wrap">{story.story_text}</p>
                  </div>
                )}

                {/* Audio */}
                {story.story_type === 'audio' && story.media_url && (
                  <div>
                    <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">Audio Story</p>
                    <audio src={story.media_url} controls className="w-full rounded-xl" />
                  </div>
                )}

                {/* Video */}
                {story.story_type === 'video' && story.media_url && (
                  <div>
                    <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">Video Story</p>
                    <video src={story.media_url} controls className="w-full rounded-xl" />
                  </div>
                )}

                {/* Uploaded file */}
                {story.story_type === 'upload' && story.media_url && (
                  <div>
                    <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">Uploaded File</p>
                    <a
                      href={story.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-terracotta-ink underline font-sans"
                    >
                      Download file
                    </a>
                  </div>
                )}

                {/* Get Text button for audio/video */}
                {hasMediaStory && (
                  <div className="border-t border-border-soft pt-4">
                    {!transcription ? (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleGetText}
                          disabled={transcribing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                            bg-sage/20 border border-sage/40 text-sage-ink font-sans text-sm font-medium
                            hover:bg-sage/30 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {transcribing ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Transcribing...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                              Get text version (AI)
                            </>
                          )}
                        </button>
                        {transcribeError && (
                          <p className="text-xs text-rose font-sans text-center">{transcribeError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs text-ink-hint font-sans uppercase tracking-wide">AI Transcription</p>
                        <div className="bg-sage/10 border border-sage/30 rounded-xl px-4 py-3">
                          <p className="text-sm text-ink font-sans leading-relaxed whitespace-pre-wrap">{transcription}</p>
                        </div>
                        {saved ? (
                          <p className="text-xs text-sage-ink font-sans text-center font-medium">✓ Saved to story</p>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveTranscription}
                              disabled={saving}
                              className="flex-1 px-4 py-2 rounded-xl bg-terracotta text-terracotta-ink font-sans text-sm
                                font-medium hover:bg-[#DFA084] transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {saving ? 'Saving...' : 'Save as story text'}
                            </button>
                            <button
                              onClick={() => { setTranscription(null); setTranscribeError(''); }}
                              className="px-4 py-2 rounded-xl border border-border-soft text-ink-muted font-sans text-sm
                                hover:text-ink hover:border-ink-muted transition-colors cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>
                        )}
                        {transcribeError && (
                          <p className="text-xs text-rose font-sans text-center">{transcribeError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* AI summary */}
                {story.summary && (
                  <div>
                    <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">AI Summary</p>
                    <p className="text-sm text-ink-muted font-sans leading-relaxed italic">{story.summary}</p>
                  </div>
                )}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <span key={tag} className="text-xs font-sans px-2.5 py-1 rounded-full bg-wheat text-wheat-ink">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Delete button */}
                {onDelete && (
                  <div className="pt-4 border-t border-border-soft">
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${story.name}'s entry permanently? This cannot be undone.`)) {
                          onDelete(story);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm font-sans font-medium
                        text-rose border border-rose/30 rounded-xl px-4 py-3
                        hover:bg-rose/10 transition-colors cursor-pointer"
                    >
                      🗑️ Delete this entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-ink font-sans">{value}</p>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: 'wheat' | 'sage' | 'rose' }) {
  const colors = {
    wheat: 'bg-wheat text-wheat-ink',
    sage: 'bg-sage/30 text-sage-ink',
    rose: 'bg-rose/30 text-terracotta-ink',
  };
  return (
    <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${colors[color]}`}>{label}</span>
  );
}
