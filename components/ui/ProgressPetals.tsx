'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface ProgressPetalsProps {
  current: number; // 1-indexed current step (1–5)
  total?: number;
}

// Lotus petal SVG path
function Petal({ filled, index }: { filled: boolean; index: number }) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center" aria-hidden="true">
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        {/* Outer petal shape */}
        <path
          d="M10 1C10 1 18 7 18 13C18 17.4183 14.4183 21 10 21C5.58172 21 2 17.4183 2 13C2 7 10 1 10 1Z"
          fill={filled ? 'transparent' : 'transparent'}
          stroke="#EADFD3"
          strokeWidth="1.5"
        />
        {/* Fill overlay */}
        <motion.path
          d="M10 1C10 1 18 7 18 13C18 17.4183 14.4183 21 10 21C5.58172 21 2 17.4183 2 13C2 7 10 1 10 1Z"
          fill="#E8B298"
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: filled ? 1 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 28,
            delay: index * 0.05,
          }}
          style={{ transformOrigin: '10px 21px' }}
        />
        {/* Border always visible */}
        <path
          d="M10 1C10 1 18 7 18 13C18 17.4183 14.4183 21 10 21C5.58172 21 2 17.4183 2 13C2 7 10 1 10 1Z"
          fill="none"
          stroke={filled ? '#E8B298' : '#EADFD3'}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export default function ProgressPetals({ current, total = 5 }: ProgressPetalsProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center justify-center gap-2 py-4"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`${t('progress.step')} ${current} ${t('progress.of')} ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <Petal key={i} filled={i < current} index={i} />
      ))}
    </div>
  );
}
