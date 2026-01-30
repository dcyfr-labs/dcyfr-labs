<!-- TLP:CLEAR -->

# Vercel Blob Integration Plan

> **Status**: Planned | **Priority**: Low | **Trigger**: When image assets exceed 50MB or video content is needed

## Overview

This document outlines the future integration of [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for managing large static assets (images, videos, documents) outside of the Git repository.

## Current State

### Image Configuration (Already Optimized)

```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  qualities: [75, 90],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'github.com',
      pathname: '/**',
    },
  ],
}
```

### Current Asset Statistics

| Metric | Value | Threshold |
|--------|-------|-----------|
| Git repo size | ~17 MB | &lt;500 MB |
| Largest image | ~120 KB | &lt;50 MB |
| Total images | ~15 files | No limit |
| Image formats | SVG, PNG, JPG | - |

## When to Migrate to Vercel Blob

Consider migration when:

1. **Size triggers**:
   - Individual images exceed 10 MB
   - Total `public/` assets exceed 100 MB
   - Git clone times noticeably slow

2. **Content triggers**:
   - Video content is needed
   - User-uploaded content is required
   - Dynamic OG images need caching

3. **Performance triggers**:
   - Build times increase significantly
   - Vercel deployment size limits approached

## Implementation Plan

### Phase 1: Setup (When Triggered)

1. **Enable Vercel Blob in Dashboard**
   ```bash
   # Via Vercel CLI
   vercel link
   vercel blob add-store
   ```

2. **Install SDK**
   ```bash
   npm install @vercel/blob
   ```

3. **Update next.config.ts**
   ```typescript
   images: {
     remotePatterns: [
       // Existing patterns...
       {
         protocol: 'https',
         hostname: '*.public.blob.vercel-storage.com',
       },
     ],
   }
   ```

### Phase 2: Migration Strategy

#### Option A: Manual Migration (Recommended for Static Assets)

For existing images in `public/`:

```typescript
// scripts/migrate-to-blob.ts
import { put } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function migrateImages() {
  const publicDir = './public/images';
  const files = await readdir(publicDir, { recursive: true });
  
  for (const file of files) {
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file)) {
      const content = await readFile(join(publicDir, file));
      const blob = await put(`images/${file}`, content, {
        access: 'public',
      });
      console.log(`Migrated: ${file} -> ${blob.url}`);
    }
  }
}
```

#### Option B: Upload API (For Dynamic Content)

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData();
  const file = form.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob);
}
```

### Phase 3: Component Updates

Create a unified image component that handles both local and Blob sources:

```typescript
// components/common/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, ...props }: OptimizedImageProps) {
  // Detect if source is from Vercel Blob
  const isBlob = src.includes('blob.vercel-storage.com');
  
  return (
    <Image
      src={src}
      {...props}
      // Blob images are already optimized at edge
      unoptimized={isBlob && src.endsWith('.svg')}
    />
  );
}
```

## Cost Considerations

### Vercel Blob Pricing (as of 2024)

| Tier | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Hobby | 1 GB | 1 GB/month | Free |
| Pro | 5 GB | 5 GB/month | Included |
| Additional | Per GB | Per GB | ~$0.03/GB |

### Optimization Tips

1. **Use appropriate formats**: WebP/AVIF for photos, SVG for icons
2. **Compress before upload**: Use tools like `sharp` or `imagemin`
3. **Set cache headers**: Vercel Blob supports custom cache-control
4. **Use CDN**: Blob URLs are already CDN-backed

## Environment Variables

When implemented, add to `.env.local`:

```bash
# Vercel Blob (auto-populated when linked)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

## Monitoring Checklist

Before migration, set up monitoring:

- [ ] Track `public/` directory size in CI
- [ ] Alert when approaching 100 MB threshold
- [ ] Monitor Vercel deployment size
- [ ] Track image optimization savings

## Related Documentation

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Current Image Config](/next.config.ts)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-04 | Defer Blob adoption | Repo size (17 MB) well under threshold |
| - | - | Will revisit when assets exceed 100 MB |
