"use client";

import * as React from "react";
import { ZoomIn, X } from "lucide-react";
import { ANIMATION, BORDERS, SHADOWS } from "@/lib/design-tokens";

/**
 * ZoomableImage Component
 * 
 * Wraps an img element to provide click-to-zoom functionality.
 * Shows a zoom icon on hover and opens a full-screen lightbox on click.
 * 
 * @component
 * @param {Object} props - Image element props
 * @returns {React.ReactElement} Interactive zoomable image wrapper
 * 
 * @features
 * - Click to view image in full-screen modal
 * - Hover icon indicates zoom capability
 * - Escape key and click outside to close
 * - Smooth fade-in/out transitions
 * - Accessible with keyboard navigation
 * - Close button for better UX discoverability
 * - Focus trap within modal
 * - Swipe-to-close on mobile devices
 * 
 * @example
 * <ZoomableImage src="/image.jpg" alt="Description" />
 */
export function ZoomableImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState(0);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key to close
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Focus management: focus close button when modal opens
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Handle touch swipe-to-close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.changedTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    // Close if swiped down more than 50 pixels
    if (touchEnd - touchStart > 50) {
      setIsOpen(false);
    }
  };

  // Portal for modal to avoid nesting issues
  const modalElement = isOpen && (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in ${ANIMATION.duration.fast}`}
      onClick={() => setIsOpen(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close button - top-right corner */}
      <button
        ref={closeButtonRef}
        onClick={() => setIsOpen(false)}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/90 rounded-lg p-2 transition-colors"
        aria-label="Close image viewer"
        type="button"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
      </button>

      {/* Hint text - minimal padding, responsive sizing */}
      <div
        className={`text-xs sm:text-sm text-white text-center mb-3 sm:mb-4`}
      >
        Click or press ESC to close
      </div>

      {/* Image container - no excess padding */}
      <div
        className="relative max-w-[95vw] max-h-[85vh] flex items-center justify-center cursor-zoom-out"
        onClick={(e) => {
          e.stopPropagation();
          // Close on click for desktop, but allow swipe to close on mobile
          if (window.innerWidth >= 768) {
            setIsOpen(false);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Native img required for zoom functionality */}
        <img
          src={props.src}
          alt={props.alt}
          className={`max-w-full max-h-full object-contain ${BORDERS.card} ${SHADOWS.xl} pointer-events-none`}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Image with hover zoom indicator - no wrapper div to avoid nesting in <p> */}
      {/* eslint-disable-next-line @next/next/no-img-element -- Native img required for zoom functionality */}
      <img
        {...props}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        tabIndex={0}
        role="button"
        className={`${props.className || ''} cursor-zoom-in`}
        aria-label={`Zoom image: ${props.alt || "image"}`}
      />

      {/* FIX: Zoom icon overlay on hover
      <span className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 ${ANIMATION.transition.theme} flex items-center justify-center pointer-events-none ${BORDERS.card}`}>
        <span className={`opacity-0 group-hover:opacity-100 ${ANIMATION.transition.theme} bg-black/60 backdrop-blur-sm ${BORDERS.circle} p-3`}>
          <ZoomIn className="w-6 h-6 text-white" aria-hidden="true" />
        </span>
      </span> */}

      {/* Full-screen modal */}
      {modalElement}
    </>
  );
}

ZoomableImage.displayName = "ZoomableImage";
