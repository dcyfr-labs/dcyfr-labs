import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Brand-aligned variants over the shadcn Button primitive.
// Tokens come from @/lib/design-tokens in the consumer app; never hardcode.
const dcyfrButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        brand:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95',
        secure: 'bg-secure text-secure-foreground ring-1 ring-secure/30 hover:bg-secure/90',
        ghostly: 'bg-transparent text-foreground hover:bg-muted/60',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'md',
    },
  }
);

export interface DcyfrButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof dcyfrButtonVariants> {
  asChild?: boolean;
}

const DcyfrButton = React.forwardRef<HTMLButtonElement, DcyfrButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(dcyfrButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
DcyfrButton.displayName = 'DcyfrButton';

export { DcyfrButton, dcyfrButtonVariants };
