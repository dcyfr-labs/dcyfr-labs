# AI Discovery & Structured Data Implementation

## Overview
This document describes the AI discovery features and structured data implementation for www.dcyfr.ai. These features help AI assistants, crawlers, and search engines better understand and discover content on the site.

## Implemented Features

### 1. Schema.org JSON-LD Structured Data

#### Blog Posts (`/blog/[slug]`)
- **Schema Type**: `Article`
- **Fields**: headline, description, datePublished, dateModified, author, publisher, keywords, wordCount
- **Purpose**: Helps AI assistants understand article content, authorship, and context
- **Location**: `src/app/blog/[slug]/page.tsx`

#### Projects Page (`/projects`)
- **Schema Type**: `CollectionPage` with `ItemList` of `SoftwareSourceCode`
- **Fields**: name, description, codeRepository, programmingLanguage, keywords, creativeWorkStatus
- **Purpose**: Makes project information discoverable and structured for AI analysis
- **Location**: `src/app/projects/page.tsx`

#### Home Page (`/`)
- **Schema Types**: `WebSite`, `Person`, `WebPage` (using `@graph`)
- **Purpose**: Establishes site identity and author information
- **Location**: `src/app/page.tsx`

### 2. AI.txt File

A new specification similar to `robots.txt` but specifically for AI crawlers and LLMs.

**Location**: `/ai.txt` (served at `https://www.dcyfr.ai/ai.txt`)

**Implementation**: `src/app/ai.txt/route.ts`

**Features**:
- User-agent specific rules for different AI services
- Training data usage policy (allow with attribution)
- Commercial use policy (allow)
- Attribution requirements and format
- Research and educational use permissions

**AI Services Covered**:
- OpenAI (GPTBot)
- Anthropic (anthropic-ai, Claude-Web)
- Google Extended (for AI training)
- Common Crawl (CCBot)
- Perplexity AI (PerplexityBot)
- Cohere AI

**Policy Summary**:
- ✅ Allow crawling of public content (blog, projects, about)
- ✅ Allow use in AI training with attribution
- ✅ Allow commercial use
- ❌ Disallow API endpoints
- ❌ Disallow contact form (to prevent spam)
- 📝 Require attribution when used in AI responses

### 3. Enhanced robots.txt

**Location**: `/robots.txt` (served at `https://www.dcyfr.ai/robots.txt`)

**Implementation**: `src/app/robots.ts`

**Updates**:
- Added specific rules for AI crawlers
- Granular control over which content each AI can access
- Separate rules for different AI services

**AI User-Agents**:
- `GPTBot`, `ChatGPT-User` (OpenAI)
- `anthropic-ai`, `Claude-Web` (Anthropic)
- `Google-Extended` (Google AI training)
- `CCBot` (Common Crawl)
- `cohere-ai` (Cohere)
- `PerplexityBot` (Perplexity AI)
- `FacebookBot` (Meta AI)

### 4. Existing Features (Enhanced)

These features were already present and now work better with AI discovery:

- **RSS Feed** (`/rss.xml`) - AI assistants can discover new content
- **Atom Feed** (`/atom.xml`) - Alternative syndication format
- **Sitemap** (`/sitemap.xml`) - Complete site structure
- **Security.txt** (`/.well-known/security.txt`) - Security contact info

## How AI Assistants Discover Your Content

### Discovery Flow:

1. **Initial Crawl**: AI crawler visits your site
2. **robots.txt Check**: Reads `/robots.txt` for access rules
3. **ai.txt Check**: Reads `/ai.txt` for AI-specific policies
4. **Sitemap Discovery**: Uses `/sitemap.xml` to find all pages
5. **Structured Data Parsing**: Extracts JSON-LD from pages
6. **Content Analysis**: Understands content through structured metadata
7. **Attribution**: Uses provided attribution format when citing content

### What Each AI Service Sees:

#### GPTBot (OpenAI)
- Can crawl: `/`, `/blog/*`, `/projects/*`, `/about/*`
- Cannot crawl: `/api/*`, `/contact/*`
- Usage: Training and inference with attribution

#### Claude-Web (Anthropic)
- Can crawl: `/`, `/blog/*`, `/projects/*`, `/about/*`
- Cannot crawl: `/api/*`, `/contact/*`
- Usage: Training and inference with attribution

#### Google-Extended
- Can crawl: `/`, `/blog/*`, `/projects/*`, `/about/*`
- Cannot crawl: `/api/*`, `/contact/*`
- Usage: AI training for Bard/Gemini

#### PerplexityBot
- Can crawl: All public pages
- Cannot crawl: `/api/*`
- Usage: Real-time answers with citation

## Benefits

### For AI Assistants:
- **Structured Content**: Easy to parse and understand
- **Clear Context**: Author info, dates, relationships
- **Attribution Info**: Know how to cite your work
- **Access Policies**: Clear rules about what can be used

### For Your Site:
- **Better Discoverability**: AI can find and understand your content
- **Proper Attribution**: Your work is cited correctly
- **Control**: Fine-grained control over AI access
- **SEO Benefits**: Better search engine understanding

### For Users:
- **Accurate AI Responses**: When AI cites your work, it has correct info
- **Up-to-date Info**: AI can discover new content via feeds
- **Rich Snippets**: Better search results with structured data

## Testing & Verification

### Test Structured Data:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **JSON-LD Playground**: https://json-ld.org/playground/

### Test ai.txt:
```bash
curl https://www.dcyfr.ai/ai.txt
```

### Test robots.txt:
```bash
curl https://www.dcyfr.ai/robots.txt
```

### View JSON-LD on Pages:
```bash
# Home page
curl https://www.dcyfr.ai/ | grep -A 50 "application/ld+json"

# Blog post
curl https://www.dcyfr.ai/blog/your-post-slug | grep -A 50 "application/ld+json"

# Projects
curl https://www.dcyfr.ai/projects | grep -A 50 "application/ld+json"
```

## Attribution Format

When AI services cite your content, they should use:

```
Drew. (2025). [Content Title]. Retrieved from https://www.dcyfr.ai
```

Example:
```
Drew. (2025). Shipping a Next.js Developer Portfolio. Retrieved from https://www.dcyfr.ai/blog/shipping-a-nextjs-tiny-portfolio
```

## Maintenance

### Update ai.txt:
- Review every 6 months
- Update date in file comments
- Add new AI services as they emerge
- Adjust policies based on feedback

### Update Structured Data:
- Keep Schema.org types current
- Add new properties as standards evolve
- Validate after content updates

### Monitor AI Crawling:
- Check server logs for AI user-agents
- Monitor bandwidth usage
- Adjust policies if needed

## Future Enhancements

### Potential Additions:
1. **TDM Reservation Protocol**: EU text mining standard
2. **OpenAI Plugin Manifest**: For ChatGPT plugins (if building interactive features)
3. **Social Media Metadata**: Enhanced OG/Twitter cards
4. **Extended Knowledge Graph**: More detailed relationship data
5. **AI-specific Endpoints**: Dedicated API for AI services

### Considerations:
- **Performance**: Monitor impact of crawling
- **Privacy**: Ensure no personal data is exposed
- **Cost**: Watch for bandwidth usage
- **Updates**: Keep up with evolving standards

## References

- [Schema.org Documentation](https://schema.org/)
- [AI.txt Specification](https://site.spawning.ai/ai-txt) (Emerging standard)
- [Google's Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [OpenAI GPTBot](https://platform.openai.com/docs/gptbot)
- [Anthropic Claude Web Crawler](https://www.anthropic.com/claude-web)
- [RFC 9116 - security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)

## Files Modified/Created

### Created:
- `src/app/ai.txt/route.ts` - AI crawler policy file
- `docs/ai/discovery/overview.md` - This documentation

### Modified:
- `src/app/robots.ts` - Enhanced with AI crawler rules
- `src/app/page.tsx` - Added WebSite/Person structured data
- `src/app/blog/[slug]/page.tsx` - Added Article structured data
- `src/app/projects/page.tsx` - Added CollectionPage structured data
- `src/app/.well-known/security.txt/route.ts` - Removed email contact

## Summary

Your site now has comprehensive AI discovery features that:
- ✅ Make content easily discoverable by AI assistants
- ✅ Provide structured, machine-readable information
- ✅ Control how AI services can use your content
- ✅ Ensure proper attribution when cited
- ✅ Follow emerging web standards for AI interaction
- ✅ Maintain privacy and security
- ✅ Improve SEO and search visibility

AI assistants like ChatGPT, Claude, and Perplexity can now better understand, cite, and reference your work while respecting your usage policies.
