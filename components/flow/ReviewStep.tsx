'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ReviewStepProps {
  onSubmit: () => void;
  onEditStep: (step: number) => void;
}

export default function ReviewStep({ onSubmit, onEditStep }: ReviewStepProps) {
  const { t, lang } = useTranslation();
  const store = useFormStore();
  const [submitting, setSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading_photo' | 'uploading_media' | 'saving' | 'done'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const formatDob = () => {
    const { day, month, year } = store.dob;
    if (!day && !month && !year) return '';
    const monthKey = `month.${month}` as Parameters<typeof t>[0];
    return `${day} ${month ? t(monthKey) : ''} ${year}`.trim();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      // Fields
      formData.append('name', store.name);
      formData.append('dob', `${store.dob.year}-${store.dob.month?.padStart(2, '0')}-${store.dob.day?.padStart(2, '0')}`);
      formData.append('father_name', store.fatherName);
      formData.append('mother_name', store.motherName);
      formData.append('qualifications', store.qualifications);
      formData.append('achievements', store.achievements);
      formData.append('hobbies', store.hobbies);
      formData.append('story_type', store.storyMethod ?? 'text');
      formData.append('story_text', store.storyText);
      formData.append('language', lang);

      // Media blobs
      if (store.photoBlob) {
        formData.append('photo', store.photoBlob, 'photo.jpg');
      }

      setUploadState('uploading_photo');
      setUploadProgress(10);

      const mediaBlob = store.audioBlob ?? store.videoBlob;
      const mediaFile = store.uploadFile;

      if (mediaBlob) {
        const ext = store.audioBlob ? 'webm' : 'webm';
        formData.append('media', mediaBlob, `recording.${ext}`);
      } else if (mediaFile) {
        formData.append('media', mediaFile, mediaFile.name);
      }

      setUploadState('uploading_media');
      setUploadProgress(40);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      setUploadState('saving');
      setUploadProgress(80);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t('error.submit'));
      }

      setUploadProgress(100);
      setUploadState('done');

      // Brief pause then proceed
      setTimeout(() => {
        onSubmit();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.submit'));
      setSubmitting(false);
      setUploadState('idle');
      setUploadProgress(0);
    }
  };

  const uploadStateText = {
    idle: '',
    uploading_photo: t('upload.photo'),
    uploading_media: t('upload.media'),
    saving: t('upload.saving'),
    done: t('upload.done'),
  }[uploadState];

  return (
    <>
      <div className="flex flex-col gap-6 px-6 py-8 max-w-md mx-auto w-full">
        <h2
          className="text-2xl text-ink text-center mb-2"
          style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
        >
          {t('review.heading')}
        </h2>

        <Card size="md" className="flex flex-col gap-5">
          {/* Photo */}
          <ReviewSection
            label={t('review.photo')}
            onEdit={() => onEditStep(2)}
            editLabel={t('review.edit')}
          >
            {store.photoPreviewUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-border-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={store.photoPreviewUrl} alt={store.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <p className="text-sm text-ink-hint font-sans">{t('review.no_photo')}</p>
            )}
          </ReviewSection>

          <div className="h-px bg-border-soft" />

          {/* Basics */}
          <ReviewSection
            label={t('review.basics')}
            onEdit={() => onEditStep(3)}
            editLabel={t('review.edit')}
          >
            <div className="space-y-1">
              <p className="text-base text-ink font-sans font-medium">{store.name}</p>
              {formatDob() && <p className="text-sm text-ink-muted font-sans">{formatDob()}</p>}
              {store.fatherName && (
                <p className="text-sm text-ink-muted font-sans">{t('basics.father')}: {store.fatherName}</p>
              )}
              {store.motherName && (
                <p className="text-sm text-ink-muted font-sans">{t('basics.mother')}: {store.motherName}</p>
              )}
            </div>
          </ReviewSection>

          <div className="h-px bg-border-soft" />

          {/* About */}
          {(store.qualifications || store.achievements || store.hobbies) && (
            <>
              <ReviewSection
                label={t('review.about')}
                onEdit={() => onEditStep(4)}
                editLabel={t('review.edit')}
              >
                <div className="space-y-2 text-sm text-ink-muted font-sans">
                  {store.qualifications && <p>{store.qualifications}</p>}
                  {store.achievements && <p>{store.achievements}</p>}
                  {store.hobbies && <p>{store.hobbies}</p>}
                </div>
              </ReviewSection>
              <div className="h-px bg-border-soft" />
            </>
          )}

          {/* Story */}
          <ReviewSection
            label={t('review.story')}
            onEdit={() => onEditStep(5)}
            editLabel={t('review.edit')}
          >
            {store.storyMethod === 'text' && store.storyText && (
              <p className="text-sm text-ink font-sans leading-relaxed line-clamp-4">
                {store.storyText}
              </p>
            )}
            {store.storyMethod === 'audio' && store.audioBlob && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🎤</span>
                <span className="text-sm text-ink-muted font-sans">Audio recorded</span>
              </div>
            )}
            {store.storyMethod === 'video' && store.videoBlob && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🎥</span>
                <span className="text-sm text-ink-muted font-sans">Video recorded</span>
              </div>
            )}
            {store.storyMethod === 'upload' && store.uploadFile && (
              <div className="flex items-center gap-2">
                <span className="text-xl">📁</span>
                <span className="text-sm text-ink-muted font-sans truncate max-w-[200px]">{store.uploadFile.name}</span>
              </div>
            )}
          </ReviewSection>
        </Card>

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

        <Button
          variant="primary"
          size="lg"
          pill
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
          loading={submitting && uploadState !== 'done'}
        >
          {t('review.submit')}
        </Button>
      </div>

      {/* Upload overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(253,248,243,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Photo + progress ring */}
              <div className="relative w-24 h-24">
                {store.photoPreviewUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={store.photoPreviewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-wheat flex items-center justify-center">
                    <span className="text-3xl" style={{ fontFamily: 'var(--font-tiro-devanagari)' }}>॥</span>
                  </div>
                )}

                {/* Progress ring */}
                <svg
                  className="absolute inset-0"
                  width="96"
                  height="96"
                  viewBox="0 0 96 96"
                >
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="#EADFD3"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke={uploadState === 'done' ? '#A8B8A0' : '#E8B298'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - uploadProgress / 100)}`}
                    style={{ rotate: '-90deg', transformOrigin: '48px 48px' }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - uploadProgress / 100) }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </svg>

                {uploadState === 'done' && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                        <path d="M1.5 7L6.5 12L16.5 2" stroke="#27500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Status text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={uploadState}
                  className="text-base text-ink font-sans text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {uploadStateText}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewSection({
  label,
  onEdit,
  editLabel,
  children,
}: {
  label: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <p className="text-xs text-ink-hint font-sans uppercase tracking-wide mb-2">{label}</p>
        {children}
      </div>
      <button
        onClick={onEdit}
        className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors cursor-pointer font-sans shrink-0 mt-0.5"
      >
        {editLabel}
      </button>
    </div>
  );
}
