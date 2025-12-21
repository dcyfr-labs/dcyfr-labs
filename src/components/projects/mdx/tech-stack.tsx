import { Badge } from "@/components/ui/badge";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

interface TechStackProps {
  tech: string[];
  title?: string;
}

export function TechStack({ tech, title = "Tech Stack" }: TechStackProps) {
  if (!tech || tech.length === 0) {
    return null;
  }

  return (
    <div className={SPACING.content}>
      <h3 className={TYPOGRAPHY.h3.standard}>{title}</h3>
      <div className="flex flex-wrap gap-2 mt-3">
        {tech.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
