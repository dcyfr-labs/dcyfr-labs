import { Card } from "@/components/ui/card";
import { sanitizeUrl } from "@/lib/utils";
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";
import { AUTHOR_EMAIL } from "@/lib/site-config";
import { getSocialLink } from "@/data/socials";
import { cn } from "@/lib/utils";
import { Mail, Calendar, Linkedin, Github, ExternalLink } from "lucide-react";

/**
 * Contact Methods Component
 *
 * Displays primary contact methods including email and key social platforms.
 * Provides users with multiple ways to reach out beyond the contact form.
 *
 * Features:
 * - Direct email link
 * - Key social platforms (LinkedIn, GitHub, Calendar)
 * - Hover effects for visual feedback
 * - External link indicators
 * - Responsive grid layout
 * - Full design token compliance
 *
 * @example
 * ```tsx
 * <ContactMethods />
 * ```
 */
export function ContactMethods() {
  // Get key social links
  const linkedinLink = getSocialLink("linkedin");
  const githubLink = getSocialLink("github");
  const calendarLink = getSocialLink("calendar");

  const contactMethods = [
    {
      label: "Email",
      description: "Send us a direct email",
      url: `mailto:${AUTHOR_EMAIL}`,
      icon: Mail,
      isEmail: true,
    },
    ...(linkedinLink
      ? [
          {
            label: linkedinLink.label,
            description: linkedinLink.description || "Connect on LinkedIn",
            url: linkedinLink.url,
            icon: Linkedin,
            isEmail: false,
          },
        ]
      : []),
    ...(githubLink
      ? [
          {
            label: githubLink.label,
            description: githubLink.description || "View our code",
            url: githubLink.url,
            icon: Github,
            isEmail: false,
          },
        ]
      : []),
    ...(calendarLink
      ? [
          {
            label: calendarLink.label,
            description: calendarLink.description || "Schedule a meeting",
            url: calendarLink.url,
            icon: Calendar,
            isEmail: false,
          },
        ]
      : []),
  ];

  return (
    <div className={SPACING.content}>
      <div className="text-center mb-8">
        <h2 className={TYPOGRAPHY.h2.standard}>Other Ways to Connect</h2>
        <p className={cn(TYPOGRAPHY.description, "mt-2")}>
          Choose the platform that works best for you
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactMethods.map((method) => {
          const IconComponent = method.icon;
          const isExternal = !method.isEmail;

          return (
            <a
              key={method.label}
              href={sanitizeUrl(method.url)}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group"
            >
              <Card className={cn("p-4 h-full", HOVER_EFFECTS.cardSubtle)}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                      {method.label}
                      {isExternal && (
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
