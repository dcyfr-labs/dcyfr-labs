import { getSocialUrls } from '@/data/socials';
import {
  SITE_URL,
  SITE_TITLE,
  AUTHOR_NAME,
  getOgImageUrl,
  SITE_TITLE_PLAIN,
  SITE_LAUNCH_DATE,
  SITE_LAST_UPDATED_DATE,
} from '@/lib/site-config';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import {
  TYPOGRAPHY,
  CONTAINER_PADDING,
  CONTAINER_VERTICAL_PADDING,
  CONTAINER_WIDTHS,
  SPACING,
  HOVER_EFFECTS,
  ANIMATION_CONSTANTS,
} from '@/lib/design-tokens';
import { createPageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { PageLayout } from '@/components/layouts';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/common';
import { SearchButton } from '@/components/search';
import { posts, featuredPosts } from '@/data/posts';
import { HomepageHeroActions } from '@/components/home/homepage-hero-actions';
import { FeaturedPostHero } from '@/components/home/featured-post-hero';
import { NewsletterSignup } from '@/components/blog/rivet/engagement/newsletter-signup';
import Link from 'next/link';
import { ArrowRight, Zap, FileText, Briefcase, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCredlyBadges } from '@/lib/credly-data';
import { getYearsOfExperience } from '@/data/resume';

const pageDescription =
  'Think Freely. Build Securely. Ship Boldly. DCYFR Labs publishes DCYFR AI and open-source security tooling — explore cyber architecture, AI engineering, and modern development.';

export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: SITE_TITLE_PLAIN,
  description: pageDescription,
  path: '/',
});

// ── Bento pillar definitions ────────────────────────────────────────────────

const PILLARS = [
  {
    href: '/ai',
    icon: Zap,
    label: 'DCYFR AI',
    description:
      'Portable multi-provider agent with telemetry, quality gates, and a plugin marketplace.',
  },
  {
    href: '/blog',
    icon: FileText,
    label: 'Blog',
    description: 'Articles on AI engineering, cybersecurity, and modern full-stack development.',
  },
  {
    href: '/work',
    icon: Briefcase,
    label: 'Work',
    description: 'Client work, open-source contributions, and side projects from the lab.',
  },
  {
    href: '/open-source',
    icon: Package,
    label: 'Open Source',
    description: 'npm packages for AI agents, CLI tooling, RAG, and code generation.',
  },
] as const;

// ── AI feature chips ────────────────────────────────────────────────────────

const AI_FEATURES = [
  'Plugin Architecture',
  'Multi-Provider',
  'Built-in Telemetry',
  'Quality Gates',
] as const;

// ============================================================================

export default async function Home() {
  const nonce = (await headers()).get('x-nonce') || '';
  const socialImage = getOgImageUrl();

  const yearsExp = getYearsOfExperience();
  const credlyData = await getCredlyBadges().catch(() => null);
  const certCount = credlyData?.totalCount ?? 25;

  const publishedPosts = posts.filter((p) => !p.draft && !p.archived);
  const sortedPosts = [...publishedPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const featuredPost = featuredPosts[0] ?? sortedPosts[0];

  // Show up to 5 posts that aren't the featured one
  const latestPosts = sortedPosts.filter((p) => p.id !== featuredPost?.id).slice(0, 5);

  // Derive topics server-side — no Redis, no layout shift
  const topicMap = publishedPosts
    .flatMap((p) => p.tags)
    .reduce<Map<string, number>>((acc, tag) => {
      acc.set(tag, (acc.get(tag) ?? 0) + 1);
      return acc;
    }, new Map());
  const topics = [...topicMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: pageDescription,
        publisher: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: AUTHOR_NAME,
        url: SITE_URL,
        image: socialImage,
        description: pageDescription,
        jobTitle: 'Founding Architect',
        sameAs: getSocialUrls(),
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_TITLE,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        description: pageDescription,
        inLanguage: 'en-US',
        image: socialImage,
        datePublished: SITE_LAUNCH_DATE,
        dateModified: SITE_LAST_UPDATED_DATE,
      },
    ],
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center pt-16 md:pt-28 lg:pt-32 pb-12 md:pb-16">
        <div
          className={cn(
            'w-full mx-auto text-center',
            CONTAINER_WIDTHS.thread,
            CONTAINER_PADDING,
            'opacity-0 translate-y-2 animate-fade-in-up'
          )}
          style={{
            animationDelay: `${ANIMATION_CONSTANTS.stagger.normal}ms`,
            animationFillMode: 'forwards',
          }}
        >
          <h1 className="sr-only">DCYFR Labs</h1>
          <SiteLogo size="xl" showIcon={false} />

          <p className={cn(TYPOGRAPHY.description, 'mt-5')}>
            Think Freely. Build Securely. Ship Boldly.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <SearchButton variant="input" />
          </div>

          <div className="mt-8">
            <HomepageHeroActions />
          </div>
        </div>
      </div>

      {/* ── Credential proof ──────────────────────────────────────────────── */}
      <div className="border-t border-border/40">
        <div
          className={cn(
            'mx-auto grid grid-cols-3 gap-4 sm:gap-6 text-center',
            CONTAINER_VERTICAL_PADDING,
            CONTAINER_WIDTHS.thread,
            CONTAINER_PADDING,
            'opacity-0 translate-y-2 animate-fade-in-up'
          )}
          style={{
            animationDelay: `${ANIMATION_CONSTANTS.stagger.normal * 2}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {[
            { stat: `${yearsExp}+`, label: 'Years security architecture' },
            { stat: String(certCount), label: 'Industry certifications' },
            { stat: '4', label: 'npm packages shipped' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className={cn(TYPOGRAPHY.h3.standard, 'tabular-nums')}>{stat}</p>
              <p className={cn(TYPOGRAPHY.metadata, 'mt-0.5 opacity-60')}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Four pillars bento ────────────────────────────────────────────── */}
      <section
        className={cn(
          'border-t border-border/50',
          'mx-auto',
          CONTAINER_WIDTHS.standard,
          CONTAINER_PADDING,
          CONTAINER_VERTICAL_PADDING,
          'opacity-0 translate-y-2 animate-fade-in-up'
        )}
        style={{
          animationDelay: `${ANIMATION_CONSTANTS.stagger.normal * 2}ms`,
          animationFillMode: 'forwards',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex flex-col gap-4 rounded-xl border border-border/50 p-5',
                HOVER_EFFECTS.card,
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              )}
            >
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="flex-1">
                <p
                  className={cn(
                    TYPOGRAPHY.h3.standard,
                    'group-hover:text-primary transition-colors mb-1.5'
                  )}
                >
                  {label}
                </p>
                <p className={cn(TYPOGRAPHY.metadata, 'leading-relaxed')}>{description}</p>
              </div>
              <div className={cn('flex items-center gap-1', TYPOGRAPHY.label.xs, 'text-primary')}>
                Explore
                <ArrowRight
                  className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured post ─────────────────────────────────────────────────── */}
      {featuredPost && (
        <section
          className={cn(
            'border-t border-border/50',
            'mx-auto',
            CONTAINER_WIDTHS.standard,
            CONTAINER_PADDING,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <FeaturedPostHero post={featuredPost} />
        </section>
      )}

      {/* ── From the blog ─────────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section
          className={cn(
            'border-t border-border/50',
            'mx-auto',
            CONTAINER_WIDTHS.standard,
            CONTAINER_PADDING,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <div className={cn('flex items-center justify-between', SPACING.sectionDivider.heading)}>
            <h2 className={TYPOGRAPHY.h2.standard}>From the blog</h2>
            <Link
              href="/blog"
              className={cn(
                TYPOGRAPHY.metadata,
                'flex items-center gap-1 hover:text-primary transition-colors'
              )}
            >
              All articles
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-border/50">
            {latestPosts.map((post) => {
              const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${encodeURIComponent(post.slug)}`}
                  className={cn(
                    'group flex items-center justify-between gap-4 py-4',
                    '-mx-2 px-2 rounded-lg',
                    'transition-colors hover:bg-muted/50',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {post.tags[0] && (
                      <p className={cn(TYPOGRAPHY.label.xs, 'text-primary mb-0.5')}>
                        {post.tags[0]}
                      </p>
                    )}
                    <p
                      className={cn(
                        TYPOGRAPHY.h3.standard,
                        'truncate group-hover:text-primary transition-colors'
                      )}
                    >
                      {post.title}
                    </p>
                  </div>
                  <div className={cn('flex items-center gap-3 shrink-0', TYPOGRAPHY.metadata)}>
                    <span className="hidden sm:inline">{date}</span>
                    <span>{post.readingTime.minutes} min</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── AI framework spotlight ─────────────────────────────────────────── */}
      <section
        className={cn(
          'border-t border-border/50',
          'mx-auto',
          CONTAINER_WIDTHS.standard,
          CONTAINER_PADDING,
          CONTAINER_VERTICAL_PADDING
        )}
      >
        <Link
          href="/ai"
          className={cn(
            'group flex flex-col sm:flex-row gap-6 rounded-xl border border-border/50 bg-muted/20 p-6',
            HOVER_EFFECTS.card,
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className={cn(TYPOGRAPHY.label.xs, 'text-primary')}>
                @dcyfr/ai · Open Source · MIT
              </span>
            </div>

            <h2 className={cn(TYPOGRAPHY.h2.standard, 'mb-2')}>DCYFR AI</h2>

            <p className={cn(TYPOGRAPHY.metadata, 'mb-5 max-w-lg leading-relaxed')}>
              Portable framework with plugin architecture, multi-provider support (OpenAI,
              Anthropic, Ollama), built-in telemetry, and quality gates. TypeScript-strict,
              tree-shakeable.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {AI_FEATURES.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs font-medium">
                  {feature}
                </Badge>
              ))}
            </div>

            <div
              className={cn(
                'inline-flex items-center gap-1.5',
                TYPOGRAPHY.label.small,
                'text-primary'
              )}
            >
              Explore the framework
              <ArrowRight
                className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex items-center sm:items-end shrink-0">
            <code className="font-mono text-sm bg-background border border-border/40 rounded-lg px-4 py-3 text-foreground/80 whitespace-nowrap">
              npm install @dcyfr/ai
            </code>
          </div>
        </Link>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section
        className={cn(
          'border-t border-border/50',
          'mx-auto',
          CONTAINER_WIDTHS.standard,
          CONTAINER_PADDING,
          CONTAINER_VERTICAL_PADDING
        )}
      >
        <NewsletterSignup
          variant="card"
          title="Stay in the loop"
          description="New articles on AI engineering, cybersecurity, and security architecture — delivered to your inbox."
        />
      </section>

      {/* ── Browse by topic ───────────────────────────────────────────────── */}
      {topics.length > 0 && (
        <section
          className={cn(
            'border-t border-border/50',
            'mx-auto',
            CONTAINER_WIDTHS.standard,
            CONTAINER_PADDING,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <h2 className={cn(TYPOGRAPHY.h2.standard, SPACING.sectionDivider.heading)}>
            Browse by topic
          </h2>
          <div className="flex flex-wrap gap-2">
            {topics.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5',
                  TYPOGRAPHY.metadata,
                  'hover:border-border hover:text-foreground hover:bg-muted/50 transition-colors'
                )}
              >
                {tag}
                <span className="opacity-40 text-xs">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
