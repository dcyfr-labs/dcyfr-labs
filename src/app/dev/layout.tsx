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
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
