'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useFormStore, type StoryMethod } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AudioRecorder from '@/components/recorders/AudioRecorder';
import VideoRecorder from '@/components/recorders/VideoRecorder';

interface StoryStepProps {
  onNext: () => void;
}

const METHODS: { id: StoryMethod; icon: string; labelKey: string }[] = [
  { id: 'text', icon: '✍️', labelKey: 'story.method.write' },
  { id: 'audio', icon: '🎤', labelKey: 'story.method.audio' },
  { id: 'video', icon: '🎥', labelKey: 'story.method.video' },
  { id: 'upload', icon: '📁', labelKey: 'story.method.upload' },
];

const DEFAULT_PROMPTS = {
  hi: ['जो मुझे प्रेरित करता है...', 'एक मुश्किल जो मैंने पार की...', 'परिवार के बारे में मेरे विचार...'] as [string, string, string],
  en: ['What inspires me...', 'A difficulty I overcame...', 'My thoughts on our family...'] as [string, string, string],
};

export default function StoryStep({ onNext }: StoryStepProps) {
  const { t, lang } = useTranslation();
  const {
    storyMethod, storyText, uploadFile, audioBlob, videoBlob,
    setStoryMethod, setStoryText, setUploadFile, name, dob,
  } = useFormStore();

  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploadError, setUploadError] = useState('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Personalised prompts state
  const [prompts, setPrompts] = useState<[string, string, string]>(DEFAULT_PROMPTS[lang]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const promptsFetchedRef = useRef(false);

  const STORAGE_KEY = 'pariwar_story_text';

  // Restore from localStorage on mount
  useEffect(() => {
    if (!storyText) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStoryText(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch personalised prompts once (if name is available)
  useEffect(() => {
    if (promptsFetchedRef.current || !name) return;
    promptsFetchedRef.current = true;
    setPromptsLoading(true);
    const birthYear = dob.year ? Number(dob.year) : null;
    fetch('/api/ai/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, birthYear, language: lang }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.prompts) setPrompts(d.prompts); })
      .catch(() => {/* silently use defaults */})
      .finally(() => setPromptsLoading(false));
  }, [name, dob.year, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autosave
  const handleTextChange = useCallback((value: string) => {
    setStoryText(value);
    setSaveState('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 500);
  }, [setStoryText]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const insertPrompt = (promptText: string) => {
    handleTextChange(promptText + ' ' + storyText);
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 50 * 1024 * 1024) { setUploadError(t('story.upload.toobig')); return; }
    setUploadError('');
    setUploadFile(file);
  };

  const wordCount = storyText.trim() ? storyText.trim().split(/\s+/).length : 0;

  const validate = () => {
    if (!storyMethod) { setError(t('story.required')); return false; }
    if (storyMethod === 'text' && wordCount < 50) { setError(t('story.min_words')); return false; }
    if (storyMethod === 'audio' && !audioBlob) { setError(t('story.required')); return false; }
    if (storyMethod === 'video' && !videoBlob) { setError(t('story.required')); return false; }
    if (storyMethod === 'upload' && !uploadFile) { setError(t('story.required')); return false; }
    return true;
  };

  const handleNext = () => { if (validate()) { setError(''); onNext(); } };

  return (
    <div className="flex flex-col gap-6 px-6 py-8 max-w-md mx-auto w-full">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl text-ink" style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}>
          {t('story.heading')}
        </h2>
        <p className="text-sm text-ink-muted italic mt-1 font-sans">{t('story.subhead')}</p>
      </div>

      {/* ✨ Personalised prompt chips */}
      <div className="flex flex-wrap gap-2">
        {promptsLoading ? (
          // Skeleton chips while loading
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${80 + i * 30}px` }} />
          ))
        ) : (
          prompts.map((prompt, i) => (
            <motion.button
              key={i}
              onClick={() => insertPrompt(prompt)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="text-sm text-ink-muted bg-paper border border-border-soft rounded-full px-3 py-1.5
                hover:border-ink-muted hover:text-ink transition-colors cursor-pointer font-sans"
            >
              {prompt}
            </motion.button>
          ))
        )}
      </div>

      {/* Method cards */}
      <div className="grid grid-cols-2 gap-3">
        {METHODS.map((method) => (
          <Card
            key={method.id}
            interactive
            selected={storyMethod === method.id}
            onSelect={() => { setStoryMethod(method.id); setError(''); }}
            size="sm"
            className="flex flex-col items-center gap-2 py-5"
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="text-sm text-ink font-sans">{t(method.labelKey as Parameters<typeof t>[0])}</span>
          </Card>
        ))}
      </div>

      {/* Method input areas */}
      <AnimatePresence mode="wait">
        {storyMethod === 'text' && (
          <motion.div key="text"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <TextInput
              value={storyText} onChange={handleTextChange}
              placeholder={t('story.write.placeholder')}
              wordCount={wordCount} saveState={saveState} lang={lang}
            />
          </motion.div>
        )}

        {storyMethod === 'audio' && (
          <motion.div key="audio"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <AudioRecorder lang={lang} />
          </motion.div>
        )}

        {storyMethod === 'video' && (
          <motion.div key="video"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <VideoRecorder />
          </motion.div>
        )}

        {storyMethod === 'upload' && (
          <motion.div key="upload"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <UploadZone file={uploadFile} onFile={handleFileUpload}
              onRemove={() => { setUploadFile(null); setUploadError(''); }}
              error={uploadError} t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-rose font-sans text-center">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button variant="primary" size="lg" pill className="w-full" onClick={handleNext}>
        {t('nav.continue')}
      </Button>
    </div>
  );
}

/* ─── Text Input with ✨ Writing Assistant ──────────────────────────────── */
function TextInput({
  value, onChange, placeholder, wordCount, saveState, lang,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  wordCount: number; saveState: 'idle' | 'saving' | 'saved'; lang: 'hi' | 'en';
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [roughNotes, setRoughNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [genError, setGenError] = useState('');

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  const handleGenerate = async () => {
    if (!roughNotes.trim()) return;
    setGenerating(true);
    setGenError('');
    setGenerated('');
    try {
      const res = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughNotes: roughNotes.trim(), language: lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGenerated(data.story);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const useGenerated = () => {
    onChange(generated);
    setAssistantOpen(false);
    setRoughNotes('');
    setGenerated('');
  };

  const assistantPlaceholder = lang === 'hi'
    ? 'जैसे: राजस्थान में जन्मे, 3 बच्चे, 30 साल तक शिक्षक रहे, बागवानी का शौक...'
    : 'e.g. born Rajasthan, 3 children, teacher for 30 years, loves gardening...';

  return (
    <div className="bg-paper border border-border-soft rounded-xl overflow-hidden">
      {/* Main story textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-4 text-[18px] text-ink font-sans leading-relaxed
          placeholder:text-ink-hint resize-none focus:outline-none min-h-[220px] bg-transparent"
        style={{ overflow: 'hidden' }}
      />

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border-soft">
        <div className="flex items-center gap-3">
          {/* Word counter */}
          <motion.span
            className={`text-xs font-sans tabular-nums ${wordCount >= 200 ? 'text-sage-ink' : 'text-ink-hint'}`}
          >
            <motion.span key={wordCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {wordCount}
            </motion.span>
            {' / 1000'}
          </motion.span>

          {/* ✨ Writing assistant toggle */}
          <motion.button
            onClick={() => setAssistantOpen((o) => !o)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink border border-border-soft
              hover:border-ink-muted rounded-full px-2.5 py-1 transition-colors cursor-pointer font-sans"
          >
            <span>✨</span>
            <span>{lang === 'hi' ? 'लिखने में मदद' : 'Help me write'}</span>
          </motion.button>
        </div>

        {/* Autosave indicator */}
        <AnimatePresence mode="wait">
          {saveState !== 'idle' && (
            <motion.div key={saveState} className="flex items-center gap-1.5 text-xs text-ink-hint font-sans"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {saveState === 'saving' ? (
                <><motion.div className="w-1.5 h-1.5 rounded-full bg-sage"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                  {lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...'}</>
              ) : (
                <><motion.div className="w-1.5 h-1.5 rounded-full bg-sage"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} />
                  {lang === 'hi' ? 'सेव हुआ' : 'Saved'}</>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✨ Writing assistant panel */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border-soft bg-cream/60"
          >
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-ink-muted font-sans font-medium">
                {lang === 'hi' ? '✨ कुछ ज़रूरी बातें लिखें — हम पूरी कहानी बना देंगे' : '✨ Write rough notes — we\'ll expand them into your story'}
              </p>
              <textarea
                value={roughNotes}
                onChange={(e) => setRoughNotes(e.target.value)}
                placeholder={assistantPlaceholder}
                rows={3}
                className="w-full px-3 py-2.5 text-sm text-ink bg-paper border border-border-soft rounded-xl
                  font-sans leading-relaxed resize-none focus:outline-none focus:border-terracotta
                  focus:ring-2 focus:ring-terracotta/20 ring-fade transition-colors"
              />

              <AnimatePresence mode="wait">
                {generated && !generating && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-paper border border-sage/60 rounded-xl p-3 text-sm text-ink font-sans leading-relaxed"
                  >
                    <p className="whitespace-pre-wrap">{generated}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={useGenerated}
                        className="flex items-center gap-1 text-xs bg-sage/20 text-sage-ink px-3 py-1.5
                          rounded-full hover:bg-sage/30 transition-colors cursor-pointer font-medium font-sans"
                      >
                        ✓ {lang === 'hi' ? 'यह उपयोग करें' : 'Use this'}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer font-sans px-2"
                      >
                        ↺ {lang === 'hi' ? 'फिर कोशिश करें' : 'Try again'}
                      </button>
                    </div>
                  </motion.div>
                )}
                {genError && (
                  <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-rose font-sans">{genError}</motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <motion.button
                  onClick={handleGenerate}
                  disabled={!roughNotes.trim() || generating}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 text-sm bg-terracotta text-terracotta-ink px-4 py-2
                    rounded-full font-sans font-medium cursor-pointer hover:bg-[#DFA084] disabled:opacity-50
                    disabled:pointer-events-none transition-colors"
                >
                  {generating ? (
                    <><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>✨</motion.span>
                      {lang === 'hi' ? 'बना रहे हैं...' : 'Generating...'}</>
                  ) : (
                    <><span>✨</span>{lang === 'hi' ? 'कहानी बनाएं' : 'Generate story'}</>
                  )}
                </motion.button>
                <button onClick={() => setAssistantOpen(false)}
                  className="text-sm text-ink-hint hover:text-ink transition-colors cursor-pointer font-sans px-2">
                  {lang === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Upload Zone ────────────────────────────────────────────────────────── */
function UploadZone({ file, onFile, onRemove, error, t }: {
  file: File | null; onFile: (f: File) => void; onRemove: () => void;
  error: string; t: (k: Parameters<ReturnType<typeof useTranslation>['t']>[0]) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex flex-col gap-2">
      {file ? (
        <motion.div className="flex items-center justify-between bg-paper border border-sage rounded-xl p-4"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-sm font-medium text-ink font-sans truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-ink-hint font-sans">{formatSize(file.size)} · {file.type}</p>
          </div>
          <button onClick={onRemove} className="text-ink-hint hover:text-ink transition-colors cursor-pointer p-1" aria-label="Remove file">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      ) : (
        <motion.div
          className={['border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer',
            'transition-colors duration-200 text-center',
            dragOver ? 'border-terracotta bg-terracotta/5' : 'border-border-soft'].join(' ')}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
          onClick={() => inputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <span className="text-3xl">📁</span>
          <p className="text-sm text-ink font-sans">{t('story.upload.label')}</p>
          <p className="text-xs text-ink-hint font-sans">{t('story.upload.types')}</p>
        </motion.div>
      )}
      {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="text-xs text-rose font-sans px-1">{error}</motion.p>}
      <input ref={inputRef} type="file" accept="audio/*,video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} aria-hidden="true" />
    </div>
  );
}
