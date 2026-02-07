'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LayoutGrid, Rows3, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PhotoCard, type Photo } from './photo-card';
import { IMAGE_PLACEHOLDER, TOUCH_TARGET, Z_INDEX } from '@/lib/design-tokens';

// Storage key for layout preference
const STORAGE_KEY = 'gallery-layout-preference';

type GalleryLayout = 'masonry' | 'uniform';

interface PhotoGridProps {
  /** Array of photos to display */
  photos: Photo[];
  /** Number of columns for the grid */
  columns?: 2 | 3 | 4;
  /** Base path for URL params (for layout toggle persistence) */
  basePath?: string;
}

/**
 * PhotoGrid Component
 *
 * Instagram-style photo grid with layout toggle and lightbox.
 *
 * Features:
 * - Masonry layout (varied heights based on aspect ratio)
 * - Uniform layout (square crops)
 * - Toggle between layouts (persisted in URL params + localStorage)
 * - Lightbox with keyboard navigation
 * - Responsive column sizing
 *
 * @example
 * ```tsx
 * <PhotoGrid
 *   photos={photos}
 *   columns={3}
 *   basePath="/work/my-project"
 * />
 * ```
 */
export function PhotoGrid({ photos, columns = 3, basePath = '' }: PhotoGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial layout from URL or localStorage
  const layoutParam = searchParams.get('layout') as GalleryLayout | null;
  const getInitialLayout = (): GalleryLayout => {
    if (layoutParam === 'masonry' || layoutParam === 'uniform') {
      return layoutParam;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'masonry' || saved === 'uniform') {
        return saved;
      }
    }
    return 'uniform'; // Default
  };

  const [layout, setLayout] = useState<GalleryLayout>(getInitialLayout);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Handle layout toggle
  const handleLayoutChange = (newLayout: GalleryLayout) => {
    setLayout(newLayout);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLayout);
    }

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('layout', newLayout);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  // Lightbox handlers
  const openLightbox = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    },
    [goToPrevious, goToNext, closeLightbox]
  );

  const currentPhoto = photos[currentPhotoIndex];

  // Column class mapping
  const columnClasses = {
    2: 'columns-1 sm:columns-2',
    3: 'columns-1 sm:columns-2 lg:columns-3',
    4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
  };

  const uniformGridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <>
      {/* Layout Toggle */}
      <div className="flex justify-end mb-4">
        <div
          className="flex items-center gap-1 rounded-lg border p-1 bg-card"
          role="group"
          aria-label="Gallery layout options"
        >
          <Button
            variant={layout === 'uniform' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleLayoutChange('uniform')}
            className="h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Uniform grid view"
            aria-pressed={layout === 'uniform'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'masonry' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleLayoutChange('masonry')}
            className="h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Masonry view"
            aria-pressed={layout === 'masonry'}
          >
            <Rows3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      {layout === 'masonry' ? (
        // Masonry layout using CSS columns
        <div className={cn(columnClasses[columns], 'gap-4')}>
          {photos.map((photo, index) => (
            <div key={index} className="mb-4 break-inside-avoid">
              <PhotoCard
                photo={photo}
                index={index}
                layout="masonry"
                onClick={openLightbox}
                priority={index < 6}
              />
            </div>
          ))}
        </div>
      ) : (
        // Uniform grid layout
        <div className={cn('grid gap-4', uniformGridClasses[columns])}>
          {photos.map((photo, index) => (
            <PhotoCard
              key={index}
              photo={photo}
              index={index}
              layout="uniform"
              onClick={openLightbox}
              priority={index < 6}
            />
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          showCloseButton={false}
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">{currentPhoto?.alt || 'Photo viewer'}</DialogTitle>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeLightbox}
            className={cn(
              `absolute top-4 right-4 ${Z_INDEX.dropdown} text-white hover:bg-white/10`,
              TOUCH_TARGET.close
            )}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${Z_INDEX.dropdown} text-white hover:bg-white/10 h-12 w-12`}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${Z_INDEX.dropdown} text-white hover:bg-white/10 h-12 w-12`}
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          {currentPhoto && (
            <div className="relative w-full h-[85vh] flex items-center justify-center">
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.alt}
                fill
                sizes="95vw"
                className="object-contain"
                priority
                placeholder="blur"
                blurDataURL={IMAGE_PLACEHOLDER.blur}
              />
            </div>
          )}

          {/* Caption and counter */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-end text-white">
              <div className="flex-1">
                {currentPhoto?.caption && (
                  <p className="text-sm md:text-base">{currentPhoto.caption}</p>
                )}
              </div>
              <div className="text-sm text-white/70 ml-4">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
