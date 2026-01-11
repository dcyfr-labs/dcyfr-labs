import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export function InvitesCTA() {
  return (
    <div className={SPACING.content}>
      <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-8 text-center">
        <h2 className={TYPOGRAPHY.h2.featured}>Have a Platform to Share?</h2>
        <p
          className={`text-muted-foreground mt-4 ${CONTAINER_WIDTHS.narrow} mx-auto`}
        >
          If you have an invite code or referral link you&apos;d like us to add,
          reach out! We&apos;re always looking for valuable platforms to
          recommend to our community.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-primary-foreground shadow transition-theme hover:bg-primary/90 ${TYPOGRAPHY.label.small}`}
          >
            Contact Us
          </a>
          <a
            href="/sponsors"
            className={`inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 shadow-sm transition-theme hover:bg-muted ${TYPOGRAPHY.label.small}`}
          >
            View Sponsors
          </a>
        </div>
      </div>
    </div>
  );
}
