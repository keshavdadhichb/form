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

const PROMPTS = ['story.prompt1', 'story.prompt2', 'story.prompt3'] as const;

export default function StoryStep({ onNext }: StoryStepProps) {
  const { t } = useTranslation();
  const {
    storyMethod,
    storyText,
    uploadFile,
    audioBlob,
    videoBlob,
    setStoryMethod,
    setStoryText,
    setUploadFile,
  } = useFormStore();

  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploadError, setUploadError] = useState('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const STORAGE_KEY = 'pariwar_story_text';

  // Restore from localStorage on mount
  useEffect(() => {
    if (!storyText) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStoryText(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autosave
  const handleTextChange = useCallback(
    (value: string) => {
      setStoryText(value);
      setSaveState('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, value);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      }, 500);
    },
    [setStoryText]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const insertPrompt = (promptText: string) => {
    const prefix = storyText ? `${promptText} ` : promptText + ' ';
    handleTextChange(prefix + storyText);
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setUploadError(t('story.upload.toobig'));
      return;
    }
    setUploadError('');
    setUploadFile(file);
  };

  const wordCount = storyText.trim() ? storyText.trim().split(/\s+/).length : 0;

  const validate = () => {
    if (!storyMethod) {
      setError(t('story.required'));
      return false;
    }
    if (storyMethod === 'text' && wordCount < 50) {
      setError(t('story.min_words'));
      return false;
    }
    if (storyMethod === 'audio' && !audioBlob) {
      setError(t('story.required'));
      return false;
    }
    if (storyMethod === 'video' && !videoBlob) {
      setError(t('story.required'));
      return false;
    }
    if (storyMethod === 'upload' && !uploadFile) {
      setError(t('story.required'));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      setError('');
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8 max-w-md mx-auto w-full">
      {/* Heading */}
      <div className="text-center">
        <h2
          className="text-2xl text-ink"
          style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
        >
          {t('story.heading')}
        </h2>
        <p className="text-sm text-ink-muted italic mt-1 font-sans">{t('story.subhead')}</p>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((key) => (
          <motion.button
            key={key}
            onClick={() => insertPrompt(t(key))}
            whileTap={{ scale: 0.97 }}
            className="text-sm text-ink-muted bg-paper border border-border-soft rounded-full px-3 py-1.5
              hover:border-ink-muted hover:text-ink transition-colors cursor-pointer font-sans"
          >
            {t(key)}
          </motion.button>
        ))}
      </div>

      {/* Method cards */}
      <div className="grid grid-cols-2 gap-3">
        {METHODS.map((method) => (
          <Card
            key={method.id}
            interactive
            selected={storyMethod === method.id}
            onSelect={() => {
              setStoryMethod(method.id);
              setError('');
            }}
            size="sm"
            className="flex flex-col items-center gap-2 py-5"
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="text-sm text-ink font-sans">{t(method.labelKey as Parameters<typeof t>[0])}</span>
          </Card>
        ))}
      </div>

      {/* Method input area */}
      <AnimatePresence mode="wait">
        {storyMethod === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <TextInput
              value={storyText}
              onChange={handleTextChange}
              placeholder={t('story.write.placeholder')}
              wordCount={wordCount}
              saveState={saveState}
              t={t}
            />
          </motion.div>
        )}

        {storyMethod === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <AudioRecorder />
          </motion.div>
        )}

        {storyMethod === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <VideoRecorder />
          </motion.div>
        )}

        {storyMethod === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <UploadZone
              file={uploadFile}
              onFile={handleFileUpload}
              onRemove={() => { setUploadFile(null); setUploadError(''); }}
              error={uploadError}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-rose font-sans text-center"
          >
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

/* ─── Text Input sub-component ─────────────────────────────────────────── */
function TextInput({
  value,
  onChange,
  placeholder,
  wordCount,
  saveState,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  wordCount: number;
  saveState: 'idle' | 'saving' | 'saved';
  t: (k: Parameters<ReturnType<typeof useTranslation>['t']>[0]) => string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <div className="bg-paper border border-border-soft rounded-xl overflow-hidden">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-4 text-[18px] text-ink font-sans leading-relaxed
          placeholder:text-ink-hint resize-none focus:outline-none
          min-h-[220px] bg-transparent"
        style={{ overflow: 'hidden' }}
      />

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border-soft">
        {/* Word counter */}
        <motion.span
          className={`text-xs font-sans tabular-nums ${wordCount >= 200 ? 'text-sage' : 'text-ink-hint'}`}
          animate={{ color: wordCount >= 200 ? '#A8B8A0' : '#888780' }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            key={wordCount}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {wordCount}
          </motion.span>
          {' / 1000 '}{t('story.words')}
        </motion.span>

        {/* Autosave indicator */}
        <AnimatePresence mode="wait">
          {saveState !== 'idle' && (
            <motion.div
              key={saveState}
              className="flex items-center gap-1.5 text-xs text-ink-hint font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {saveState === 'saving' ? (
                <>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-sage"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  {t('story.autosave')}
                </>
              ) : (
                <>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-sage"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  />
                  {t('story.saved')}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Upload Zone sub-component ─────────────────────────────────────────── */
function UploadZone({
  file,
  onFile,
  onRemove,
  error,
  t,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onRemove: () => void;
  error: string;
  t: (k: Parameters<ReturnType<typeof useTranslation>['t']>[0]) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      {file ? (
        <motion.div
          className="flex items-center justify-between bg-paper border border-sage rounded-xl p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-sm font-medium text-ink font-sans truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-ink-hint font-sans">{formatSize(file.size)} · {file.type}</p>
          </div>
          <button
            onClick={onRemove}
            className="text-ink-hint hover:text-ink transition-colors cursor-pointer p-1"
            aria-label="Remove file"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      ) : (
        <motion.div
          className={[
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer',
            'transition-colors duration-200 text-center',
            dragOver ? 'border-terracotta bg-terracotta/5' : 'border-border-soft',
          ].join(' ')}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <span className="text-3xl">📁</span>
          <p className="text-sm text-ink font-sans">{t('story.upload.label')}</p>
          <p className="text-xs text-ink-hint font-sans">{t('story.upload.types')}</p>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose font-sans px-1"
        >
          {error}
        </motion.p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
        aria-hidden="true"
      />
    </div>
  );
}
