"use client";

import dynamic from "next/dynamic";
import { TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Lazy-loaded comments wrapper
 *
 * Must be a client component because Next.js 16 doesn't allow
 * `ssr: false` with `next/dynamic` in Server Components.
 *
 * Defers loading of @giscus/react (~50KB) until component mounts.
 */

const GiscusComments = dynamic(
  () =>
    import("@/components/features/comments/giscus-comments").then((mod) => ({
      default: mod.GiscusComments,
    })),
  {
    loading: () => (
      <section className="mt-12 border-t pt-8">
        <h2 className={`mb-6 ${TYPOGRAPHY.h2.standard}`}>Comments</h2>
        <div className="h-40 skeleton-shimmer rounded-lg" />
      </section>
    ),
    ssr: false,
  }
);

export function LazyGiscusComments() {
  return <GiscusComments />;
}
