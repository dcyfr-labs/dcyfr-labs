<!-- TLP:CLEAR -->
# AI Search Optimization (AEO) Implementation Guide

**Version:** 1.0
**Implementation Date:** February 5, 2026
**Status:** Phase 1 Complete

## Overview

DCYFR Labs has implemented comprehensive AI Search Optimization (Answer Engine Optimization - AEO) to maximize visibility in AI-powered search engines like ChatGPT, Claude, Perplexity, and Google AI Overviews.

**Key Finding:** 80% of LLM citations don't rank in Google's top 100. Traditional SEO metrics are decoupled from AI visibility.

## What Was Implemented

### Phase 1: Technical Foundation ✅

#### 1. robots.txt - AI Crawler Permissions

**File:** `public/robots.txt`

Explicitly permits all major AI crawlers:

- **GPTBot** - OpenAI training (569M monthly requests)
- **ChatGPT-User** - Real-time browsing (2400 pages/hour)
- **OAI-SearchBot** - ChatGPT search features
- **ClaudeBot** - Anthropic AI (500 pages/hour)
- **Google-Extended** - Google's AI crawler
- **PerplexityBot** - Perplexity AI search
- **CCBot** - Common Crawl (feeds many AI models)

**Impact:** Without explicit permission, AI systems cannot index content regardless of quality.

#### 2. llms.txt - AI Agent Site Guide

**File:** `public/llms.txt`

Structured markdown guide specifically for Large Language Models. Research shows AI agents visit `llms.txt` files **2x more than regular content**.

**Contains:**

- Site overview and expertise areas
- Core content categories with key articles
- Technical stack and architecture
- Contact information and services
- RSS feeds and data access points

**Purpose:** Acts as a "VIP guide" ensuring AI systems discover cornerstone content first.

#### 3. Organization Schema - Brand Signals

**File:** `src/app/layout.tsx`

Added JSON-LD Organization schema site-wide with:

- Organization identity and logo
- Founder information (Person schema)
- Contact points
- Social media profiles (LinkedIn, GitHub)
- Areas of expertise

**Impact:** Strengthens brand entity signals that AI systems use for authority assessment.

#### 4. Enhanced Metadata Utilities

**File:** `src/lib/metadata.ts`

Added AI-optimized schema generators:

##### **FAQPage Schema**

```typescript
import { createFAQSchema } from '@/lib/metadata';

const faqSchema = createFAQSchema([
  {
    question: 'What is OWASP Top 10 for Agentic AI?',
    answer: 'The OWASP Top 10 for Agentic AI is a security framework...',
  },
]);
```

**Why:** AI systems favor FAQ content for conversational queries. Research shows strong citation performance.

##### **HowTo Schema**

```typescript
import { createHowToSchema } from '@/lib/metadata';

const howToSchema = createHowToSchema({
  name: 'How to Implement OWASP Security Controls',
  description: 'Step-by-step security implementation guide',
  url: `${SITE_URL}/blog/implementing-owasp`,
  totalTime: 'PT2H', // 2 hours
  steps: [
    { name: 'Step 1', text: 'Install dependencies...' },
    { name: 'Step 2', text: 'Configure authentication...' },
  ],
});
```

**Why:** Technical how-to guides receive strong AI citation performance. HowTo schema signals instructional content.

##### **TechArticle Schema**

```typescript
import { createTechArticleSchema } from '@/lib/metadata';

const techSchema = createTechArticleSchema({
  title: 'Building Secure AI Agents with TypeScript',
  url: `${SITE_URL}/blog/secure-ai-agents`,
  publishedAt: new Date('2026-02-01'),
  author: 'Drew',
  programmingLanguage: ['TypeScript', 'JavaScript'],
  dependencies: ['Next.js', 'OpenAI SDK'],
  proficiencyLevel: 'Intermediate',
});
```

**Why:** Specialized Article type for technical content. Helps AI systems understand technical context.

#### 5. FAQ Section Component

**File:** `src/components/mdx/faq-section.tsx`

React component for easy FAQ integration in MDX content:

```mdx
import { FAQSection } from '@/components/mdx';

<FAQSection
  items={[
    {
      question: 'What is AI security?',
      answer: 'AI security encompasses...',
    },
  ]}
/>
```

**Features:**

- Auto-generates FAQPage schema
- Accessible accordion UI
- Design token compliance
- Mobile-responsive

## Usage Guide

### Adding FAQ Sections to Blog Posts

1. **Import the component:**

```mdx
---
title: 'Your Article Title'
---

import { FAQSection } from '@/components/mdx';
```

2. **Add FAQ section:**

```mdx
## Frequently Asked Questions

<FAQSection
  items={[
    {
      question: 'How do I get started?',
      answer: 'First, install dependencies with <code>npm install</code>...',
    },
    {
      question: 'What are the requirements?',
      answer: 'You need Node.js 20+ and TypeScript 5+...',
    },
  ]}
  defaultOpen={false}
/>
```

3. **Schema automatically generated:**
   The component generates FAQPage schema for AI optimization.

### Adding Article Schema to Blog Posts

In your blog post template (e.g., `src/app/blog/[slug]/page.tsx`):

```tsx
import { createTechArticleSchema } from '@/lib/metadata';

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  // Generate schema
  const techSchema = createTechArticleSchema({
    title: post.title,
    description: post.summary,
    url: `${SITE_URL}/blog/${post.slug}`,
    publishedAt: post.publishedAt,
    author: 'Drew',
    programmingLanguage: post.languages, // ['TypeScript', 'JavaScript']
    dependencies: post.dependencies, // ['Next.js', 'React']
    proficiencyLevel: post.level, // 'Intermediate'
    tags: post.tags,
  });

  return (
    <>
      {/* Schema for AI optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techSchema) }}
      />

      {/* Article content */}
      <article>{/* ... */}</article>
    </>
  );
}
```

### Adding HowTo Schema for Tutorials

For step-by-step guides:

```tsx
import { createHowToSchema } from '@/lib/metadata';

const howToSchema = createHowToSchema({
  name: 'How to Secure Your Next.js Application',
  description: 'Complete security hardening guide',
  url: `${SITE_URL}/blog/nextjs-security`,
  totalTime: 'PT1H30M', // 1.5 hours
  steps: [
    {
      name: 'Configure Content Security Policy',
      text: 'Add CSP headers to next.config.ts...',
      url: `${SITE_URL}/blog/nextjs-security#csp`,
    },
    {
      name: 'Implement Rate Limiting',
      text: 'Set up rate limiting with Vercel Edge Config...',
      url: `${SITE_URL}/blog/nextjs-security#rate-limiting`,
    },
  ],
});
```

## Content Strategy for AI Citations

### What AI Systems Favor

Based on research of 7,000+ AI citations:

**1. Comparison Content (32.5% of citations)**

- "X vs Y: Security Model Comparison"
- "Framework Comparison Guide"
- Must be **genuinely unbiased** - AI deprioritizes branded content

**2. Definitional/Reference Content**

- Technical glossaries
- Security framework mappings
- Clear definitions with examples

**3. Technical How-To Guides**

- Step-by-step implementations
- Code examples with explanations
- Use HowTo schema markup

**4. FAQ Content**

- Natural language Q&A format
- Aligns with conversational AI queries
- FAQPage schema critical

### Content Structure Best Practices

✅ **Front-load key information** - Place answers early, not after long intros
✅ **Use semantic HTML hierarchy** - Proper H1 → H2 → H3 nesting
✅ **Write concise paragraphs** - Target 3-6 sentences
✅ **Employ scannable formatting** - Bullet points, tables, numbered lists
✅ **Question-based headings** - Align with user query patterns
✅ **Link to authoritative sources** - Citations strengthen authority signals
✅ **Avoid marketing jargon** - Technical explanations over promotional language

### Existing DCYFR Content Strengths

Your content **already aligns** with high-citation patterns:

- ✅ **OWASP Top 10 for Agentic AI** - Reference architecture (perfect for citation)
- ✅ **CVE-2025-55182 Analysis** - Technical breakdown (timely content)
- ✅ **Security frameworks** - Definitional content

**Next Steps:**

- Add FAQ sections to top 10 articles
- Create 3 comparison guides (frameworks, tools, standards)
- Convert how-to content to use HowTo schema

## Platform-Specific Optimization

### ChatGPT

- Cites Wikipedia at 7.8%
- Minimal overlap with Google rankings (12%)
- Prefers definitional precision
- **Strategy:** Wikipedia-style neutral, comprehensive content

### Perplexity

- Cites Reddit heavily (6.6%)
- Emphasizes technical communities
- Built for research with inline citations
- **Strategy:** Participate in technical forums, detailed technical content

### Google AI Overviews

- 76.1% citation overlap with Google top 10
- Traditional SEO still matters here
- **Strategy:** Maintain core SEO + AI structure optimization

### Claude

- Can rank in Google within hours via Artifacts
- Gets cited by Perplexity and AI Overviews
- **Strategy:** Create Claude Artifacts for key concepts

## Measuring Success

### Manual Testing Protocol

**No automated tools exist** - measurement requires manual testing:

1. **Create query database** (20-30 high-value queries)
   - "How to secure AI agents"
   - "OWASP Top 10 for agentic applications"
   - "Node.js security vulnerabilities 2026"

2. **Test monthly across platforms:**
   - ChatGPT
   - Claude
   - Perplexity
   - Gemini
   - Google AI Mode

3. **Track metrics:**
   - Citation frequency per platform
   - Source diversity (cited across multiple engines?)
   - Context quality (favorable vs. neutral vs. competitor-adjacent)
   - Brand mention consistency
   - Framework terminology adoption

### Success Indicators

✅ **Direct citations** - DCYFR Labs mentioned as source
✅ **Framework adoption** - Your terms appearing in industry discourse
✅ **Multi-platform visibility** - Cited across ChatGPT, Perplexity, Claude
✅ **Favorable context** - Cited as authority, not just mention
✅ **Conceptual market share** - Your definitions becoming standard references

## Implementation Roadmap

### Phase 1: ✅ COMPLETE (February 5, 2026)

- [x] robots.txt with AI crawler permissions
- [x] llms.txt site guide
- [x] Organization schema (layout.tsx)
- [x] Enhanced metadata utilities (FAQPage, HowTo, TechArticle)
- [x] FAQ Section component

### Phase 2: Content Audit (Week 3-4)

- [ ] Manual AI citation testing (create query database)
- [ ] Test existing articles across 5 AI platforms
- [ ] Document citation patterns
- [ ] Identify top 5-10 articles for restructuring
- [ ] Add FAQ sections to cornerstone content

### Phase 3: Content Enhancement (Ongoing)

- [ ] Add FAQ sections to top 10 articles
- [ ] Create 3 comparison guides (frameworks, tools, standards)
- [ ] Implement HowTo schema for security guides
- [ ] Front-load key information in cornerstone content
- [ ] 10-15% monthly refresh of top articles

### Phase 4: Monitoring (Ongoing)

- [ ] Track AI crawler activity in server logs
- [ ] Monthly manual citation testing
- [ ] Monitor brand authority growth
- [ ] Track framework terminology adoption
- [ ] Document competitor citation patterns

## Technical Validation

Run these checks to verify implementation:

```bash
# 1. Verify robots.txt is accessible
curl https://www.dcyfr.ai/robots.txt

# 2. Verify llms.txt is accessible
curl https://www.dcyfr.ai/llms.txt

# 3. Verify Organization schema in HTML
curl https://www.dcyfr.ai | grep -A 20 "application/ld+json"

# 4. Test SSR delivery (simulate AI crawler)
curl -A "GPTBot" https://www.dcyfr.ai/blog/owasp-top-10-agentic-ai
curl -A "ClaudeBot" https://www.dcyfr.ai/blog/owasp-top-10-agentic-ai

# 5. Check build passes
npm run build

# 6. Verify TypeScript compilation
npm run type-check

# 7. Run all quality checks
npm run check
```

## Next Actions

**Immediate (This Week):**

1. Create 30-query test database for AI citation tracking
2. Test 5 top articles across ChatGPT, Perplexity, Claude
3. Add FAQ section to OWASP Top 10 article
4. Add FAQ section to CVE-2025-55182 article

**Short-term (2-4 Weeks):**

1. Create comparison guide: "AI Security Frameworks Comparison"
2. Create comparison guide: "ZTNA vs VPN Security Analysis"
3. Add HowTo schema to existing tutorial content
4. Restructure top 5 articles (front-load key info)

**Ongoing:**

1. Monthly AI citation testing
2. 10-15% content refresh per month
3. Monitor GPTBot/ClaudeBot in server logs
4. Track brand mentions across platforms

## Resources

**Research Sources:**

- Evertune AI: "How AI Systems Choose Which Brands to Cite"
- Dataslayer: "Generative Engine Optimization Guide"
- Search Engine Journal: "Complete Crawler List for AI User-Agents"
- Insightland: "The Role of Structured Data in AI Search"

**Standards:**

- llms.txt: https://llmstxt.org/
- Schema.org: https://schema.org/
- Google Search Central: Structured Data Intro

**Internal Documentation:**

- Metadata utilities: `src/lib/metadata.ts`
- Site config: `src/lib/site-config.ts`
- FAQ component: `src/components/mdx/faq-section.tsx`

---

**Status:** Phase 1 Complete ✅
**Next Review:** February 19, 2026 (Phase 2 completion)
**Owner:** Drew (dcyfr)
**Contact:** drew@dcyfr.ai
