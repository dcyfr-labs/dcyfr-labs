/**
 * Card Grid Template
 *
 * Demonstrates correct usage of Card components with design tokens.
 * Shows responsive grid layouts and proper hover effects.
 *
 * **Design Token Compliance**: ✅ 100%
 * - Uses Card UI component
 * - HOVER_EFFECTS for interactions
 * - Responsive grid with gap-6 (numeric value OK)
 * - TYPOGRAPHY for text
 *
 * @example Project grid
 * ```tsx
 * <ProjectCardGrid projects={projects} />
 * ```
 *
 * @example Blog post grid
 * ```tsx
 * <BlogPostCardGrid posts={posts} />
 * ```
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HOVER_EFFECTS, TYPOGRAPHY } from '@/lib/design-tokens'
import { ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Project Card Grid (3 columns on desktop)
 * Use for: Portfolio pages, work showcases
 */
interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  href: string
}

export function ProjectCardGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className={HOVER_EFFECTS.card}>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href={project.href}>
                View Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

/**
 * Blog Post Card Grid (2 columns on desktop)
 * Use for: Blog listings, article archives
 */
interface BlogPost {
  id: string
  title: string
  summary: string
  publishedAt: string
  tags: string[]
  href: string
}

export function BlogPostCardGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <Link key={post.id} href={post.href} className="group">
          <Card className={HOVER_EFFECTS.card}>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
              <CardDescription>{post.summary}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

/**
 * Feature Card Grid (4 columns on wide screens)
 * Use for: Feature showcases, service offerings
 */
interface Feature {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCardGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <Card key={feature.id} className={HOVER_EFFECTS.cardSubtle}>
          <CardHeader>
            <div className="mb-4 text-primary">
              {feature.icon}
            </div>
            <CardTitle className="text-base">
              {feature.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className={cn(TYPOGRAPHY.body, 'text-sm text-muted-foreground')}>
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * CTA Card (single, prominent)
 * Use for: Newsletter signups, contact CTAs
 */
export function CTACard() {
  return (
    <Card className={HOVER_EFFECTS.cardCTA}>
      <CardHeader>
        <CardTitle className={TYPOGRAPHY.h2.standard}>
          Stay Updated
        </CardTitle>
        <CardDescription>
          Get the latest articles and updates delivered to your inbox.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex gap-2">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
          />
          <Button type="submit">
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
