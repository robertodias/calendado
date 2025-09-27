import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-small font-medium transition-all duration-fast ease-standard',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
        primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        error: 'bg-red-100 text-red-800 hover:bg-red-200',
        info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        outline:
          'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-label-small',
        md: 'px-2.5 py-0.5 text-label-medium',
        lg: 'px-3 py-1 text-label-large',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className='w-3 h-3'>{icon}</span>}
      {children}
    </div>
  );
}

export { Badge };
