'use client';

import { motion } from 'framer-motion';
import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Card({
  selected,
  interactive,
  onSelect,
  size = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const sizeClass = size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4';

  if (interactive || onSelect) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => {
          navigator.vibrate?.(10);
          onSelect?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigator.vibrate?.(10);
            onSelect?.();
          }
        }}
        animate={{
          borderColor: selected ? '#E8B298' : '#EADFD3',
          borderWidth: selected ? 2 : 1,
        }}
        whileHover={{ borderColor: selected ? '#E8B298' : '#5F5E5A' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={[
          'bg-paper rounded-3xl cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-terracotta focus-visible:outline-offset-2',
          'relative overflow-hidden',
          sizeClass,
          className,
        ].join(' ')}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {/* Selected check icon */}
        {selected && (
          <motion.div
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-terracotta flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="#4A1B0C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={[
        'bg-paper rounded-3xl border border-border-soft',
        'shadow-[0_1px_2px_rgba(61,51,48,0.04)]',
        sizeClass,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
