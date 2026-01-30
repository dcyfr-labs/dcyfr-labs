<!-- TLP:CLEAR -->

# METADATA_ONLY.ts Template

Template for pages that only generate metadata (e.g., `opengraph-image.tsx`, `twitter-image.tsx`, route groups).

**Use this when:** Creating image generation routes or metadata-only files.

---

## OpenGraph Image Template

```typescript
// src/app/your-route/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { SITE_TITLE_PLAIN } from "@/lib/site-config";

export const runtime = "edge";
export const alt = "Your Alt Text";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generate OpenGraph image for route
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #1e40af, #7c3aed)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            color: "white",
            marginBottom: 16,
          }}
        >
          {SITE_TITLE_PLAIN}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Your Page Title
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## Dynamic Metadata Template

```typescript
// src/app/your-route/layout.tsx or page.tsx
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

/**
 * Generate metadata dynamically based on params
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch data based on slug
  const data = await fetchData(slug);
  
  if (!data) {
    return {
      title: "Not Found",
    };
  }
  
  return createPageMetadata({
    title: data.title,
    description: data.description,
    path: `/your-route/${slug}`,
  });
}
```

---

## Static Metadata Template

```typescript
// src/app/your-route/page.tsx
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

/**
 * Static metadata for route
 */
export const metadata: Metadata = createPageMetadata({
  title: "Your Title",
  description: "Your description",
  path: "/your-route",
});

export default function Page() {
  return <div>Content</div>;
}
```

---

## Route Group Metadata

```typescript
// src/app/(group)/layout.tsx
import type { Metadata } from "next";

/**
 * Shared metadata for route group
 */
export const metadata: Metadata = {
  // Shared metadata for all routes in group
  openGraph: {
    type: "website",
    locale: "en_US",
  },
};

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

---

## Checklist

- [ ] Used appropriate metadata helper
- [ ] Set correct image dimensions (1200x630 for OG)
- [ ] Added alt text for images
- [ ] Tested metadata with metadata debugger
- [ ] Verified image renders correctly
- [ ] Ran linter (`npm run lint`)

---

## Related Templates

- [NEW_PAGE.tsx](./new-page.tsx) - Full page with metadata
- ARCHIVE_PAGE.tsx - Archive metadata

## Related Docs

- Metadata Generation
- OpenGraph Images
