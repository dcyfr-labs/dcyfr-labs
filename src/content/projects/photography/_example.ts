/**
 * Example Gallery Project Content
 * 
 * This is a template for photography/gallery project content files.
 * Copy this file and customize for your specific project.
 * 
 * File naming: src/content/projects/photography/{project-slug}.ts
 */

import type { GalleryProjectContent } from "@/data/projects";

const content: GalleryProjectContent = {
  // Grid column count (2, 3, or 4)
  columns: 3,
  
  // Photo array
  photos: [
    {
      url: "/portfolio/photography/example-1.jpg",
      alt: "Description for accessibility",
      width: 1600,
      height: 1200,
      caption: "Optional caption text", // shown on hover and in lightbox
    },
    {
      url: "/portfolio/photography/example-2.jpg",
      alt: "Another photo description",
      width: 1200,
      height: 1600,
      // caption is optional
    },
    // Add more photos...
  ],
};

export default content;
