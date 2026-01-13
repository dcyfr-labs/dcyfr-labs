"use client";

import { useEffect } from "react";

/**
 * useAnchorExpansion - Auto-expand collapsed components when navigating to anchor links
 *
 * When a user navigates to an anchor link (e.g., #some-heading), this hook:
 * 1. Waits for the target element to exist in the DOM
 * 2. Checks if it's inside a collapsed component
 * 3. Automatically expands that component
 *
 * Supports:
 * - CollapsibleSection: Triggers button click to expand
 * - Footnotes: Triggers button click to expand
 * - RiskAccordion: Triggers button click to expand
 *
 * Usage:
 * ```tsx
 * export default function BlogPost() {
 *   useAnchorExpansion();
 *   return <BlogContent />;
 * }
 * ```
 */
export function useAnchorExpansion() {
  useEffect(() => {
    const handleHashChange = () => {
      expandTargetIfCollapsed();
    };

    // Check on initial load (if hash is present)
    if (typeof window !== "undefined" && window.location.hash) {
      expandTargetIfCollapsed();
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
}

/**
 * Find and expand the component containing the target element
 */
function expandTargetIfCollapsed() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  if (!hash) return;

  // Remove the # prefix
  const elementId = hash.slice(1);
  if (!elementId) return;

  // Wait a bit for DOM to be ready, then try to find and expand
  setTimeout(() => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) return;

    // Check if target is inside a collapsed component
    expandCollapsedAncestors(targetElement);

    // Scroll to target (browser does this by default, but in case it didn't)
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/**
 * Traverse up the DOM tree to find and expand any collapsed components
 */
function expandCollapsedAncestors(element: Element) {
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    // Check for CollapsibleSection
    const collapsibleContent = findParentWithId(current, (el) =>
      el.id?.startsWith("collapsible-content-")
    );
    if (collapsibleContent) {
      expandCollapsibleSection(collapsibleContent);
      return;
    }

    // Check for Footnotes
    if (current.id === "footnotes-content") {
      expandFootnotes(current);
      return;
    }

    // Check for RiskAccordion
    const riskContent = findParentWithId(current, (el) =>
      el.id?.startsWith("risk-") && el.id?.endsWith("-content")
    );
    if (riskContent) {
      expandRiskAccordion(riskContent);
      return;
    }

    current = current.parentElement;
  }
}

/**
 * Find parent element matching a predicate
 */
function findParentWithId(
  element: Element,
  predicate: (el: Element) => boolean
): Element | null {
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    if (predicate(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Expand a CollapsibleSection by clicking its toggle button
 * Content div has id like: collapsible-content-{id}
 * Button has aria-controls pointing to that id
 */
function expandCollapsibleSection(contentElement: Element) {
  // Find the button that controls this content
  const ariaControlsValue = contentElement.id;

  // Search for button with matching aria-controls
  const button = document.querySelector<HTMLButtonElement>(
    `button[aria-controls="${ariaControlsValue}"]`
  );

  if (button && button.getAttribute("aria-expanded") === "false") {
    button.click();
  }
}

/**
 * Expand Footnotes by clicking its toggle button
 */
function expandFootnotes(contentElement: Element) {
  // Footnotes content has id "footnotes-content"
  const button = document.querySelector<HTMLButtonElement>(
    'button[aria-controls="footnotes-content"]'
  );

  if (button && button.getAttribute("aria-expanded") === "false") {
    button.click();
  }
}

/**
 * Expand a RiskAccordion by clicking its toggle button
 * Content div has id like: risk-{id}-content
 * Button has aria-controls pointing to that id
 */
function expandRiskAccordion(contentElement: Element) {
  const ariaControlsValue = contentElement.id;

  // Search for button with matching aria-controls
  const button = document.querySelector<HTMLButtonElement>(
    `button[aria-controls="${ariaControlsValue}"]`
  );

  if (button && button.getAttribute("aria-expanded") === "false") {
    button.click();
  }
}
