import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layouts";
import { PageHero } from "@/components/layouts";
import { Section } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactStats } from "@/components/sponsors";
import { SponsorshipTracker } from "./sponsorship-tracker";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  HOVER_EFFECTS
} from "@/lib/design-tokens";
import { BookOpen, Code, Linkedin, Github, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGitHubSponsors } from "@/lib/sponsors";

export const metadata: Metadata = {
  title: "Thank You!",
  description: "A heartfelt thank you to our sponsors for supporting open source development and educational content.",
  robots: {
    index: false, // Don't index transactional page
    follow: true,
  },
};

// Revalidate every hour (same as sponsors page)
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    sponsor?: string;
    tier?: string;
  }>;
}

export default async function SponsorThankYouPage({ searchParams }: PageProps) {
  // Handle query parameters
  const params = await searchParams;
  const sponsorParam = params.sponsor;
  const tierParam = params.tier;

  // Sanitize inputs to prevent XSS
  const safeSponsorName = sponsorParam
    ? decodeURIComponent(sponsorParam).replace(/[<>]/g, "")
    : null;
  const safeTierName = tierParam
    ? decodeURIComponent(tierParam).replace(/[<>]/g, "")
    : null;

  // Get total sponsor count for social proof
  const sponsors = await getGitHubSponsors();
  const sponsorCount = sponsors.length;

  // Determine personalized vs generic messaging
  const isPersonalized = !!safeSponsorName;
  const heroTitle = isPersonalized
    ? `Thank you, ${safeSponsorName}!`
    : "Thank You!";
  const heroDescription = isPersonalized
    ? `Your sponsorship${safeTierName ? ` via ${safeTierName}` : ""} means a lot to us. We sincerely appreciate your support! Your sponsorship helps us continue creating valuable open source projects and educational content for the developer community.`
    : "We sincerely appreciate your support! Your sponsorship helps us continue creating valuable open source projects and educational content for the developer community.";

  // Engagement opportunities
  const nextSteps = [
    {
      icon: BookOpen,
      title: "Explore Our Blog",
      description: "Discover articles on security, development, and emerging technology",
      href: "/blog",
      cta: "Browse Posts"
    },
    {
      icon: Code,
      title: "View Our Work",
      description: "Check out some of the open source projects and experiments we're working on",
      href: "/work",
      cta: "See Our Work"
    },
    {
      icon: Linkedin,
      title: "Connect on LinkedIn",
      description: "Follow for updates on security, development, and industry insights",
      href: "https://linkedin.com/in/dcyfr",
      cta: "Connect",
      external: true
    },
    {
      icon: Github,
      title: "Follow on GitHub",
      description: "Star repositories and stay updated on new open source works",
      href: "https://github.com/dcyfr",
      cta: "Follow",
      external: true
    }
  ];

  return (
    <PageLayout>
      {/* Analytics Tracker - tracks conversion once per session */}
      <SponsorshipTracker
        sponsorName={safeSponsorName}
        tierName={safeTierName}
      />

      <div className="space-y-10 md:space-y-14">
        {/* Hero Section */}
        <Section className={PAGE_LAYOUT.hero.content}>
          <PageHero
            title={heroTitle}
            description={heroDescription}
            align="center"
            className={PAGE_LAYOUT.hero.content}
          />
        </Section>

        {/* Impact Stats Section 
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="text-center mb-8">
              <h2 className={TYPOGRAPHY.h2.standard}>
                Your Impact
              </h2>
              <p className={cn("text-muted-foreground mt-4 mx-auto", CONTAINER_WIDTHS.narrow)}>
                Your sponsorship directly supports these initiatives and helps us continue creating value for the developer community.
              </p>
            </div>
            <ImpactStats />
          </div>
        </Section> */}

        {/* What's Next Section */}
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="text-center mb-8">
              <h2 className={TYPOGRAPHY.h2.standard}>What&apos;s Next?</h2>
              <p
                className={cn("text-muted-foreground mt-4 mx-auto", CONTAINER_WIDTHS.narrow)}
              >
                Here are some ways to stay connected and get the most out of the
                community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextSteps.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  target={step.external ? "_blank" : undefined}
                  rel={step.external ? "noopener noreferrer" : undefined}
                  className={cn("group bg-card border border-border rounded-lg", SPACING.content, HOVER_EFFECTS.cardSubtle)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                        <span>{step.cta}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {/* Social Proof Section 
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center pb-3">
                <CardTitle className={TYPOGRAPHY.h2.featured}>
                  Join the Community
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {sponsorCount > 0 ? (
                    <>
                      You&apos;re one of{" "}
                      <span className="font-semibold text-primary">
                        {sponsorCount}
                      </span>{" "}
                      {sponsorCount === 1 ? "sponsor" : "sponsors"} supporting
                      our work
                    </>
                  ) : (
                    "Be part of a community supporting secure open source development"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" size="lg">
                  <Link href="/sponsors">View All Sponsors</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section> */}

        {/* Back to Home CTA 
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Ready to explore?</p>
              <Button asChild size="lg" variant="cta">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </Section> */}
      </div>
    </PageLayout>
  );
}
