'use client';

import { motion } from 'framer-motion';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  pill?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-terracotta text-terracotta-ink border border-terracotta hover:bg-[#DFA084] active:bg-[#D5956E]',
  secondary:
    'bg-paper text-ink border border-border-soft hover:border-ink-muted hover:bg-cream',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:text-ink hover:border-border-soft',
  danger:
    'bg-rose text-terracotta-ink border border-rose hover:bg-[#C99494]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[52px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, pill, className = '', children, onClick, ...props },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      navigator.vibrate?.(10);
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={[
          'inline-flex items-center justify-center gap-2 font-sans font-medium',
          'transition-colors duration-200 ease-out',
          'cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-terracotta focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          pill ? 'rounded-full' : 'rounded-xl',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        onClick={handleClick}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <LoadingDot />
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

function LoadingDot() {
  return (
    <motion.span
      className="w-1.5 h-1.5 rounded-full bg-current"
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default Button;
