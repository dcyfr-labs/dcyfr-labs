import { Button } from "@/components/ui/button";
import { ExternalLink, Github, FileText, BookOpen } from "lucide-react";
import { SPACING } from "@/lib/design-tokens";
import type { ProjectLink } from "@/data/projects";

interface ProjectLinksProps {
  links: ProjectLink[];
}

const linkIcons = {
  demo: ExternalLink,
  github: Github,
  article: FileText,
  docs: BookOpen,
} as const;

export function ProjectLinks({ links }: ProjectLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={SPACING.content}>
      <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const Icon = link.type ? linkIcons[link.type] : ExternalLink;
        return (
          <Button key={link.href} asChild variant="default">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        );
      })}
      </div>
    </div>
  );
}
