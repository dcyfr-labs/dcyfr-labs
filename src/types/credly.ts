/**
 * Credly API Types
 * 
 * Type definitions for Credly public API responses.
 * API endpoint: https://www.credly.com/users/{username}/badges.json
 */

export interface CredlyBadge {
  id: string;
  badge_template: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    skills: CredlySkill[];
  };
  image_url: string;
  issued_at: string;
  expires_at: string | null;
  issuer: {
    summary: string;
    entities: Array<{
      label: string;
      primary: boolean;
      entity: {
        type: string;
        id: string;
        name: string;
        url: string;
      };
    }>;
  };
  user: {
    id: string;
    name: string;
  };
}

export interface CredlySkill {
  id: string;
  name: string;
  vanity_slug: string;
}

export interface CredlyBadgesResponse {
  data: CredlyBadge[];
  metadata: {
    total_count: number;
    count: number;
    previous: string | null;
    next: string | null;
  };
}
