import { Button } from '@/components/ui/button';

interface RSSFeedButtonProps {
  /** RSS feed URL (defaults to /blog/rss.xml) */
  href?: string;
}

/**
 * RSS Feed Button Component
 *
 * Reusable button for subscribing to RSS feeds.
 * Displays RSS icon and link to feed URL.
 *
 * Uses design system Button component with asChild pattern for proper styling.
 *
 * @example
 * ```tsx
 * <RSSFeedButton /> // defaults to /blog/rss.xml
 * <RSSFeedButton href="/work/rss.xml" />
 * <RSSFeedButton href="/activity/rss.xml" />
 * ```
 */
export function RSSFeedButton({ href = "/blog/rss.xml" }: RSSFeedButtonProps = {}) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className="rounded-full"
    >
      <a
        href={href}
        title="Subscribe to RSS feed"
        aria-label="Subscribe to RSS feed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3.429 2.571v18.857h18.857V2.571H3.429zm16.071 16.072H5.214V4.357H19.5v14.286zM8.25 14.893a2.036 2.036 0 1 1 0 4.071 2.036 2.036 0 0 1 0-4.071zm0 0M6.321 6.536v2.25c5.625 0 10.179 4.554 10.179 10.178h2.25c0-6.857-5.571-12.428-12.429-12.428zm0 4.5v2.25a5.679 5.679 0 0 1 5.679 5.678h2.25A7.929 7.929 0 0 0 6.321 11.036z"/>
        </svg>
        RSS Feed
      </a>
    </Button>
  );
}
