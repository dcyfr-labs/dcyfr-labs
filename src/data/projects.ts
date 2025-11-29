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
};

const projectDrafts: Project[] = [
  {
    slug: "dcyfr-labs",
    title: "DCYFR Labs",
    description: "Cyber Architecture & Design",
    timeline: "2025 → Present",
    status: "active",
    category: "startup",
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    tags: ["Web Development", "Personal", "React", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
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
    tech: ["Ghost", "JavaScript", "CSS"],
    tags: ["Cybersecurity", "Writing", "Ghost", "JavaScript", "CSS"],
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
    tech: ["WordPress", "PHP", "MySQL", "JavaScript", "CSS"],
    tags: ["Cybersecurity", "WordPress", "PHP", "MySQL", "JavaScript", "CSS"],
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

