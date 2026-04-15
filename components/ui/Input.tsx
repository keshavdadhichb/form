'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useState, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const id = useId();
    const [focused, setFocused] = useState(false);

    // isActive = label floats to top
    const hasValue = value !== undefined ? String(value).length > 0 : Boolean(defaultValue);
    const isActive = focused || hasValue;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          {/* Floating label — acts as the placeholder when not active */}
          <label
            htmlFor={id}
            style={{
              position: 'absolute',
              left: '16px',
              top: isActive ? '8px' : '50%',
              transform: isActive ? 'none' : 'translateY(-50%)',
              fontSize: isActive ? '12px' : '16px',
              color: isActive ? 'var(--ink-muted)' : 'var(--ink-hint)',
              pointerEvents: 'none',
              transition: 'top 200ms cubic-bezier(0.22,1,0.36,1), font-size 200ms cubic-bezier(0.22,1,0.36,1), color 200ms cubic-bezier(0.22,1,0.36,1), transform 200ms cubic-bezier(0.22,1,0.36,1)',
              lineHeight: '1.4',
              zIndex: 1,
            }}
          >
            {label}
          </label>

          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            className={[
              'w-full px-4 text-[18px] bg-paper text-ink',
              'border rounded-xl ring-fade',
              // Placeholder only visible when focused (label has already floated up)
              'placeholder:text-ink-hint placeholder:text-base placeholder:opacity-0 focus:placeholder:opacity-100',
              'placeholder:transition-opacity placeholder:duration-200',
              'transition-colors duration-200',
              'min-h-[52px]',
              // Padding: top room for floated label, bottom balanced
              isActive ? 'pt-6 pb-2' : 'pt-4 pb-4',
              error
                ? 'border-rose focus:border-rose focus:ring-2 focus:ring-rose/30'
                : 'border-border-soft focus:border-terracotta focus:ring-2 focus:ring-terracotta/20',
              className,
            ].join(' ')}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[12px] text-rose px-1"
            >
              {error}
            </motion.p>
          )}
          {!error && hint && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] text-ink-hint px-1"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
