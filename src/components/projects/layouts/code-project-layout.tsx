import Link from "next/link";
import { ExternalLink, FileCode, BookOpen, Terminal, ArrowRight } from "lucide-react";
import { visibleProjects, type Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeUrl } from "@/lib/utils";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { ProjectsCTA } from "@/components/common";
import { OtherProjectCard } from "@/components/projects/other-project-card";
import { ArticleHeader } from "@/components/layouts";
import { MDX } from "@/components/common/mdx";

const STATUS_LABEL: Record<Project["status"], string> = {
  "active": "Active",
  "in-progress": "In Progress",
  "archived": "Archived",
};

interface CodeProjectLayoutProps {
  /** Project data with optional codeContent */
  project: Project;
  /** CSP nonce for inline scripts (reserved for future use with embeds) */
  nonce: string;
  /** Base path for project URLs (default: '/work') */
  basePath?: string;
}

/**
 * CodeProjectLayout Component
 * 
 * Specialized layout for code/development projects.
 * Features:
 * - Standard header with title, timeline, status
 * - Code demo section (input/output/embedded)
 * - Syntax-highlighted code blocks (via MDX)
 * - Reference links section
 * - Condensed tech stack
 * 
 * Uses existing MDX/rehype-pretty-code for syntax highlighting.
 * 
 * @example
 * ```tsx
 * <CodeProjectLayout project={project} nonce={nonce} basePath="/work" />
 * ```
 */
 
export function CodeProjectLayout({ project, nonce, basePath = '/work' }: CodeProjectLayoutProps) {
  const codeContent = project.codeContent;
  
  return (
    <>
      {/* Project Header */}
      <ArticleHeader
        title={project.title}
        metadata={project.timeline || undefined}
        badges={
          project.status !== "active" ? (
            <Link href={`${basePath}?status=${project.status}`}>
              <Badge variant="default" className="cursor-pointer hover:opacity-80 transition-opacity">
                {STATUS_LABEL[project.status]}
              </Badge>
            </Link>
          ) : undefined
        }
      />
      
      {/* Project Description */}
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
        {project.description}
      </p>
      
      {/* Project Links */}
      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {project.links.map((link) => {
            const isExternal = /^(?:https?:)?\/\//.test(link.href);
            return isExternal ? (
              <Button key={link.href} asChild variant="default" size="default">
                <a href={sanitizeUrl(link.href)} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button key={link.href} asChild variant="default" size="default">
                <Link href={link.href}>
                  <span>{link.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      )}

      {/* Code Demo Section */}
      {codeContent?.codeDemo && (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 flex items-center gap-2`}>
            <Terminal className="h-5 w-5" />
            Demo
          </h2>
          
          {/* Embedded demo (CodeSandbox, StackBlitz, etc.) */}
          {codeContent.codeDemo.embedUrl && (
            <div className="rounded-lg border overflow-hidden mb-6">
              <iframe
                src={codeContent.codeDemo.embedUrl}
                className="w-full h-[400px] md:h-[500px]"
                title={`${project.title} Demo`}
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              />
            </div>
          )}
          
          {/* Input/Output demo */}
          {(codeContent.codeDemo.input || codeContent.codeDemo.output) && (
            <div className="grid gap-4 md:grid-cols-2">
              {codeContent.codeDemo.input && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-medium text-sm text-muted-foreground">Input</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted/50 p-3 rounded-md overflow-x-auto">
                      <code>{codeContent.codeDemo.input}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
              {codeContent.codeDemo.output && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-medium text-sm text-muted-foreground">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted/50 p-3 rounded-md overflow-x-auto">
                      <code>{codeContent.codeDemo.output}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Inline code demo */}
          {codeContent.codeDemo.code && !codeContent.codeDemo.embedUrl && (
            <div className="rounded-lg overflow-hidden">
              <MDX 
                source={`\`\`\`${codeContent.codeDemo.language || 'typescript'}\n${codeContent.codeDemo.code}\n\`\`\``} 
              />
            </div>
          )}
        </section>
      )}

      {/* Code Blocks Section */}
      {codeContent?.codeblocks && codeContent.codeblocks.length > 0 && (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 flex items-center gap-2`}>
            <FileCode className="h-5 w-5" />
            Code Examples
          </h2>
          <div className={SPACING.content}>
            {codeContent.codeblocks.map((block, index) => (
              <div key={index} className="mb-6">
                {block.title && (
                  <h3 className={`${TYPOGRAPHY.h3.standard} mb-2`}>{block.title}</h3>
                )}
                <div className="rounded-lg overflow-hidden">
                  <MDX 
                    source={`\`\`\`${block.language}\n${block.code}\n\`\`\``} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* References Section */}
      {codeContent?.references && codeContent.references.length > 0 && (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 flex items-center gap-2`}>
            <BookOpen className="h-5 w-5" />
            References
          </h2>
          <Card>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {codeContent.references.map((ref, index) => {
                  const isExternal = /^(?:https?:)?\/\//.test(ref.href);
                  return (
                    <li key={index}>
                      {isExternal ? (
                        <a
                          href={sanitizeUrl(ref.href)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <ArrowRight className="h-4 w-4" />
                          {ref.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href={ref.href}
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <ArrowRight className="h-4 w-4" />
                          {ref.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Tech Stack (condensed) */}
      {project.tech && project.tech.length > 0 && (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Other Projects */}
      <div className="mt-12 pt-8 border-t">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-6`}>Other Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleProjects
            .filter((p) => p.slug !== project.slug)
            .slice(0, 2)
            .map((otherProject) => (
              <OtherProjectCard 
                key={otherProject.slug} 
                project={otherProject} 
              />
            ))}
        </div>
      </div>

      {/* Call-to-action */}
      <ProjectsCTA />
    </>
  );
}
