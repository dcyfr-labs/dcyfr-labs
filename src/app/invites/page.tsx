import type { Metadata } from "next";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { Section } from "@/components/common";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
} from "@/lib/design-tokens";
import { inviteCodes, INVITE_CODE_CATEGORY_LABELS } from "@/data/invites";
import { InviteCodeCard } from "@/components/sponsors";
import { headers } from "next/headers";
import type { InviteCode } from "@/types/invites";

const pageTitle = "Invite Codes";
const pageDescription =
  "Join our favorite platforms and communities. Curated list of invite codes, referral links, and professional networks we recommend.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/invites",
});

// Group codes by category
function groupInviteCodesByCategory(codes: InviteCode[]) {
  const grouped = new Map<InviteCode["category"], InviteCode[]>();
  
  codes.forEach((code) => {
    if (!grouped.has(code.category)) {
      grouped.set(code.category, []);
    }
    grouped.get(code.category)!.push(code);
  });
  
  return grouped;
}

export default async function InvitesPage() {
  const nonce = (await headers()).get("x-nonce") || "";
  const groupedCodes = groupInviteCodesByCategory(inviteCodes);
  
  // Sort categories by number of codes (descending)
  const sortedCategories = Array.from(groupedCodes.entries()).sort(
    ([, a], [, b]) => b.length - a.length
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: "https://dcyfr.com/invites",
    isPartOf: {
      "@type": "WebSite",
      name: "dcyfr",
      url: "https://dcyfr.com",
    },
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <div className="space-y-10 md:space-y-14">
        {/* Hero Section */}
        <Section id="hero" className={PAGE_LAYOUT.hero.content}>
          <PageHero
            title={pageTitle}
            description={pageDescription}
            className={PAGE_LAYOUT.hero.content}
          />
        </Section>

        {/* Stats Summary */}
        <Section id="stats" className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{inviteCodes.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Codes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{groupedCodes.size}</p>
                  <p className="text-sm text-muted-foreground mt-1">Categories</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {inviteCodes.filter(c => c.featured).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Featured</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground mt-1">Free to Join</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Invite Codes by Category */}
        {sortedCategories.map(([category, codes]) => (
          <Section
            key={category}
            id={`category-${category}`}
            className={PAGE_LAYOUT.section.container}
          >
            <div className={SPACING.content}>
              <div className="mb-6">
                <h2 className={TYPOGRAPHY.h2.standard}>
                  {INVITE_CODE_CATEGORY_LABELS[category]}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {codes.length} {codes.length === 1 ? "platform" : "platforms"} available
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {codes.map((code) => (
                  <InviteCodeCard
                    key={code.id}
                    code={code}
                    showFullDescription={true}
                    showMetrics={true}
                  />
                ))}
              </div>
            </div>
          </Section>
        ))}

        {/* Call to Action */}
        <Section id="cta" className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-8 text-center">
              <h2 className={TYPOGRAPHY.h2.featured}>
                Have a Platform to Share?
              </h2>
              <p className={`text-muted-foreground mt-4 ${CONTAINER_WIDTHS.narrow} mx-auto`}>
                If you have an invite code or referral link you&apos;d like us to add,
                reach out! We&apos;re always looking for valuable platforms to recommend
                to our community.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Contact Us
                </a>
                <a
                  href="/sponsors"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                >
                  View Sponsors
                </a>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
