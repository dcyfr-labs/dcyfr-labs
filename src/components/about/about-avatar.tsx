"use client";

import { ProfileAvatar, type AvatarSize } from "@/components/common";

/**
 * AboutAvatar Component (Deprecated - Use ProfileAvatar instead)
 * 
 * This is now a wrapper around ProfileAvatar for backward compatibility.
 * It provides the same functionality as before but delegates to the unified
 * ProfileAvatar component for maintainability.
 * 
 * @deprecated Use `ProfileAvatar` from `@/components/common` instead.
 * @see ProfileAvatar
 * 
 * @example
 * ```tsx
 * // ❌ Old way (still works)
 * import { AboutAvatar } from "@/components/about";
 * <AboutAvatar size="md" />
 * 
 * // ✅ New way (recommended)
 * import { ProfileAvatar } from "@/components/common";
 * <ProfileAvatar size="md" />
 * ```
 */

type AboutAvatarProps = {
  src?: string;
  alt?: string;
  size?: AvatarSize;
};

/**
 * Wrapper component for backward compatibility.
 * Delegates all props to ProfileAvatar.
 */
export function AboutAvatar({
  src = "/images/avatar.jpg",
  alt = "Profile photo",
  size = "md",
}: AboutAvatarProps) {
  return <ProfileAvatar src={src} alt={alt} size={size} />;
}

