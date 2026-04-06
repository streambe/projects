import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref,
  ) {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const describedById = error
      ? `${inputId}-error`
      : helperText
      ? `${inputId}-help`
      : undefined;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedById}
            className={`
              w-full rounded-xl border bg-slate-900/80 text-sm text-white placeholder-slate-500
              transition-colors duration-150
              focus:outline-none focus:ring-2
              disabled:cursor-not-allowed disabled:opacity-60
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon ? 'pr-10' : 'pr-3.5'}
              py-2.5
              ${
                error
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-slate-700 focus:border-teal-500 focus:ring-teal-500/30'
              }
              ${className}
            `}
            {...rest}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-400 animate-fade-in-up"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-help`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
