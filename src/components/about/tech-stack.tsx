/**
 * Tech Stack Component
 * 
 * Displays a categorized visual representation of technologies and skills.
 * Shows programming languages, frameworks, tools, and cloud platforms.
 * 
 * @component
 * @example
 * ```tsx
 * <TechStack />
 * ```
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { resume } from "@/data/resume";
import { TYPOGRAPHY } from "@/lib/design-tokens";

// Get technologies from resume data
const techCategories = resume.skills.filter(category => 
  category.category === "Technologies & Tools" || 
  category.category === "Programming & Automation"
);

// Featured/most relevant technologies to highlight
const featuredTechs = [
  "Next.js", "React", "TypeScript", "Python", "Node.js",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Cloudflare", "Vercel", "GitHub", "Terraform",
  "Snyk", "CrowdStrike", "Splunk", "Palo Alto"
];

// Check if a tech is featured
function isFeatured(tech: string): boolean {
  return featuredTechs.includes(tech);
}

export function TechStack() {
  return (
    <Card className="p-5 space-y-4">
      <div className="space-y-2">
        <h3 className={TYPOGRAPHY.h3.standard}>Tech Stack</h3>
        <p className="text-sm text-muted-foreground">
          Technologies and tools we work with regularly
        </p>
      </div>

      <div className="space-y-4">
        {techCategories.map((category) => (
          <div key={category.category} className="space-y-2">
            {/* Label text, not a semantic heading - uses standard text styles */}
            {/* eslint-disable-next-line no-restricted-syntax */}
            <p className="text-sm font-medium text-foreground">
              {category.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {category.skills
                .sort((a, b) => {
                  // Sort featured items first
                  const aFeatured = isFeatured(a);
                  const bFeatured = isFeatured(b);
                  if (aFeatured && !bFeatured) return -1;
                  if (!aFeatured && bFeatured) return 1;
                  return 0;
                })
                .slice(0, 20) // Limit to 20 items per category for cleanliness
                .map((tech) => (
                  <Badge
                    key={tech}
                    variant={isFeatured(tech) ? "default" : "secondary"}
                    className="text-xs transition-transform duration-200 hover:scale-105"
                  >
                    {tech}
                  </Badge>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
