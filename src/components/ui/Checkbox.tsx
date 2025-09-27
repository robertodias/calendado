import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate: _indeterminate, ...props }, ref) => {
    return (
      <input
        type='checkbox'
        className={cn(
          'h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
