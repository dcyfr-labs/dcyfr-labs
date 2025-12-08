import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { teamMembers } from "@/data/team";
import { createPageMetadata } from "@/lib/metadata";
import { getJsonLdScriptProps, getPersonSchema } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site-config";
import { PageLayout } from "@/components/layouts";
import { AboutDrewProfile } from "@/components/about/about-drew-profile";
import { AboutDcyfrProfile } from "@/components/about/about-dcyfr-profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTAINER_WIDTHS, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { ArrowLeft } from "lucide-react";

/**
 * Team Member Profile Page
 * 
 * Individual profile pages for team members at /about/[slug]
 * Features:
 * - Dynamic routing for drew and dcyfr profiles
 * - Breadcrumb navigation and back-to-team link
 * - Cross-linking to other team member profiles
 * - JSON-LD structured data for SEO
 * - Unified design with PageLayout
 */

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for all team members
export async function generateStaticParams() {
  return teamMembers.map((member) => ({
    slug: member.slug,
  }));
}

// Generate metadata for each profile
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = teamMembers.find((m) => m.slug === slug);

  if (!member) {
    return {
      title: "Profile Not Found",
    };
  }

  const keywords = [
    member.name,
    member.title.toLowerCase(),
    ...member.badges.map((b) => b.label.toLowerCase()),
  ];

  if (member.id === "drew") {
    keywords.push("security", "architect", "cybersecurity", "incident response", "devsecops");
  } else if (member.id === "dcyfr") {
    keywords.push("ai", "assistant", "automation", "code review", "documentation");
  }

  return createPageMetadata({
    title: `${member.name} - ${member.title}`,
    description: member.description,
    path: `/about/${member.slug}`,
    keywords,
  });
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const member = teamMembers.find((m) => m.slug === slug);

  if (!member) {
    notFound();
  }

  // Get other team member for cross-linking
  const otherMember = teamMembers.find((m) => m.slug !== slug);

  // Generate JSON-LD structured data
  const nonce = (await headers()).get("x-nonce") || "";
  
  const imageUrl = member.avatarImagePath?.startsWith("http")
    ? member.avatarImagePath
    : `${SITE_URL}${member.avatarImagePath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: member.name,
      jobTitle: member.title,
      description: member.description,
      url: `${SITE_URL}/about/${member.slug}`,
      image: imageUrl,
    },
  };

  return (
    <PageLayout>
      {/* JSON-LD Structured Data */}
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* Profile Content */}
      <div
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${SPACING.section}`}
      >
        {/* Back to Our Team */}
        <Link
          href="/about#meet-the-team"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 mt-12"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Our Team</span>
        </Link>
        {member.slug === "drew" && <AboutDrewProfile />}
        {member.slug === "dcyfr" && <AboutDcyfrProfile />}
      </div>

      {/* Cross-link to Other Team Member */}
      {otherMember && (
        <div
          className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 lg:px-8 py-12`}
        >
          <div className={SPACING.section}>
            <h2 className={TYPOGRAPHY.h2.standard}>Meet the Team</h2>
            <Link href={otherMember.profileUrl} className="block group mt-4">
              <Card className="p-4 hover:shadow-lg transition-base hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={TYPOGRAPHY.h3.standard}>
                        {otherMember.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-movement" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {otherMember.title}
                    </p>
                    <p className="text-sm mb-4">{otherMember.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {otherMember.badges.map((badge) => (
                        <Badge
                          key={badge.label}
                          variant="outline"
                          className="text-xs"
                        >
                          <badge.icon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
