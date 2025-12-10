/**
 * Acronym Pronunciation Utility
 *
 * Provides helpers to add pronunciation hints for acronyms that should be
 * pronounced as words (e.g., DCYFR → "Decipher").
 *
 * Usage:
 * - React: <span aria-label={getAcronymLabel('DCYFR')}>DCYFR</span>
 * - HTML: <span aria-label="DCYFR (Decipher)">DCYFR</span>
 * - Component props: aria-label={getAcronymLabel('DCYFR')}
 */

/**
 * Pronunciation mapping for acronyms
 */
export const ACRONYM_PRONUNCIATIONS: Record<string, string> = {
  DCYFR: "Decipher",
  // Add more acronyms as needed:
  // CVE: "C V E",
  // API: "Application Programming Interface",
} as const;

/**
 * Get the full label for an acronym with pronunciation hint
 *
 * @param acronym - The acronym to label (e.g., "DCYFR")
 * @param context - Optional additional context (e.g., "Labs", "AI")
 * @returns Label for aria-label attribute (e.g., "DCYFR (Decipher) Labs")
 *
 * @example
 * ```tsx
 * <span aria-label={getAcronymLabel('DCYFR')}>DCYFR</span>
 * // aria-label="DCYFR (Decipher)"
 *
 * <span aria-label={getAcronymLabel('DCYFR', 'Labs')}>DCYFR Labs</span>
 * // aria-label="DCYFR (Decipher) Labs"
 * ```
 */
export function getAcronymLabel(
  acronym: string,
  context?: string
): string {
  const pronunciation = ACRONYM_PRONUNCIATIONS[acronym];

  if (!pronunciation) {
    console.warn(
      `Pronunciation not found for "${acronym}". Add it to ACRONYM_PRONUNCIATIONS.`
    );
    return acronym;
  }

  const withPronunciation = `${acronym} (${pronunciation})`;
  return context ? `${withPronunciation} ${context}` : withPronunciation;
}

/**
 * Create a screen reader-friendly acronym wrapper component
 *
 * @example
 * ```tsx
 * <AcronymSpan acronym="DCYFR">DCYFR</AcronymSpan>
 * ```
 */
export function createAcronymSpanProps(
  acronym: string,
  context?: string
): {
  "aria-label": string;
  role: string;
} {
  return {
    "aria-label": getAcronymLabel(acronym, context),
    role: "doc-glossref", // Semantic role for defined terms
  };
}

/**
 * Get hidden explanation text for screen readers
 *
 * @example
 * ```tsx
 * <span>
 *   DCYFR
 *   <span className="sr-only">{getAcronymExplanation('DCYFR')}</span>
 * </span>
 * ```
 */
export function getAcronymExplanation(acronym: string): string {
  const pronunciation = ACRONYM_PRONUNCIATIONS[acronym];
  return pronunciation ? `(pronounced: ${pronunciation})` : "";
}

/**
 * Validate that all acronyms in text have pronunciations defined
 *
 * @param text - Text containing acronyms to check
 * @param acronyms - Array of acronyms to validate
 * @returns Array of missing pronunciations
 *
 * @example
 * ```tsx
 * const missing = validateAcronymPronunciations("DCYFR API", ["DCYFR", "API"]);
 * if (missing.length > 0) console.warn(`Missing pronunciations: ${missing.join(", ")}`);
 * ```
 */
export function validateAcronymPronunciations(
  acronyms: string[]
): string[] {
  return acronyms.filter((a) => !ACRONYM_PRONUNCIATIONS[a]);
}
