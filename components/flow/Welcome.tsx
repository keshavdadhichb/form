'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import Button from '@/components/ui/Button';

interface WelcomeProps {
  onBegin: () => void;
}

export default function Welcome({ onBegin }: WelcomeProps) {
  const { t, lang } = useTranslation();

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Monogram */}
      <motion.div
        className="w-[72px] h-[72px] rounded-full bg-terracotta flex items-center justify-center mb-8"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 20 }}
      >
        <span
          className="text-terracotta-ink text-3xl select-none"
          style={{ fontFamily: 'var(--font-tiro-devanagari), serif' }}
        >
          ॥
        </span>
      </motion.div>

      {/* Family name */}
      <motion.h1
        className="text-center text-ink mb-4 text-2xl sm:text-3xl leading-snug"
        style={{
          fontFamily:
            lang === 'hi'
              ? 'var(--font-tiro-devanagari), serif'
              : 'var(--font-fraunces), serif',
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {t('welcome.family')}
      </motion.h1>

      {/* Invite sentence */}
      <motion.p
        className="text-ink-muted text-center text-lg leading-relaxed max-w-xs mb-12 font-sans"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {t('welcome.invite')}
      </motion.p>

      {/* Begin button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Button variant="primary" size="lg" pill onClick={onBegin}>
          {t('welcome.begin')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
