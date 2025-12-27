"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";

interface Photo {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface PhotoGridProps {
  columns?: 2 | 3 | 4;
  photos?: Photo[];
  children?: React.ReactNode;
}

export function PhotoGrid({ columns = 3, photos = [], children }: PhotoGridProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <>
      <div className={cn("grid gap-4", SPACING.content, gridCols[columns])}>
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-video cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            onClick={() => setLightboxPhoto(photo)}
          >
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        { }
        <DialogContent className={CONTAINER_WIDTHS.narrow}>
          {lightboxPhoto && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={lightboxPhoto.url}
                alt={lightboxPhoto.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
              {lightboxPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
                  {lightboxPhoto.caption}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
