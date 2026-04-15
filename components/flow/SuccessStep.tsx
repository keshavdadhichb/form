'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface SuccessStepProps {
  onFillAnother: () => void;
}

export default function SuccessStep({ onFillAnother }: SuccessStepProps) {
  const { t } = useTranslation();
  const { name, photoPreviewUrl, storyText, storyMethod, resetForm } = useFormStore();

  const storySnippet = storyText ? storyText.slice(0, 120) + (storyText.length > 120 ? '...' : '') : '';

  const handleFillAnother = () => {
    resetForm();
    onFillAnother();
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      t('success.thanks') + '\n' + t('success.message') + '\n' + window.location.origin
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated checkmark */}
      <motion.div
        className="w-20 h-20 rounded-full bg-sage flex items-center justify-center mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
      >
        <motion.svg
          width="32"
          height="26"
          viewBox="0 0 32 26"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
        >
          <motion.path
            d="M2 13L11 22L30 3"
            stroke="#27500A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
          />
        </motion.svg>
      </motion.div>

      {/* Thank you */}
      <motion.h1
        className="text-3xl text-ink text-center mb-3"
        style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {t('success.thanks')}
      </motion.h1>

      <motion.p
        className="text-ink-muted font-sans text-center text-base leading-relaxed max-w-xs mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        {t('success.message')}
      </motion.p>

      {/* Preview card */}
      <motion.div
        className="w-full max-w-sm mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <Card size="md" className="flex gap-4 items-start">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-wheat flex items-center justify-center">
            {photoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreviewUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl text-wheat-ink" style={{ fontFamily: 'var(--font-tiro-devanagari)' }}>
                {name?.charAt(0) ?? '?'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink font-sans">{name}</p>
            {storyText && (
              <p className="text-sm text-ink-muted font-sans mt-1 leading-relaxed">{storySnippet}</p>
            )}
            {!storyText && storyMethod && (
              <p className="text-sm text-ink-muted font-sans mt-1">
                {storyMethod === 'audio' ? '🎤 Audio' : storyMethod === 'video' ? '🎥 Video' : '📁 File'} story shared
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        <Button
          variant="secondary"
          size="md"
          pill
          className="w-full"
          onClick={handleFillAnother}
        >
          {t('success.fill_another')}
        </Button>
        <Button
          variant="primary"
          size="md"
          pill
          className="w-full"
          onClick={shareOnWhatsApp}
        >
          {t('success.whatsapp')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
