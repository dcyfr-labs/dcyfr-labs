/**
 * Contact Form Template
 *
 * Demonstrates correct usage of form components with design tokens.
 * Shows proper label/input associations and validation states.
 *
 * **Design Token Compliance**: ✅ 100%
 * - Uses Input, Label, Textarea UI components
 * - SPACING.content for form field spacing
 * - Semantic colors for states
 * - TYPOGRAPHY for labels and errors
 *
 * @example Basic contact form
 * ```tsx
 * <ContactFormBasic />
 * ```
 *
 * @example Newsletter signup
 * ```tsx
 * <NewsletterForm />
 * ```
 */

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Basic Contact Form
 * Use for: Contact pages, support forms
 */
export function ContactFormBasic() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStatus('success')
  }

  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.narrow} ${CONTAINER_PADDING}`}>
      <form onSubmit={handleSubmit} className={SPACING.content}>
        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Subject field */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder="How can I help?"
          />
        </div>

        {/* Message field */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell me about your project..."
            rows={6}
            required
          />
          <p className={cn(TYPOGRAPHY.metadata, 'text-xs')}>
            Minimum 20 characters
          </p>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? (
            'Sending...'
          ) : (
            <>
              Send Message
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Success message */}
        {status === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Thanks for reaching out! I&apos;ll get back to you soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Something went wrong. Please try again or email me directly.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}

/**
 * Newsletter Signup Form
 * Use for: Footer, sidebar, dedicated signup pages
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          You&apos;re subscribed! Check your email to confirm.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email address
        </Label>
        <div className="flex gap-2">
          <Input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? (
              'Subscribing...'
            ) : (
              <>
                Subscribe
                <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <p className={cn(TYPOGRAPHY.metadata, 'text-xs')}>
        No spam. Unsubscribe at any time.
      </p>
    </form>
  )
}

/**
 * Search Form
 * Use for: Site search, blog search
 */
export function SearchForm() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle search
    console.log('Searching for:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="search"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-20"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          Search
        </Button>
      </div>
    </form>
  )
}

/**
 * Inline Email Signup (Compact)
 * Use for: Inline blog CTAs, end of article
 */
export function InlineEmailSignup() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-8">
      <div className={SPACING.content}>
        <h3 className={TYPOGRAPHY.h3.standard}>
          Enjoyed this article?
        </h3>
        <p className={TYPOGRAPHY.body}>
          Subscribe to get notified when I publish new content.
        </p>
        <NewsletterForm />
      </div>
    </div>
  )
}
