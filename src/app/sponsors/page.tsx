import type { Metadata } from "next";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { Section, TeamMemberCard } from "@/components/common";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  HOVER_EFFECTS,
} from "@/lib/design-tokens";
import { getGitHubSponsors } from "@/lib/sponsors/github-sponsors";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/data/team";

const pageTitle = "Sponsors";
const pageDescription =
  "Thank you to all the amazing sponsors who support our open source work and content creation. Your support makes everything possible.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/sponsors",
});

// Revalidate every hour
export const revalidate = 3600;

// Contribution text for core contributors (maps to team member IDs)
const contributorDescriptions: Record<string, string> = {
  drew: "Secure development, incident response, and building resilient systems",
  dcyfr: "Context-aware coding and security assistance accelerating implementation, analysis, and docs",
};

export default async function SponsorsPage() {
  const nonce = (await headers()).get("x-nonce") || "";
  const sponsors = await getGitHubSponsors();

  // Group sponsors by tier
  const tierMap = new Map<number, typeof sponsors>();
  sponsors.forEach((sponsor) => {
    const amount = sponsor.tier?.monthlyPriceInDollars || 0;
    if (!tierMap.has(amount)) {
      tierMap.set(amount, []);
    }
    tierMap.get(amount)!.push(sponsor);
  });

  // Sort tiers by amount (highest first)
  const sortedTiers = Array.from(tierMap.entries()).sort(
    ([a], [b]) => b - a
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: "https://dcyfr.com/sponsors",
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

        {/* Core Contributors Section */}
        <Section
          id="core-contributors"
          className={PAGE_LAYOUT.section.container}
        >
          <div className={SPACING.content}>
            <h2 className={TYPOGRAPHY.h2.standard}>Contributors</h2>
            <p className="text-muted-foreground mt-4 mb-8">
              These contributors dedicate their expertise to advancing our
              security research and open-source mission.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  layout="compact"
                  contribution={contributorDescriptions[member.id]}
                  avatarUrl={member.avatarType === "image" && member.id === "drew" ? "https://github.com/dcyfr.png" : undefined}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Sponsors Section */}
        <Section
          id="sponsors"
          className={PAGE_LAYOUT.section.container}
        >
          <div className={SPACING.content}>
            <h2 className={TYPOGRAPHY.h2.standard}>Sponsors</h2>
            {sponsors.length === 0 ? (
              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  No backers yet. Be the first to{" "}
                  <Link
                    href="https://github.com/sponsors/dcyfr"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    sponsor us
                  </Link>
                  !
                </p>
              </div>
            ) : (
              <>
                {/* Sponsor count */}
                <div className="text-center mt-4 mb-12">
                  <p className="text-lg text-muted-foreground">
                    Thank you to{" "}
                    <span className="font-semibold text-primary">
                      {sponsors.length}
                    </span>{" "}
                    {sponsors.length === 1 ? "sponsor" : "sponsors"} for their
                    generous support!
                  </p>
                </div>

                {/* Sponsors by tier */}
                {sortedTiers.map(([tierAmount, tierSponsors]) => (
                  <div key={tierAmount} className="mb-12 last:mb-0">
                    <h2 className={TYPOGRAPHY.h2.standard}>
                      {tierAmount > 0
                        ? `$${tierAmount}/month`
                        : "One-time & Custom Sponsors"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                      {tierSponsors.map((sponsor) => (
                        <SponsorCard key={sponsor.id} sponsor={sponsor} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Section>

        {/* Call to Action */}
        <Section
          id="become-a-sponsor"
          className={PAGE_LAYOUT.section.container}
        >
          <div className={SPACING.content}>
            <div className="bg-card border border-border rounded-lg p-8">
              {/* CTA Header */}
              <div className="text-center mb-8">
                <h2 className={TYPOGRAPHY.h2.featured}>
                  Looking to Sponsor Our Work?
                </h2>
                <p
                  className={`text-muted-foreground mt-4 ${CONTAINER_WIDTHS.narrow} mx-auto`}
                >
                  Your sponsorship helps us dedicate more time to open source
                  development, writing technical content, and creating
                  educational resources for the community.
                </p>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button asChild size="lg" variant="cta">
                  <Link
                    href="https://github.com/sponsors/dcyfr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Become a Sponsor
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}

interface SponsorCardProps {
  sponsor: {
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
    websiteUrl?: string | null;
    tier: {
      name: string;
    } | null;
  };
}

function SponsorCard({ sponsor }: SponsorCardProps) {
  const displayName = sponsor.name || sponsor.login;
  const linkUrl = sponsor.websiteUrl || sponsor.url;

  return (
    <Link
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group bg-card border border-border rounded-lg p-4 ${HOVER_EFFECTS.cardSubtle}`}
    >
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/50 transition-all">
          <Image
            src={sponsor.avatarUrl}
            alt={`${displayName}'s avatar`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            @{sponsor.login}
          </p>
          {sponsor.tier && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {sponsor.tier.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
