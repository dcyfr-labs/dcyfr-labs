import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { SocialLinksGrid } from "@/components/sections";
import { cn } from "@/lib/utils";

/**
 * Contact Social Links Component
 * 
 * Displays all social media platforms and professional profiles on the contact page.
 * Encourages users to connect via their preferred platform.
 * 
 * Features:
 * - All social platforms from the data source
 * - Responsive grid layout
 * - Consistent with About page social links
 * - Platform-specific icons
 * - Full design token compliance
 * 
 * @example
 * ```tsx
 * <ContactSocialLinks />
 * ```
 */
export function ContactSocialLinks() {
  return (
    <div className={SPACING.content}>
      <div className="text-center mb-8">
        <h2 className={TYPOGRAPHY.h2.standard}>Find Us Elsewhere</h2>
        <p className={cn(TYPOGRAPHY.description, "mt-2")}>
          Connect with us across various platforms and communities
        </p>
      </div>

      <SocialLinksGrid />
    </div>
  );
}
