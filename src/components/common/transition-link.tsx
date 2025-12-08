"use client";

/**
 * Transition Link Component
 * 
 * Drop-in replacement for Next.js Link that wraps navigation in View Transitions API.
 * Provides seamless page transitions when supported by the browser.
 * 
 * @example
 * ```tsx
 * <TransitionLink href="/blog/post-slug">
 *   Read more
 * </TransitionLink>
 * ```
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LinkProps } from "next/link";
import { MouseEvent } from "react";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({ 
  href, 
  children, 
  className,
  onClick,
  ...props 
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Allow custom onClick handler
    if (onClick) {
      onClick(e);
    }

    // Only intercept internal navigation
    const url = href.toString();
    if (url.startsWith("http") || url.startsWith("mailto:")) {
      return; // Let browser handle external links
    }

    // Check for View Transitions API support
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      e.preventDefault();
      
      (document as Document & { 
        startViewTransition: (callback: () => void) => void 
      }).startViewTransition(() => {
        router.push(url);
      });
    }
    // If not supported, use default Next.js Link behavior
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
