import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { SocialLinksGrid } from "@/components/sections/social-links-grid";
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
        We&apos;re open to connecting with fellow builders, sharing knowledge,
        and exploring new opportunities. Feel free to reach out through any of
        the platforms below!
      </p>
      <AvailabilityBanner className="my-6" />
      <SocialLinksGrid />
    </div>
  );
}
