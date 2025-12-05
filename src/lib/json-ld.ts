/**
 * JSON-LD Schema Utilities
 * 
 * Helper functions for generating Schema.org structured data (JSON-LD) for SEO.
 * These utilities create consistent, valid schemas across the site.
 * 
 * References:
 * - https://schema.org/
 * - https://developers.google.com/search/docs/appearance/structured-data
 * - https://validator.schema.org/
 */

import { SITE_URL, AUTHOR_NAME, SITE_TITLE } from "./site-config";
import { getSocialUrls } from "@/data/socials";
import type { Post } from "@/data/posts";

/**
 * Base Person schema for the site author
 * Used across multiple pages for consistency
 */
export function getPersonSchema(socialImage?: string) {
  return {
    "@type": "Person" as const,
    "@id": `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    url: SITE_URL,
    ...(socialImage && { image: socialImage }),
    jobTitle: "Founding Architect",
    sameAs: getSocialUrls(),
  };
}

/**
 * Base WebSite schema for the homepage
 */
export function getWebSiteSchema() {
  return {
    "@type": "WebSite" as const,
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_TITLE,
    publisher: {
      "@id": `${SITE_URL}/#person`,
    },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList schema for navigation
 * Helps search engines understand site hierarchy
 * 
 * @param items - Array of breadcrumb items with name and url
 * @example
 * getBreadcrumbSchema([
 *   { name: "Home", url: "https://example.com" },
 *   { name: "Blog", url: "https://example.com/blog" },
 *   { name: "Post Title", url: "https://example.com/blog/post-slug" }
 * ])
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Enhanced Article schema for blog posts
 * Includes all recommended properties for Google Rich Results
 * 
 * @param post - Post object with metadata
 * @param viewCount - Optional view count for interaction statistics
 * @param imageUrl - Social preview image URL
 */
export function getArticleSchema(post: Post, viewCount: number | null, imageUrl: string) {
  return {
    "@type": "Article" as const,
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    ...(post.updatedAt && { dateModified: post.updatedAt }),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    wordCount: post.readingTime.words,
    timeRequired: post.readingTime.text,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    ...(post.archived && { 
      creativeWorkStatus: "Archived",
      archivedAt: post.updatedAt || post.publishedAt 
    }),
    ...(typeof viewCount === "number" && viewCount > 0
      ? {
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ReadAction",
            userInteractionCount: viewCount,
          },
        }
      : {}),
  };
}

/**
 * CollectionPage with ItemList schema for blog listing
 * Shows all blog posts in a structured list
 * 
 * @param posts - Array of posts to include in the list
 * @param title - Page title (e.g., "Blog" or "Blog - JavaScript")
 * @param description - Page description
 */
export function getBlogCollectionSchema(posts: Post[], title: string, description: string) {
  return {
    "@type": "CollectionPage" as const,
    "@id": `${SITE_URL}/blog#collection`,
    name: title,
    description,
    url: `${SITE_URL}/blog`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

/**
 * AboutPage and ProfilePage schema
 * Combines AboutPage (for site structure) and ProfilePage (for personal info)
 * 
 * @param description - About page description
 * @param socialImage - Optional profile image URL
 */
export function getAboutPageSchema(description: string, socialImage?: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#page`,
        url: `${SITE_URL}/about`,
        name: "About",
        description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/about#profile`,
        url: `${SITE_URL}/about`,
        name: `About ${AUTHOR_NAME}`,
        mainEntity: {
          "@id": `${SITE_URL}/#person`,
        },
      },
      getPersonSchema(socialImage),
    ],
  };
}

/**
 * ContactPage schema
 * Helps search engines understand contact information
 * 
 * @param description - Contact page description
 */
export function getContactPageSchema(description: string) {
  return {
    "@type": "ContactPage" as const,
    "@id": `${SITE_URL}/contact#page`,
    url: `${SITE_URL}/contact`,
    name: "Contact",
    description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    inLanguage: "en-US",
    about: {
      "@id": `${SITE_URL}/#person`,
    },
  };
}

/**
 * ResumePage schema with Person and work experience
 * Provides rich structured data for resume/CV pages
 * 
 * @param description - Resume page description
 * @param experience - Array of work experience objects
 */
export function getResumePageSchema(
  description: string,
  experience?: Array<{ title: string; company: string; duration: string }>
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/resume#page`,
        url: `${SITE_URL}/resume`,
        name: "Resume",
        description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        mainEntity: {
          "@id": `${SITE_URL}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        ...getPersonSchema(),
        ...(experience && experience.length > 0 && {
          workExperience: experience.map((exp) => ({
            "@type": "EmploymentHistory",
            name: exp.title,
            employmentType: "FULL_TIME",
            employer: {
              "@type": "Organization",
              name: exp.company,
            },
            description: exp.duration,
          })),
        }),
      },
    ],
  };
}

/**
 * Generate complete JSON-LD script tag content
 * Handles nonce for CSP and proper JSON stringification
 * 
 * @param schema - Schema object(s) to serialize
 * @param nonce - CSP nonce for inline scripts (required for CSP compliance)
 * @returns Props for script tag
 * 
 * CRITICAL: The nonce MUST be provided here. If it's missing or empty,
 * CSP violations will occur when the script tag is rendered inline.
 */
export function getJsonLdScriptProps(schema: object, nonce: string) {
  // Always include the nonce attribute, even if empty
  // An empty nonce="" is better than no nonce for CSP compliance
  return {
    type: "application/ld+json" as const,
    nonce: nonce, // Always include, even if empty
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
    suppressHydrationWarning: true,
  };
}
