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

    const hasValue = Boolean(value !== undefined ? value : defaultValue);
    const isActive = focused || hasValue || Boolean(value);

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          {/* Floating label */}
          <label
            htmlFor={id}
            className={[
              'label-float',
              isActive ? 'active' : '',
            ].join(' ')}
          >
            {label}
          </label>

          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            className={[
              'w-full px-4 pt-6 pb-2 text-[18px] bg-paper text-ink',
              'border rounded-xl ring-fade',
              'placeholder:text-ink-hint placeholder:text-base',
              'transition-colors duration-200',
              'min-h-[52px]',
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
