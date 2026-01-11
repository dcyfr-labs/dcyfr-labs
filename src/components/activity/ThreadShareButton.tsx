/**
 * Thread Share Button Component
 *
 * Dropdown menu with share options:
 * - Native Share API (mobile)
 * - Twitter/X
 * - LinkedIn
 * - Copy Link
 *
 * Progressively enhances based on device capabilities.
 *
 * @example
 * ```tsx
 * <ThreadShareButton
 *   activity={{
 *     id: "post-123",
 *     title: "My Blog Post",
 *     description: "Great content",
 *     href: "/blog/my-post"
 *   }}
 * />
 * ```
 */

"use client";

import { Share2, Twitter, Linkedin, Link2, Check, Code2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useShare, openShareWindow } from "@/hooks/use-share";
import { cn } from "@/lib/utils";
import { ANIMATION, SEMANTIC_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ThreadShareButtonProps {
  /** Activity data for sharing */
  activity: {
    id: string;
    title: string;
    description?: string;
    href: string;
  };
  /** Optional CSS class */
  className?: string;
  /** Button variant */
  variant?: "default" | "ghost" | "outline";
  /** Button size */
  size?: "default" | "sm" | "icon";
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Share button with dropdown menu of share options
 */
export function ThreadShareButton({
  activity,
  className,
  variant = "ghost",
  size = "sm",
}: ThreadShareButtonProps) {
  const {
    share,
    canUseNativeShare,
    copyToClipboard,
    getSocialUrls,
    recentlyCopied,
  } = useShare();

  // Build full URL for sharing
  const fullUrl = activity.href
    ? typeof window !== "undefined"
      ? `${window.location.origin}${activity.href}`
      : activity.href
    : undefined;

  const isShareable = !!fullUrl;

  const shareData = {
    title: activity.title,
    text: activity.description,
    url: fullUrl || "",
  };

  const socialUrls = getSocialUrls(shareData);

  // Handle native share (mobile)
  const handleNativeShare = () => {
    if (!isShareable) return;
    share(shareData, {
      onSuccess: () => console.warn("[Share] Native share succeeded"),
      onError: (error) => console.error("[Share] Native share failed:", error),
    });
  };

  // Handle social media share
  const handleSocialShare = (url: string, platform: string) => {
    openShareWindow(url, `Share on ${platform}`);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    if (!isShareable) return;
    await copyToClipboard(fullUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-1.5", className)}
          aria-label="Share options"
          disabled={!isShareable}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Share</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share (if available) */}
        {canUseNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Share...</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Twitter/X */}
        <DropdownMenuItem
          onClick={() => handleSocialShare(socialUrls.twitter, "Twitter/X")}
        >
          <Twitter className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Share on Twitter/X</span>
        </DropdownMenuItem>

        {/* DEV */}
        <DropdownMenuItem
          onClick={() => handleSocialShare(socialUrls.dev, "DEV")}
        >
          <Code2 className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Share on DEV</span>
        </DropdownMenuItem>

        {/* LinkedIn */}
        <DropdownMenuItem
          onClick={() => handleSocialShare(socialUrls.linkedin, "LinkedIn")}
        >
          <Linkedin className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Share on LinkedIn</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          {recentlyCopied ? (
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                SEMANTIC_COLORS.alert.success.icon,
                ANIMATION.transition.fast
              )}
              aria-hidden="true"
            />
          ) : (
            <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          <span>{recentlyCopied ? "Copied!" : "Copy link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
