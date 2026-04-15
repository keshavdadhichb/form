'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useState, useId, useEffect, useRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  minRows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, minRows = 3, className = '', onFocus, onBlur, value, onChange, ...props }, ref) => {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const innerRef = useRef<HTMLTextAreaElement>(null);

    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement | null>) ?? innerRef;

    const hasValue = value !== undefined ? String(value).length > 0 : false;
    const isActive = focused || hasValue;

    // Auto-resize
    useEffect(() => {
      const el = resolvedRef?.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }, [value, resolvedRef]);

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          {label && (
            <label
              htmlFor={id}
              style={{
                position: 'absolute',
                left: '16px',
                top: isActive ? '8px' : '20px',
                fontSize: isActive ? '12px' : '16px',
                color: isActive ? 'var(--ink-muted)' : 'var(--ink-hint)',
                pointerEvents: 'none',
                transition: 'top 200ms cubic-bezier(0.22,1,0.36,1), font-size 200ms cubic-bezier(0.22,1,0.36,1), color 200ms cubic-bezier(0.22,1,0.36,1)',
                lineHeight: '1.4',
                zIndex: 1,
              }}
            >
              {label}
            </label>
          )}

          <textarea
            ref={resolvedRef}
            id={id}
            value={value}
            onChange={onChange}
            rows={minRows}
            className={[
              'w-full px-4 pb-3 text-[18px] bg-paper text-ink',
              'border rounded-xl ring-fade',
              // Placeholder hidden until focused
              'placeholder:text-ink-hint placeholder:text-[16px]',
              'placeholder:opacity-0 focus:placeholder:opacity-100',
              'placeholder:transition-opacity placeholder:duration-200',
              'transition-colors duration-200',
              'overflow-hidden resize-none leading-relaxed',
              label ? 'pt-7' : 'pt-4',
              error
                ? 'border-rose focus:border-rose focus:ring-2 focus:ring-rose/30'
                : 'border-border-soft focus:border-terracotta focus:ring-2 focus:ring-terracotta/20',
              className,
            ].join(' ')}
            style={{ minHeight: `${minRows * 28 + 36}px` }}
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
              className="text-[12px] text-ink-hint px-1 italic"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
