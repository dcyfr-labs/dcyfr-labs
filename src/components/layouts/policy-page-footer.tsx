import { cn } from '@/lib/utils';

type PolicyPageFooterProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

/**
 * Standardized footer for legal/policy pages (Privacy, Terms, Acceptable Use,
 * Accessibility, Security). Provides consistent top-margin, divider, and padding
 * across all policy pages from a single source of truth.
 *
 * @example
 * ```tsx
 * <PolicyPageFooter>
 *   <p className="text-sm text-muted-foreground">
 *     <strong>DCYFR Labs Privacy Policy</strong>
 *     <br />
 *     Last Updated: {lastUpdated}
 *   </p>
 * </PolicyPageFooter>
 * ```
 */
export function PolicyPageFooter({ children, className }: PolicyPageFooterProps) {
  return (
    <footer
      className={cn(
        'mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border',
        className
      )}
    >
      {children}
    </footer>
  );
}
