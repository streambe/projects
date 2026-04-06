import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-400 active:bg-teal-600 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-12px_rgba(20,184,166,0.6)]',
  secondary:
    'border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800 active:bg-slate-900',
  ghost:
    'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
  danger:
    'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-base rounded-xl gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-semibold
          transition-all duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          disabled:cursor-not-allowed disabled:opacity-50
          active:scale-[0.98]
          ${variantClass[variant]}
          ${sizeClass[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...rest}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        <span className={loading ? 'opacity-80' : ''}>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  },
);
