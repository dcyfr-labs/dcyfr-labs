/**
 * Fetch live package metadata from the npm registry.
 *
 * Uses two public npm APIs (no auth required):
 *   - https://registry.npmjs.org/{pkg}/latest  → version
 *   - https://api.npmjs.org/downloads/point/last-month/{pkg}  → monthly downloads
 *
 * Results are keyed by package name.
 * If a fetch fails for any package, that entry is null (caller falls back gracefully).
 */

export interface NpmPackageStats {
  name: string;
  version: string;
  monthlyDownloads: number | null;
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'dcyfr-labs/1.0' },
      // Tell Next.js to revalidate this cached fetch every hour
      next: { revalidate: 3600 },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOnePackage(name: string): Promise<NpmPackageStats | null> {
  try {
    const [registryRes, downloadsRes] = await Promise.all([
      fetchWithTimeout(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`),
      fetchWithTimeout(
        `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`
      ),
    ]);

    if (!registryRes.ok) return null;
    const registry = (await registryRes.json()) as { version?: string };
    const version = registry.version ?? null;
    if (!version) return null;

    let monthlyDownloads: number | null = null;
    if (downloadsRes.ok) {
      const dl = (await downloadsRes.json()) as { downloads?: number };
      monthlyDownloads = dl.downloads ?? null;
    }

    return { name, version, monthlyDownloads };
  } catch {
    return null;
  }
}

/**
 * Fetch stats for multiple npm packages in parallel.
 * Returns a map of package name → stats (or null if unavailable).
 */
export async function fetchPackageStats(
  packageNames: readonly string[]
): Promise<Record<string, NpmPackageStats | null>> {
  const results = await Promise.all(packageNames.map(fetchOnePackage));
  return Object.fromEntries(packageNames.map((name, i) => [name, results[i]]));
}

/** Format a download count as a human-readable string (e.g. "1.2k", "34"). */
export function formatDownloads(count: number | null | undefined): string {
  if (count == null) return '—';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}
