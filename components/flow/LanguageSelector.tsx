'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/translations';

interface LanguageSelectorProps {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const { t, lang, setLang } = useTranslation();

  function handleSelect(selected: Language) {
    setLang(selected);
    onSelect(selected);
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Monogram */}
      <motion.div
        className="w-14 h-14 rounded-full bg-terracotta flex items-center justify-center mb-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
      >
        <span
          className="text-terracotta-ink text-2xl select-none"
          style={{ fontFamily: 'var(--font-tiro-devanagari), serif' }}
        >
          ॥
        </span>
      </motion.div>

      {/* Question — both languages stacked */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <p
          className="text-ink text-xl leading-relaxed"
          style={{ fontFamily: 'var(--font-tiro-devanagari), serif' }}
        >
          {t('lang.question.hi')}
        </p>
        <p className="text-ink-muted text-lg mt-1 font-sans">
          {t('lang.question.en')}
        </p>
      </motion.div>

      {/* Language cards */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <LanguageCard
          mainText="हिन्दी"
          subText={t('lang.hindi.sub')}
          fontClass="font-devanagari"
          lang="hi"
          onSelect={handleSelect}
        />
        <LanguageCard
          mainText="English"
          subText={t('lang.english.sub')}
          fontClass="font-serif"
          lang="en"
          onSelect={handleSelect}
        />
      </motion.div>
    </motion.div>
  );
}

function LanguageCard({
  mainText,
  subText,
  fontClass,
  lang,
  onSelect,
}: {
  mainText: string;
  subText: string;
  fontClass: string;
  lang: Language;
  onSelect: (l: Language) => void;
}) {
  return (
    <motion.button
      onClick={() => {
        navigator.vibrate?.(10);
        onSelect(lang);
      }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex-1 bg-paper border border-border-soft rounded-3xl p-6 flex flex-col items-center gap-2
        cursor-pointer hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-terracotta
        focus-visible:outline-offset-2 min-h-[120px] justify-center"
    >
      <span
        className={`text-[28px] text-ink leading-tight ${fontClass}`}
        style={{
          fontFamily:
            lang === 'hi'
              ? 'var(--font-tiro-devanagari), serif'
              : 'var(--font-fraunces), serif',
        }}
      >
        {mainText}
      </span>
      <span
        className="text-sm text-ink-muted font-sans"
        style={{
          fontFamily:
            lang === 'hi'
              ? 'var(--font-inter), sans-serif'
              : 'var(--font-tiro-devanagari), serif',
        }}
      >
        {subText}
      </span>
    </motion.button>
  );
}
