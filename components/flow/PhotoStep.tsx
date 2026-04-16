'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import { compressPhoto, createObjectUrl } from '@/lib/compress';
import Button from '@/components/ui/Button';

interface PhotoStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PhotoStep({ onNext, onBack }: PhotoStepProps) {
  const { t, lang } = useTranslation();
  const { photoPreviewUrl, setPhoto } = useFormStore();

  // Two separate DOM inputs: one for gallery (no capture), one for camera
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(lang === 'hi' ? 'कृपया एक तस्वीर चुनें' : 'Please choose an image file');
      return;
    }
    setError('');
    setCompressing(true);
    try {
      const blob = await compressPhoto(file);
      const url = createObjectUrl(blob);
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhoto(blob, url);
    } catch {
      setError(lang === 'hi' ? 'तस्वीर लोड नहीं हुई, फिर कोशिश करें' : 'Could not load image, please try again');
    } finally {
      setCompressing(false);
    }
  }, [photoPreviewUrl, setPhoto, lang]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removePhoto = () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhoto(null, null);
    setError('');
  };

  const handleNext = () => {
    if (!photoPreviewUrl) {
      setError(lang === 'hi' ? 'कृपया अपनी तस्वीर लगाएं' : 'Please add your photo to continue');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="flex flex-col items-center gap-8 px-6 py-8 max-w-md mx-auto w-full">
      <h2
        className="text-2xl text-ink text-center"
        style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
      >
        {t('photo.heading')}
      </h2>

      {/* Photo area */}
      <div className="flex flex-col items-center gap-6 w-full">
        <AnimatePresence mode="wait">
          {photoPreviewUrl ? (
            <motion.div
              key="preview"
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-terracotta">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreviewUrl} alt="Your photo" className="w-full h-full object-cover" />
              </div>
              <motion.button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-ink text-paper
                  flex items-center justify-center hover:bg-ink-muted transition-colors cursor-pointer"
                whileTap={{ scale: 0.9 }}
                aria-label={t('photo.remove')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              className={[
                'w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed',
                'flex flex-col items-center justify-center gap-3 cursor-pointer',
                'transition-colors duration-200',
                dragOver ? 'border-terracotta bg-terracotta/10' : 'border-border-soft bg-paper',
              ].join(' ')}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => galleryInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') galleryInputRef.current?.click(); }}
            >
              {compressing ? (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
                  <span className="text-sm text-ink-hint font-sans px-4 text-center">{t('photo.compressing')}</span>
                </motion.div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-ink-hint">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 10v12M10 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm text-ink-hint font-sans text-center px-4">
                    {lang === 'hi' ? 'तस्वीर चुनें' : 'Tap to choose photo'}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          TWO hidden inputs — this is the reliable way on iOS + Android:
          - galleryInput: no "capture" attr → shows iOS "Photo Library / Camera / Browse" sheet
          - cameraInput: capture="environment" → opens camera directly
        */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />

        {/* Camera / Gallery buttons — only show when no photo yet */}
        {!photoPreviewUrl && !compressing && (
          <motion.div
            className="flex gap-3 w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-2 bg-paper border border-border-soft
                rounded-xl p-4 cursor-pointer hover:border-ink-muted active:bg-cream
                transition-colors min-h-[80px] justify-center"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm text-ink-muted font-sans">{t('photo.camera')}</span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-2 bg-paper border border-border-soft
                rounded-xl p-4 cursor-pointer hover:border-ink-muted active:bg-cream
                transition-colors min-h-[80px] justify-center"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-ink-muted font-sans">{t('photo.gallery')}</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-rose font-sans text-center -mt-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Navigation — Back + Continue */}
      <div className="flex gap-3 w-full">
        <Button variant="secondary" size="lg" pill className="flex-1" onClick={onBack}>
          ← {lang === 'hi' ? 'वापस' : 'Back'}
        </Button>
        <Button variant="primary" size="lg" pill className="flex-1" onClick={handleNext}>
          {lang === 'hi' ? 'जारी रखें →' : 'Continue →'}
        </Button>
      </div>
    </div>
  );
}
