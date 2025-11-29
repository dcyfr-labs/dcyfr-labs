import { SITE_TITLE } from "@/lib/site-config";

export type ProjectLink = {
  label: string;
  href: string;
  type?: "demo" | "github" | "article" | "docs";
};

export type ProjectStatus = "active" | "in-progress" | "archived";

export type ProjectImage = {
  url: string; // local path or external URL
  alt: string; // required for accessibility
  width?: number; // optional, for optimization
  height?: number; // optional, for aspect ratio
  position?: "center" | "top" | "bottom" | "left" | "right"; // background position
};

export type ProjectCategory = "community" | "nonprofit" | "code" | "photography" | "startup";

/**
 * Code Project Content
 * Additional content for code/development projects.
 * Supports demos, code examples, and references.
 */
export type CodeProjectContent = {
  /** Interactive code demo */
  codeDemo?: {
    /** Programming language for syntax highlighting */
    language: string;
    /** Sample input (shown in Input panel) */
    input?: string;
    /** Expected output (shown in Output panel) */
    output?: string;
    /** Code snippet (shown with syntax highlighting) */
    code?: string;
    /** Embed URL for CodeSandbox, StackBlitz, etc. */
    embedUrl?: string;
  };
  /** Reference links to docs, articles, related projects */
  references?: { label: string; href: string }[];
  /** Multiple code blocks with titles */
  codeblocks?: { 
    title: string; 
    language: string; 
    code: string; 
  }[];
};

/**
 * Gallery Project Content
 * Additional content for photography/gallery projects.
 * Supports photo grids with lightbox viewing.
 */
export type GalleryProjectContent = {
  /** Array of photos for the gallery */
  photos: {
    /** Image URL (local path or external) */
    url: string;
    /** Alt text for accessibility */
    alt: string;
    /** Image width in pixels */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Optional caption */
    caption?: string;
  }[];
  /** Number of grid columns (default: 3) */
  columns?: 2 | 3 | 4;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  timeline?: string;
  status: ProjectStatus;
  category?: ProjectCategory; // primary category for filtering
  tech?: string[];
  tags?: string[];
  links: ProjectLink[];
  featured?: boolean; // false
  hidden?: boolean; // false
  highlights?: string[];
  image?: ProjectImage; // optional featured image
  
  // Category-specific content (only one should be present based on category)
  /** Code project content - for category: "code" */
  codeContent?: CodeProjectContent;
  /** Gallery project content - for category: "photography" */
  galleryContent?: GalleryProjectContent;
};

const projectDrafts: Project[] = [
  {
    slug: "dcyfr-labs",
    title: "DCYFR Labs",
    description: "Cyber Architecture & Design",
    timeline: "2025 → Present",
    status: "active",
    category: "startup",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
    tags: ["Cybersecurity", "Architecture", "Design", "Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
    links: [
      { label: "Website", href: `https://dcyfrlabs.com/`, type: "demo" },
      { label: "Code", href: `https://github.com/dcyfr/dcyfr-labs`, type: "github" }
    ],
    featured: true,
    image: {
      url: "/portfolio/default/tech.svg",
      alt: "DCYFR Labs: Cyber Architecture & Design",
      position: "center",
    },
  },
  {
    slug: "x64",
    title: "X64: Indie Cyber Publication",
    description: "A digital publication focused on cybersecurity, technology trends, and industry insights.",
    timeline: "2024 → Present",
    status: "active",
    category: "community",
    tech: ["Ghost", "JavaScript", "CSS", "HTML"],
    tags: ["Cybersecurity", "Publication"],
    links: [
      { label: "Website", href: `https://x64.onl`, type: "demo" }
    ],
    featured: false,
    image: {
      url: "/portfolio/default/design.svg",
      alt: "X64: Indie Cyber Publication",
      position: "center",
    },
  },
  {
    slug: "isn",
    title: "Information Security Network, Inc.",
    description: "A non-profit organization dedicated to promoting public information security awareness.",
    timeline: "2019 → 2021",
    status: "archived",
    category: "nonprofit",
    tech: ["WordPress", "PHP", "MySQL", "HTML", "CSS"],
    tags: ["Cybersecurity", "Awareness"],
    links: [],
    featured: false,
    image: {
      url: "/portfolio/default/general.svg",
      alt: "Information Security Network: A Non-profit cybersecurity organization",
      position: "center",
    },
  },
];

export const projects = Object.freeze(projectDrafts);

export const visibleProjects = Object.freeze(projects.filter((project) => !project.hidden));

export const featuredProjects = Object.freeze(visibleProjects.filter((project) => project.featured));

export const activeProjects = Object.freeze(visibleProjects.filter((project) => project.status === "active"));

