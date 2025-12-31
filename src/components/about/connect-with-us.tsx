import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { SocialLinksGrid } from "@/components/sections";
import { AvailabilityBanner } from "@/components/common";

/**
 * Connect With Us Section
 *
 * Standalone section component for team connection CTAs.
 * Includes availability banner and social links grid.
 * Designed for use on About and Team pages.
 */
export function ConnectWithUs() {
  return (
    <div className={SPACING.content}>
      <h2 className={TYPOGRAPHY.h2.standard}>Connect with Us</h2>
      <p className="text-muted-foreground mb-4">
        We&apos;d love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out through our social channels below.
      </p>
      <AvailabilityBanner className="my-6" />
      <SocialLinksGrid />
    </div>
  );
}
