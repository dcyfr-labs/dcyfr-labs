import Link from 'next/link';
import { TYPOGRAPHY, Z_INDEX, NAVIGATION_HEIGHT } from '@/lib/design-tokens';

/**
 * Layout for all /dev/** routes
 *
 * Optimization: Forces dynamic rendering to prevent build-time generation
 * of development-only pages in preview/production builds.
 *
 * This layout ensures:
 * - No static generation during build (export const dynamic = "force-dynamic")
 * - All dev pages inherit this behavior
 * - Reduced build time and bundle size
 * - Dev nav positioned below site header (top-18 = 72px header height)
 * - Z-index below site header (z-30 vs z-40) for proper stacking
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Dev Tools Navigation Bar - positioned below site header */}
      <nav className={`border-b border-border bg-muted/30 sticky top-18 ${Z_INDEX.sticky} backdrop-blur supports-backdrop-filter:bg-muted/50`}>
        <div className="mx-auto max-w-[1536px] px-4 md:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link
              href="/dev"
              className={`${TYPOGRAPHY.metadata} font-semibold text-foreground hover:text-primary transition-colors`}
            >
              🛠️ Dev Tools
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link href="/dev/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                Analytics
              </Link>
              <Link href="/dev/licensing" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                Licensing
              </Link>
              <Link href="/dev/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                API
              </Link>
              <Link href="/dev/agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                Agents
              </Link>
              <Link href="/dev/mcp-health" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                MCP
              </Link>
              <Link href="/dev/seo" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1">
                SEO
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
