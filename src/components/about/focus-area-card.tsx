import Link from "next/link";
import { ReactNode } from "react";
import { CONTENT_HIERARCHY, HOVER_EFFECTS } from "@/lib/design-tokens";

interface FocusAreaCardProps {
  title: string;
  description: string | ReactNode;
  linkUrl?: string;
  linkText?: string;
}

/**
 * FocusAreaCard Component
 *
 * Reusable card for displaying focus areas, service pillars, or key offerings.
 * Used on About page and potentially other marketing/info pages.
 *
 * Supports optional CTA link for exploring related content.
 */
export function FocusAreaCard({
  title,
  description,
  linkUrl,
  linkText,
}: FocusAreaCardProps) {
  return (
    <div className={CONTENT_HIERARCHY.primary.container}>
      <p className={CONTENT_HIERARCHY.primary.title}>{title}</p>
      <p className={CONTENT_HIERARCHY.supporting.content}>
        {description}
        {linkUrl && linkText && (
          <Link
            href={linkUrl}
            className={`ml-1 underline ${HOVER_EFFECTS.link}`}
          >
            {linkText}
          </Link>
        )}
      </p>
    </div>
  );
}
