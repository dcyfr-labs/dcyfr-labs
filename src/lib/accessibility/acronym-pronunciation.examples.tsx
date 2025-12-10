/**
 * Example: Using Acronym Pronunciation Utilities
 *
 * This file demonstrates different patterns for implementing
 * screen reader-friendly acronym pronunciation in components.
 *
 * Reference: docs/accessibility/acronym-pronunciation.md
 */

import React from 'react';
import {
  getAcronymLabel,
  getAcronymExplanation,
  validateAcronymPronunciations,
} from '@/lib/accessibility/acronym-pronunciation';

/**
 * Example 1: Logo with pronunciation hint
 * - Uses aria-label for semantic naming
 * - Screen readers announce: "DCYFR (Decipher) Labs"
 */
export function LogoExample() {
  return (
    <div className="flex items-center gap-2">
      {/* In actual implementation, Logo component includes this */}
      <svg
        role="img"
        aria-label={getAcronymLabel('DCYFR', 'Labs')}
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
      </svg>
      <span>DCYFR Labs</span>
    </div>
  );
}

/**
 * Example 2: First mention in article with hidden explanation
 * - Visible text: "DCYFR"
 * - Screen readers also hear: "(pronounced: Decipher)"
 * - Sighted users see nothing extra
 */
export function FirstMentionExample() {
  return (
    <article>
      <p>
        <strong>
          {getAcronymLabel('DCYFR')}
          <span className="sr-only">{getAcronymExplanation('DCYFR')}</span>
        </strong>
        {' '}is an AI assistant focused on automating security reviews and code documentation.
      </p>
    </article>
  );
}

/**
 * Example 3: Team member description
 * - Include pronunciation in visible text for clarity
 * - Works for both screen readers and sighted users
 */
export function TeamMemberExample() {
  return (
    <div>
      <h2>Meet DCYFR</h2>
      <p>
        DCYFR (pronounced &quot;Decipher&quot;) is an AI lab assistant dedicated to
        enhancing developer productivity with intelligent code review and
        security analysis.
      </p>
    </div>
  );
}

/**
 * Example 4: Reusable component with fallback
 * - Creates a semantic glossary reference
 * - Includes both aria-label and visual indication
 */
export function AcronymBadgeExample({
  acronym,
  children,
}: {
  acronym: string;
  children: React.ReactNode;
}) {
  return (
    <abbr
      title={getAcronymLabel(acronym)}
      aria-label={getAcronymLabel(acronym)}
      className="cursor-help border-b border-dashed"
    >
      {children}
    </abbr>
  );
}

/**
 * Example 5: Validation during development
 * - Check all acronyms have pronunciations defined
 * - Useful in tests or build scripts
 */
export function validateAcronymsExample() {
  const acronymsUsedInProject = ['DCYFR', 'API', 'CVE'];
  const missingPronunciations =
    validateAcronymPronunciations(acronymsUsedInProject);

  if (missingPronunciations.length > 0) {
    console.warn(
      `⚠️ Missing pronunciations for: ${missingPronunciations.join(', ')}`
    );
    console.warn('Add them to ACRONYM_PRONUNCIATIONS in src/lib/accessibility/acronym-pronunciation.ts');
  }

  return missingPronunciations;
}

/**
 * Example 6: Multiple acronyms in text
 * - Each acronym gets proper pronunciation
 * - Screen readers understand all terms
 */
export function MultipleAcronymsExample() {
  return (
    <section>
      <h2>
        <abbr aria-label={getAcronymLabel('DCYFR')}>DCYFR</abbr>
        {' '}Security Framework
      </h2>
      <p>
        Our <abbr aria-label={getAcronymLabel('DCYFR')}>DCYFR</abbr> approach
        integrates <abbr title="API">API</abbr> security with code review best practices.
      </p>
    </section>
  );
}

/**
 * Example 7: Responsive pronunciation for different contexts
 * - Short version for labels
 * - Long version for descriptions
 */
export function ContextualPronunciationExample() {
  return (
    <div>
      {/* In header navigation - short */}
      <button aria-label={getAcronymLabel('DCYFR')}>
        DCYFR
      </button>

      {/* In detailed description - full context */}
      <div>
        <strong>About {getAcronymLabel('DCYFR', 'Labs')}:</strong>
        <p>
          DCYFR (pronounced &quot;Decipher&quot;) was founded to bring security-first
          thinking to modern development practices.
        </p>
      </div>
    </div>
  );
}
