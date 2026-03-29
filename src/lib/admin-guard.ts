/**
 * Admin route guard — server-only
 *
 * Temporary environment-variable gate used while a proper auth layer
 * (GitHub OAuth, Supabase Auth, etc.) is being planned.
 *
 * To enable admin pages, set in your environment:
 *   ADMIN_DASHBOARD_ENABLED=true
 *
 * Replace with a real authentication layer before enabling in
 * production. Candidates: GitHub OAuth, Supabase Auth, NextAuth.js.
 */
import { notFound } from 'next/navigation';

export function assertAdminOr404(): void {
  if (process.env.ADMIN_DASHBOARD_ENABLED !== 'true') {
    notFound();
  }
}

/**
 * Generic feature flag guard for in-development pages.
 *
 * Usage: assertFeatureOr404('PLUGINS_ENABLED')
 *
 * Add the corresponding env var (set to 'true') to enable the feature.
 * Without it the page returns a 404 in all environments including production.
 */
export function assertFeatureOr404(envVar: string): void {
  if (process.env[envVar] !== 'true') {
    notFound();
  }
}
