/**
 * Years of Experience Calculator
 * 
 * Calculates total years of experience from all dated resume items:
 * - Work experience
 * - Education
 * - Certifications (from Credly)
 */

import { getYearsOfExperience as getBaseYears } from "@/data/resume";
import { fetchCredlyBadgesCached } from "@/lib/credly-cache";

/**
 * Calculate years of experience including Credly certification dates
 * 
 * This function:
 * 1. Fetches Credly badges to get certification issue dates
 * 2. Passes all dates to getYearsOfExperience()
 * 3. Returns the calculated years from the earliest dated item
 * 
 * @param username - Credly username (defaults to "dcyfr")
 * @returns Promise resolving to number of years
 * 
 * @example
 * ```typescript
 * const years = await calculateYearsWithCertifications();
 * console.warn(`${years}+ years of experience`);
 * ```
 */
export async function calculateYearsWithCertifications(
  username: string = "dcyfr"
): Promise<number> {
  try {
    // Fetch Credly badges to get certification dates
    const data = await fetchCredlyBadgesCached(username);
    const badges = data.badges || [];
    
    // Extract issued_at dates from badges
    const certDates = badges
      .filter(badge => badge.issued_at)
      .map(badge => badge.issued_at);
    
    // Calculate years including certification dates
    return getBaseYears(certDates);
  } catch (error) {
    // If Credly fetch fails, fallback to base calculation
    console.warn("Failed to fetch Credly data for years calculation:", error);
    return getBaseYears();
  }
}

/**
 * Calculate years of experience (sync version without certifications)
 * 
 * Use this when you can't use async/await or don't need certification dates.
 * Only considers work experience and education.
 * 
 * @returns Number of years from experience and education only
 */
export function calculateYearsSync(): number {
  return getBaseYears();
}
