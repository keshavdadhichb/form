'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation, hasLanguageStored } from '@/lib/i18n';
import type { Language } from '@/lib/translations';

import LanguageSelector from '@/components/flow/LanguageSelector';
import Welcome from '@/components/flow/Welcome';
import PhotoStep from '@/components/flow/PhotoStep';
import BasicsStep from '@/components/flow/BasicsStep';
import AboutStep from '@/components/flow/AboutStep';
import StoryStep from '@/components/flow/StoryStep';
import ReviewStep from '@/components/flow/ReviewStep';
import SuccessStep from '@/components/flow/SuccessStep';
import ProgressPetals from '@/components/ui/ProgressPetals';
import Button from '@/components/ui/Button';

// Step indices
// 0 = language selector (skipped if already set)
// 1 = welcome
// 2 = photo
// 3 = basics
// 4 = about
// 5 = story
// 6 = review
// 7 = success

const PETAL_STEPS: Record<number, number> = {
  2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
};

// Easing curve: ease-out-quart
const EASE = [0.22, 1, 0.36, 1] as const;

function stepVariants(direction: 1 | -1) {
  return {
    initial: { x: direction * 40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
    exit: { x: direction * -40, opacity: 0, transition: { duration: 0.3, ease: EASE } },
  };
}

export default function HomePage() {
  const { t, setLang } = useTranslation();
  const [step, setStep] = useState<number | null>(null); // null = not yet determined
  const [direction, setDirection] = useState<1 | -1>(1);

  // Determine initial step after mount (avoids hydration mismatch)
  useEffect(() => {
    if (hasLanguageStored()) {
      setStep(1); // skip language selector
    } else {
      setStep(0);
    }
  }, []);

  const goTo = (nextStep: number, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setStep(nextStep);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = (current: number) => goTo(current + 1, 1);
  const goBack = (current: number) => goTo(current - 1, -1);

  const handleLanguageSelect = (lang: Language) => {
    setLang(lang);
    goTo(1, 1);
  };

  // Don't render until we know which step to show
  if (step === null) {
    return <div className="min-h-screen bg-cream" aria-hidden="true" />;
  }

  const showProgress = step >= 2 && step <= 6;
  const showBack = step >= 2 && step <= 6;
  const petalStep = PETAL_STEPS[step] ?? 0;

  const variants = stepVariants(direction);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar with progress + back */}
      {(showProgress || showBack) && (
        <motion.div
          className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm border-b border-border-soft"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
            {showBack ? (
              <motion.button
                onClick={() => goBack(step)}
                className="text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer font-sans
                  flex items-center gap-1 min-h-[44px] pr-4"
                whileTap={{ scale: 0.97 }}
                aria-label={t('nav.back')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('nav.back')}
              </motion.button>
            ) : (
              <div className="w-16" />
            )}

            {showProgress && (
              <ProgressPetals current={petalStep} total={5} />
            )}

            <div className="w-16" />
          </div>
        </motion.div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div key="lang" {...variants} className="layout-wrapper">
              <LanguageSelector onSelect={handleLanguageSelect} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="welcome" {...variants} className="layout-wrapper">
              <Welcome onBegin={() => goNext(1)} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="photo" {...variants} className="layout-wrapper">
              <PhotoStep onNext={() => goNext(2)} onBack={() => goBack(2)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="basics" {...variants} className="layout-wrapper">
              <BasicsStep onNext={() => goNext(3)} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="about" {...variants} className="layout-wrapper">
              <AboutStep onNext={() => goNext(4)} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="story" {...variants} className="layout-wrapper">
              <StoryStep onNext={() => goNext(5)} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="review" {...variants} className="layout-wrapper">
              <ReviewStep
                onSubmit={() => goTo(7, 1)}
                onEditStep={(s) => goTo(s, -1)}
              />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="success" {...variants} className="layout-wrapper">
              <SuccessStep onFillAnother={() => goTo(2, -1)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
