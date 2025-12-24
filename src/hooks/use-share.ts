/**
 * Share Functionality Hook
 *
 * Provides sharing capabilities for activities with progressive enhancement:
 * - Native Share API for mobile devices
 * - Social media links for desktop
 * - Copy to clipboard fallback
 *
 * @example
 * ```tsx
 * function ShareButton({ activity }) {
 *   const { share, canUseNativeShare, copyToClipboard } = useShare();
 *
 *   return (
 *     <button onClick={() => share({
 *       title: activity.title,
 *       text: activity.description,
 *       url: activity.href
 *     })}>
 *       Share
 *     </button>
 *   );
 * }
 * ```
 */

"use client";

import { useState, useCallback, useEffect } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface ShareData {
  /** Title to share */
  title: string;
  /** Description/text to share */
  text?: string;
  /** URL to share */
  url: string;
}

export interface ShareOptions {
  /** Callback when share succeeds */
  onSuccess?: () => void;
  /** Callback when share fails */
  onError?: (error: Error) => void;
}

export interface UseShareReturn {
  /** Share content using native API or fallback */
  share: (data: ShareData, options?: ShareOptions) => Promise<void>;

  /** Check if native share API is available */
  canUseNativeShare: boolean;

  /** Copy text to clipboard */
  copyToClipboard: (text: string) => Promise<boolean>;

  /** Generate social media share URLs */
  getSocialUrls: (data: ShareData) => SocialShareUrls;

  /** Current sharing state */
  isSharing: boolean;

  /** Recently copied state (for UI feedback) */
  recentlyCopied: boolean;
}

export interface SocialShareUrls {
  twitter: string;
  linkedin: string;
  facebook: string;
  email: string;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for sharing activities
 */
export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);

  // Detect native share API availability
  useEffect(() => {
    setCanUseNativeShare(
      typeof navigator !== "undefined" && "share" in navigator
    );
  }, []);

  /**
   * Copy text to clipboard with modern API
   */
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setRecentlyCopied(true);

        // Reset "recently copied" state after 2 seconds
        setTimeout(() => setRecentlyCopied(false), 2000);

        return true;
      }

      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setRecentlyCopied(true);
        setTimeout(() => setRecentlyCopied(false), 2000);
        return true;
      }

      return false;
    } catch (error) {
      console.error("[Share] Clipboard error:", error);
      return false;
    }
  }, []);

  /**
   * Main share function with progressive enhancement
   */
  const share = useCallback(
    async (data: ShareData, options?: ShareOptions): Promise<void> => {
      setIsSharing(true);

      try {
        // Try native share API first (mobile)
        if (canUseNativeShare && navigator.share) {
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url,
          });

          options?.onSuccess?.();
        } else {
          // Fallback: Copy link to clipboard
          const success = await copyToClipboard(data.url);

          if (success) {
            options?.onSuccess?.();
          } else {
            throw new Error("Failed to copy to clipboard");
          }
        }
      } catch (error) {
        // User cancelled or error occurred
        const err =
          error instanceof Error ? error : new Error("Share failed");

        // Don't treat user cancellation as an error
        if (err.name !== "AbortError") {
          console.error("[Share] Error:", err);
          options?.onError?.(err);
        }
      } finally {
        setIsSharing(false);
      }
    },
    [canUseNativeShare, copyToClipboard]
  );

  /**
   * Generate social media share URLs
   */
  const getSocialUrls = useCallback((data: ShareData): SocialShareUrls => {
    const encodedUrl = encodeURIComponent(data.url);
    const encodedTitle = encodeURIComponent(data.title);
    const encodedText = encodeURIComponent(data.text || data.title);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    };
  }, []);

  return {
    share,
    canUseNativeShare,
    copyToClipboard,
    getSocialUrls,
    isSharing,
    recentlyCopied,
  };
}

/**
 * Utility: Open share URL in new window
 * (Used by social media share buttons)
 */
export function openShareWindow(url: string, title: string = "Share"): void {
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;

  const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0`;

  window.open(url, title, features);
}
