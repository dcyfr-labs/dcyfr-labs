import type { ProjectImage } from "@/data/projects";

/**
 * Default Project Image Variants
 * 
 * Pre-designed fallback images for projects without custom featured images.
 */
export const DEFAULT_PROJECT_IMAGES = {
  tech: {
    url: "/portfolio/default/tech.svg",
    alt: "Default tech project background with code and circuits",
    position: "center" as const,
  },
  design: {
    url: "/portfolio/default/design.svg",
    alt: "Default design project background with geometric patterns",
    position: "center" as const,
  },
  general: {
    url: "/portfolio/default/general.svg",
    alt: "Default project background with abstract gradient",
    position: "center" as const,
  },
} as const;

export type DefaultProjectImageVariant = keyof typeof DEFAULT_PROJECT_IMAGES;

/**
 * Get a default image for a project based on tags
 * 
 * Selection priority:
 * 1. Project tags (tech/code/web gets tech variant, design gets design variant)
 * 2. General variant as fallback
 * 
 * @param options - Project metadata for selecting appropriate default
 * @returns ProjectImage object with default image data
 * 
 * @example
 * const defaultImg = getDefaultProjectImage({ 
 *   tags: ["web-development", "typescript"]
 * });
 */
export function getDefaultProjectImage(options?: {
  tags?: string[];
  tech?: string[];
  variant?: DefaultProjectImageVariant;
}): ProjectImage {
  // If variant explicitly specified, use it
  if (options?.variant) {
    return DEFAULT_PROJECT_IMAGES[options.variant];
  }

  // Combine tags and tech for analysis
  const allTags = [
    ...(options?.tags || []),
    ...(options?.tech || []),
  ].map((t) => t.toLowerCase());

  // Tech/development content → tech variant
  if (allTags.some((t) => 
    ["javascript", "typescript", "react", "vue", "angular", "node", "python", 
     "java", "code", "programming", "web development", "api", "backend", "frontend",
     "next.js", "tailwind", "css", "html"].includes(t.toLowerCase())
  )) {
    return DEFAULT_PROJECT_IMAGES.tech;
  }

  // Design/UI content → design variant
  if (allTags.some((t) => 
    ["design", "ui", "ux", "graphic design", "branding", "visual",
     "illustration", "figma", "sketch", "adobe"].includes(t.toLowerCase())
  )) {
    return DEFAULT_PROJECT_IMAGES.design;
  }

  // Default to general for other content
  return DEFAULT_PROJECT_IMAGES.general;
}

/**
 * Ensure a project has a featured image, using default if needed
 * 
 * @param image - Optional image from project data
 * @param fallbackOptions - Options for selecting default image
 * @returns ProjectImage object (custom or default)
 * 
 * @example
 * const featuredImage = ensureProjectImage(project.image, {
 *   tags: project.tags,
 *   tech: project.tech
 * });
 */
export function ensureProjectImage(
  image: ProjectImage | undefined,
  fallbackOptions?: Parameters<typeof getDefaultProjectImage>[0]
): ProjectImage {
  return image || getDefaultProjectImage(fallbackOptions);
}
