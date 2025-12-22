/**
 * Reusable dropdown hook with click-outside detection and keyboard support
 *
 * Consolidates dropdown logic used across:
 * - SiteHeader (blog/work dropdowns)
 * - DevToolsDropdown
 * - Any future dropdown menus
 *
 * Features:
 * - Click-outside detection
 * - Escape key to close
 * - Optional keyboard navigation
 * - ARIA attributes for accessibility
 *
 * @example
 * ```tsx
 * function MyDropdown() {
 *   const { isOpen, toggle, close, ref, triggerProps, contentProps } = useDropdown();
 *
 *   return (
 *     <div ref={ref}>
 *       <button {...triggerProps}>Toggle</button>
 *       {isOpen && <div {...contentProps}>Content</div>}
 *     </div>
 *   );
 * }
 * ```
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface UseDropdownOptions {
  /**
   * Initial open state
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state
   */
  isOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Close on Escape key
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Close on click outside
   * @default true
   */
  closeOnClickOutside?: boolean;
}

export interface UseDropdownReturn {
  /**
   * Whether the dropdown is open (controlled or uncontrolled)
   */
  isOpen: boolean;
  /**
   * Open the dropdown
   */
  open: () => void;
  /**
   * Close the dropdown
   */
  close: () => void;
  /**
   * Toggle the dropdown
   */
  toggle: () => void;
  /**
   * Ref to attach to the dropdown container
   * Required for click-outside detection
   */
  ref: React.RefObject<HTMLDivElement | null>;
  /**
   * Props to spread on the trigger button
   * Includes: onClick, aria-haspopup, aria-expanded
   */
  triggerProps: {
    onClick: () => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
  };
  /**
   * Props to spread on the dropdown content
   * Includes: role
   */
  contentProps: {
    role: "menu";
  };
}

/**
 * Hook for managing dropdown state and interactions
 */
export function useDropdown(options: UseDropdownOptions = {}): UseDropdownReturn {
  const {
    defaultOpen = false,
    isOpen: controlledIsOpen,
    onOpenChange,
    closeOnEscape = true,
    closeOnClickOutside = true,
  } = options;

  // Uncontrolled state
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const ref = useRef<HTMLDivElement | null>(null);

  /**
   * Update open state (handles both controlled and uncontrolled)
   */
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledIsOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  /**
   * Open the dropdown
   */
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);

  /**
   * Close the dropdown
   */
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  /**
   * Toggle the dropdown
   */
  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

  /**
   * Click-outside detection
   */
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    }

    // Add listener on next tick to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [closeOnClickOutside, isOpen, close]);

  /**
   * Escape key handler
   */
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeOnEscape, isOpen, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    ref,
    triggerProps: {
      onClick: toggle,
      "aria-haspopup": "menu" as const,
      "aria-expanded": isOpen,
    },
    contentProps: {
      role: "menu" as const,
    },
  };
}
