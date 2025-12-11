/**
 * GitHub Sponsors API Integration
 * Fetches sponsor information from GitHub GraphQL API
 */

export interface Sponsor {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string;
  url: string;
  websiteUrl?: string | null;
  tier: {
    name: string;
    monthlyPriceInDollars: number;
  } | null;
  createdAt: string;
  isOneTime: boolean;
}

interface GitHubSponsorsResponse {
  data?: {
    user?: {
      sponsorshipsAsMaintainer: {
        totalCount: number;
        nodes: Array<{
          sponsorEntity: {
            __typename: string;
            login: string;
            name?: string;
            avatarUrl: string;
            url: string;
            websiteUrl?: string;
          };
          tier?: {
            name: string;
            monthlyPriceInDollars: number;
          };
          createdAt: string;
          isOneTimePayment: boolean;
        }>;
      };
    } | null;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

const GITHUB_USERNAME = "dcyfr";
const CACHE_TTL = 300; // 5 minutes in seconds

let cachedSponsors: Sponsor[] | null = null;
let cacheTimestamp: number | null = null;

/**
 * Fetches sponsors from GitHub Sponsors API
 * Uses GraphQL API with server-side caching (5 minutes)
 */
export async function getGitHubSponsors(): Promise<Sponsor[]> {
  // Check cache
  const now = Date.now();
  if (
    cachedSponsors &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_TTL * 1000
  ) {
    return cachedSponsors;
  }

  const token = process.env.GITHUB_TOKEN;

  // If no token, return empty array (sponsors API requires authentication)
  if (!token) {
    console.warn(
      "GITHUB_TOKEN not found. Sponsors data requires authentication."
    );
    return [];
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const query = `
    query($username: String!) {
      user(login: $username) {
        sponsorshipsAsMaintainer(first: 100, includePrivate: false) {
          totalCount
          nodes {
            sponsorEntity {
              __typename
              ... on User {
                login
                name
                avatarUrl
                url
                websiteUrl
              }
              ... on Organization {
                login
                name
                avatarUrl
                url
                websiteUrl
              }
            }
            tier {
              name
              monthlyPriceInDollars
            }
            createdAt
            isOneTimePayment
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: { username: GITHUB_USERNAME },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubSponsorsResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      // Log a non-sensitive summary of GraphQL errors
      console.error("GitHub GraphQL errors detected (count):", data.errors.length);
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    if (!data.data || !data.data.user) {
      // Avoid logging full response objects that may contain sensitive information
      console.error("GitHub API returned unexpected response: missing user data", Object.keys(data || {}));
      throw new Error("Invalid response from GitHub API - user not found");
    }

    const sponsors: Sponsor[] = data.data.user.sponsorshipsAsMaintainer.nodes
      .filter((node) => node.sponsorEntity) // Filter out null sponsors
      .map((node) => ({
        id: node.sponsorEntity.login,
        login: node.sponsorEntity.login,
        name: node.sponsorEntity.name || null,
        avatarUrl: node.sponsorEntity.avatarUrl,
        url: node.sponsorEntity.url,
        websiteUrl: node.sponsorEntity.websiteUrl,
        tier: node.tier || null,
        createdAt: node.createdAt,
        isOneTime: node.isOneTimePayment,
      }))
      .sort((a, b) => {
        // Sort by tier amount (highest first), then by date (newest first)
        const aTier = a.tier?.monthlyPriceInDollars || 0;
        const bTier = b.tier?.monthlyPriceInDollars || 0;
        if (aTier !== bTier) {
          return bTier - aTier;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    // Update cache
    cachedSponsors = sponsors;
    cacheTimestamp = now;

    return sponsors;
  } catch (error) {
    console.error("Error fetching GitHub sponsors:", error instanceof Error ? error.message : String(error));
    // Return cached data if available, otherwise empty array
    return cachedSponsors || [];
  }
}

/**
 * Manually clear the sponsors cache
 */
export function clearSponsorsCache(): void {
  cachedSponsors = null;
  cacheTimestamp = null;
}

/**
 * Get sponsors grouped by tier
 */
export async function getSponsorsByTier(): Promise<
  Map<number, Sponsor[]>
> {
  const sponsors = await getGitHubSponsors();
  const tierMap = new Map<number, Sponsor[]>();

  sponsors.forEach((sponsor) => {
    const amount = sponsor.tier?.monthlyPriceInDollars || 0;
    if (!tierMap.has(amount)) {
      tierMap.set(amount, []);
    }
    tierMap.get(amount)!.push(sponsor);
  });

  return tierMap;
}

/**
 * Get total sponsor count
 */
export async function getTotalSponsors(): Promise<number> {
  const sponsors = await getGitHubSponsors();
  return sponsors.length;
}
