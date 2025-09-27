import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  // Base styles - Material Design 3 inspired
  'flex w-full rounded-xl border bg-white px-4 py-3 text-body-large transition-all duration-normal ease-standard placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100',
  {
    variants: {
      variant: {
        default:
          'border-neutral-300 shadow-sm hover:border-neutral-400 focus:shadow-md',
        filled:
          'border-transparent bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:border-primary-600',
        outlined:
          'border-2 border-neutral-300 shadow-none hover:border-neutral-400',
      },
      size: {
        sm: 'h-9 px-3 text-body-small',
        md: 'h-11 px-4 text-body-large',
        lg: 'h-12 px-4 text-title-medium',
      },
      state: {
        default: '',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const finalState = error ? 'error' : state;

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-label-large font-medium text-neutral-900 mb-2'
          >
            {label}
          </label>
        )}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500'>
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            className={cn(
              inputVariants({ variant, size, state: finalState }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500'>
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-body-small',
              error ? 'text-red-600' : 'text-neutral-600'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
