import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // Base styles - Material Design 3 inspired
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-label-large font-medium transition-all duration-normal ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:scale-[1.02]',
  {
    variants: {
      variant: {
        // Primary - Brand gradient (Google + Airbnb style)
        primary: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-primary hover:from-primary-700 hover:to-secondary-700 hover:shadow-primary-lg',
        
        // Secondary - Clean outline style
        secondary: 'border-2 border-neutral-300 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-md',
        
        // Ghost - Minimal style
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        
        // Destructive - Error actions
        destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md',
        
        // Success - Confirmation actions
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:from-green-600 hover:to-green-700 hover:shadow-md',
      },
      size: {
        sm: 'h-9 px-3 text-body-small',
        md: 'h-11 px-6 text-label-large',
        lg: 'h-12 px-8 text-title-medium',
        xl: 'h-14 px-10 text-title-large',
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
