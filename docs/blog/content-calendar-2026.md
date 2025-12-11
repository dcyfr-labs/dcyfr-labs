# Content Calendar & Promotion Strategy

**Created:** November 22, 2025  
**Last Updated:** November 22, 2025

Strategic 12-month content calendar with target keywords, promotion checklist, and performance tracking for www.dcyfr.ai.

> Canonical content strategy: `docs/operations/content-strategy.md`
>
> This calendar is a companion document with granular scheduling & promotion details. Keep this in `docs/blog/` and link back to the canonical strategy doc for pillar-level decisions.

---

## Editorial Calendar (12 Months)

### Q1 2026 (Jan-Mar) - Foundation Posts

#### Month 1: January 2026

**Post 1: Security Best Practices for Next.js Apps**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 2 (Jan 8-14, 2026)
- **Effort:** 8-12 hours (research, writing, code examples)
- **Word Count Target:** 2,500-3,500 words

**Primary Keywords:**
- next.js security best practices
- next.js content security policy
- next.js rate limiting

**Secondary Keywords:**
- csp implementation next.js
- next.js middleware security
- protect next.js api routes
- next.js security headers

**Outline:**
1. Introduction - Why security matters in production
2. Content Security Policy (CSP) implementation
   - Nonce generation
   - Middleware architecture
   - Third-party script handling
3. Rate limiting strategies
   - In-memory vs. Redis
   - Per-route configuration
   - Header standards
4. Bot detection patterns
   - Vercel BotID integration
   - Challenge-response flows
5. Security middleware architecture
   - Defense in depth
   - Error handling
6. Production checklist
7. Resources and tools

**Code Examples:**
- CSP middleware with nonce
- Rate limiting implementation
- Bot detection setup
- Complete security headers config

**Internal Links:**
- "Hardening a Developer Portfolio" (existing)
- Projects page (live implementation)
- GitHub repository (code reference)

**Promotion Plan:**
- LinkedIn: Native article with key takeaways
- Dev.to: Full cross-post with canonical URL
- Hashnode: Full cross-post with canonical URL
- Reddit: r/nextjs discussion thread
- Twitter/X: Thread with code snippets
- Hacker News: Submit if particularly novel

---

#### Month 2: February 2026

**Post 2: MDX Setup and Customization in Next.js**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 3 (Feb 12-18, 2026)
- **Effort:** 10-14 hours (comprehensive guide)
- **Word Count Target:** 3,500-4,500 words

**Primary Keywords:**
- next.js mdx setup
- mdx blog next.js
- mdx custom components

**Secondary Keywords:**
- next-mdx-remote configuration
- mdx syntax highlighting next.js
- mdx code blocks shiki
- mdx table of contents
- mdx frontmatter typescript

**Outline:**
1. Introduction - Why MDX for content-heavy sites
2. next-mdx-remote/rsc setup
   - Installation and configuration
   - Server component integration
3. Custom component mapping
   - Headings, links, code blocks
   - Image optimization
   - Custom elements
4. Syntax highlighting with Shiki
   - Dual theme support
   - Language support
   - Line highlighting
5. Table of contents generation
   - rehype-slug and rehype-toc
   - Scroll spy integration
6. Frontmatter schemas with Zod
   - Type safety
   - Validation
7. Advanced features
   - Reading time calculation
   - Related posts algorithm
   - Series support
8. Performance optimization
9. Complete example repository

**Code Examples:**
- Complete MDX configuration
- Custom component implementations
- Shiki theme setup
- TOC generation script
- Frontmatter schema definitions

**Internal Links:**
- Blog system (showcase features)
- "Shipping a Developer Portfolio"
- Mermaid and math equation posts

**Promotion Plan:**
- LinkedIn: Guide + infographic
- Dev.to: Comprehensive tutorial
- Hashnode: Full tutorial
- Reddit: r/nextjs, r/webdev
- Twitter/X: Feature showcase thread
- Newsletter: Feature spotlight (if launched)

---

#### Month 3: March 2026

**Post 3: Implementing GitHub Contributions Heatmap**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 4 (Mar 19-25, 2026)
- **Effort:** 8-10 hours (practical implementation)
- **Word Count Target:** 2,500-3,000 words

**Primary Keywords:**
- github contributions heatmap
- github activity visualization
- react github heatmap

**Secondary Keywords:**
- github contributions api next.js
- build github contribution graph
- github graphql contributions
- custom github activity calendar

**Outline:**
1. Introduction - Portfolio analytics and GitHub data
2. GitHub GraphQL API setup
   - Authentication
   - Query structure
   - Rate limiting
3. Contribution data aggregation
   - Fetching historical data
   - Data transformation
4. React Calendar Heatmap integration
   - Component setup
   - Theming
   - Tooltips
5. Server-side caching strategy
   - ISR with Next.js
   - Redis caching
   - Fallback data
6. Error handling and fallbacks
7. Performance optimization
8. Live demo and code

**Code Examples:**
- GraphQL query implementation
- Data transformation functions
- Heatmap component integration
- Caching strategy
- Error boundaries

**Internal Links:**
- Projects page (live demo)
- "Shipping a Developer Portfolio"
- Performance optimization posts

**Promotion Plan:**
- LinkedIn: Portfolio showcase
- Dev.to: Tutorial with live demo
- Hashnode: Implementation guide
- Reddit: r/webdev, r/reactjs
- Twitter/X: Visual showcase
- Show HN: If implementation is novel

---

### Q2 2026 (Apr-Jun) - Deep Dives

#### Month 4: April 2026

**Post 4: Sentry Integration and Error Tracking in Next.js**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 2 (Apr 8-14, 2026)
- **Effort:** 10-12 hours (production patterns)
- **Word Count Target:** 3,000-4,000 words

**Primary Keywords:**
- sentry next.js integration
- error tracking next.js
- sentry middleware next.js

**Secondary Keywords:**
- next.js error monitoring
- sentry sourcemaps next.js 15
- sentry performance monitoring next.js
- cron monitoring sentry
- error boundary sentry

**Outline:**
1. Introduction - Production error tracking
2. Sentry installation and configuration
   - Project setup
   - Environment configuration
   - DSN management
3. Client and server integration
   - instrumentation-client.ts
   - instrumentation.ts
   - Error boundaries
4. Middleware integration
   - Request context
   - User tracking
5. Sourcemap upload configuration
   - Build-time setup
   - Vercel integration
6. Cron and uptime monitoring
   - Check-in setup
   - Alert configuration
7. Error severity classification
   - Connection errors
   - Critical vs. informational
8. Alert strategy
   - Notification channels
   - Escalation procedures
9. Weekly review process

**Code Examples:**
- Complete Sentry configuration
- Middleware implementation
- Error boundary patterns
- Sourcemap upload script
- Alert configuration

**Internal Links:**
- "Hardening a Developer Portfolio"
- Error monitoring documentation
- Health check API

**Promotion Plan:**
- LinkedIn: Production readiness guide
- Dev.to: Complete tutorial
- Hashnode: Error tracking patterns
- Reddit: r/nextjs
- Twitter/X: Best practices thread
- Sentry blog: Potential guest post

---

#### Month 5: May 2026

**Post 5: Custom Analytics with Vercel Analytics & Redis**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 3 (May 14-20, 2026)
- **Effort:** 10-14 hours (complete system)
- **Word Count Target:** 3,500-4,500 words

**Primary Keywords:**
- vercel analytics next.js
- custom analytics next.js
- redis analytics next.js

**Secondary Keywords:**
- page view tracking next.js
- vercel web vitals monitoring
- next.js analytics without google
- privacy-focused analytics next.js
- redis view counter

**Outline:**
1. Introduction - Privacy-first analytics
2. Vercel Analytics + Speed Insights
   - Installation
   - Configuration
   - Dashboard overview
3. Custom view tracking implementation
   - API routes
   - Redis integration
   - Bot detection
4. Web Vitals monitoring
   - Core Web Vitals tracking
   - Custom reporting
   - Performance budgets
5. Analytics dashboard
   - Trending posts
   - View counts
   - Summary statistics
6. Privacy-first approach
   - No cookies
   - No user tracking
   - Session deduplication
7. Rate limiting for analytics
   - Abuse prevention
   - Layer architecture
8. Production deployment

**Code Examples:**
- View tracking API
- Redis operations
- Web Vitals reporter
- Dashboard implementation
- Bot detection integration

**Internal Links:**
- Blog system (analytics showcase)
- Performance monitoring docs
- Bot detection guide

**Promotion Plan:**
- LinkedIn: Privacy-focused analytics
- Dev.to: Complete system tutorial
- Hashnode: Implementation guide
- Reddit: r/nextjs, r/webdev
- Twitter/X: Dashboard showcase
- Privacy-focused communities

---

#### Month 6: June 2026

**Post 6: Automated Dependency Management with Dependabot**
- **Status:** 📝 Planning
- **Target Publish Date:** Week 4 (Jun 18-24, 2026)
- **Effort:** 6-8 hours (workflow guide)
- **Word Count Target:** 2,000-2,500 words

**Primary Keywords:**
- dependabot configuration
- automated dependency updates
- github dependabot best practices

**Secondary Keywords:**
- dependabot auto merge
- dependabot grouped updates
- dependency security alerts github
- npm audit automation
- keep dependencies up to date

**Outline:**
1. Introduction - Dependency maintenance burden
2. Dependabot configuration
   - dependabot.yml setup
   - Update scheduling
   - Grouped updates by category
3. Auto-merge strategy
   - Safe update criteria
   - GitHub Actions workflow
   - Branch protection rules
4. Security alert integration
   - Immediate notifications
   - Priority handling
   - Patch deployment
5. Review and testing workflow
   - Automated CI checks
   - Manual review checklist
   - Staging deployment
6. Time savings analysis
   - Before/after comparison
   - 4-8 hours/month saved
7. Real-world examples

**Code Examples:**
- dependabot.yml configuration
- Auto-merge workflow
- CI integration
- Security alert handling

**Internal Links:**
- "Hardening a Developer Portfolio"
- CI/CD documentation
- Testing infrastructure

**Promotion Plan:**
- LinkedIn: DevOps efficiency
- Dev.to: Workflow automation guide
- Hashnode: Dependabot setup
- Reddit: r/devops, r/programming
- Twitter/X: Time savings showcase
- GitHub Discussions

---

### Q3 2026 (Jul-Sep) - Advanced Topics

#### Month 7-8: July-August 2026

**Buffer/Guest Posts/Community Contributions**
- Focus on promotion and engagement
- Guest post opportunities on Dev.to, CSS-Tricks, LogRocket
- Community contributions (answering Stack Overflow, GitHub discussions)
- Update existing posts with new information
- Collect feedback and metrics

---

#### Month 9: September 2026

**Post 7: Performance Optimization for Next.js Apps (Bonus)**
- **Status:** 📝 Planning (if bandwidth allows)
- **Target Publish Date:** Week 3 (Sep 10-16, 2026)
- **Effort:** 12-16 hours (comprehensive guide)
- **Word Count Target:** 4,000-5,000 words

**Primary Keywords:**
- next.js performance optimization
- next.js bundle optimization
- next.js lazy loading

**Outline:**
1. Performance audit methodology
2. Bundle optimization strategies
3. Code splitting and lazy loading
4. Image optimization
5. Font loading strategies
6. Edge caching with ISR
7. Monitoring and budgets
8. Real-world results

---

### Q4 2026 (Oct-Dec) - Maintenance & Expansion

#### Months 10-12: October-December 2026

**Content Maintenance:**
- Update all posts with latest Next.js/React versions
- Add reader-requested content
- Analyze traffic and double down on successful topics
- Plan 2027 content strategy

**Potential Topics (Based on Analytics):**
- Testing strategies for Next.js
- Deployment and CI/CD pipelines
- Database integration patterns
- Authentication and authorization
- API design patterns

---

## Target Keywords Assignment

### High-Priority Keywords (Month 1-3)

| Keyword | Monthly Searches | Competition | Assigned Post | Priority |
|---------|-----------------|-------------|---------------|----------|
| next.js mdx setup | 5,000-8,000 | High | Post 2 (Feb) | 🔴 |
| github contributions heatmap | 2,000-3,000 | Medium | Post 3 (Mar) | 🔴 |
| next.js security best practices | 500-1,000 | Medium | Post 1 (Jan) | 🔴 |
| mdx blog next.js | 3,000-5,000 | High | Post 2 (Feb) | 🟡 |
| next.js content security policy | 300-500 | Low | Post 1 (Jan) | 🟡 |

### Medium-Priority Keywords (Month 4-6)

| Keyword | Monthly Searches | Competition | Assigned Post | Priority |
|---------|-----------------|-------------|---------------|----------|
| sentry next.js integration | 3,000-5,000 | Moderate | Post 4 (Apr) | 🟡 |
| vercel analytics next.js | 2,000-3,000 | High | Post 5 (May) | 🟡 |
| custom analytics next.js | 1,000-2,000 | Low | Post 5 (May) | 🟡 |
| dependabot configuration | 1,500-2,500 | Moderate | Post 6 (Jun) | 🟢 |
| redis analytics next.js | 200-500 | Low | Post 5 (May) | 🟢 |

---

## Promotion Checklist

### Pre-Publication (1 Week Before)

- [ ] Complete draft with all code examples tested
- [ ] Create social preview image (1200x630)
- [ ] Write 3-5 social media variations
- [ ] Prepare code repository (if applicable)
- [ ] Set up tracking links for analytics
- [ ] Schedule LinkedIn post
- [ ] Draft cross-post for Dev.to
- [ ] Draft cross-post for Hashnode
- [ ] Prepare Reddit discussion post
- [ ] Create Twitter/X thread

### Publication Day

- [ ] Publish on www.dcyfr.ai
- [ ] Verify all links and images work
- [ ] Test on mobile and desktop
- [ ] Publish LinkedIn native article (+ link post)
- [ ] Cross-post to Dev.to with canonical URL
- [ ] Cross-post to Hashnode with canonical URL
- [ ] Submit to relevant subreddits (timing: 9-11am ET)
- [ ] Post Twitter/X thread
- [ ] Share in relevant Discord/Slack communities
- [ ] Email newsletter (if launched)

### Week 1 Follow-Up

- [ ] Respond to all comments within 24 hours
- [ ] Engage with social media discussions
- [ ] Monitor analytics for traffic patterns
- [ ] Share reader feedback on Twitter
- [ ] Update post with any corrections
- [ ] Thank sharers and commenters

### Week 2-4 Ongoing

- [ ] Weekly engagement check
- [ ] Track keyword rankings
- [ ] Monitor backlinks (if any)
- [ ] Respond to new comments
- [ ] Consider follow-up posts based on questions

---

## Platform-Specific Strategies

### LinkedIn

**Format:** Native article + link post
**Timing:** Tuesday-Thursday, 9-11am ET
**Strategy:**
- Lead with personal story or insight
- Include 1-2 code snippets as images
- End with clear call-to-action
- Use 3-5 relevant hashtags
- Tag relevant companies (Next.js, Vercel)
- Engage in comments within first hour

**Sample Post Structure:**
```
Hook: Personal story or surprising insight
Problem: What challenge this solves
Solution: High-level overview (3-5 points)
Results: Real metrics from implementation
CTA: Read full guide [link]
Hashtags: #NextJS #WebDevelopment #TypeScript
```

---

### Dev.to

**Format:** Full tutorial with canonical URL
**Timing:** Wednesday-Thursday, 8-10am ET
**Strategy:**
- Use series feature for related posts
- Add post to relevant collections
- Use all 4 tag slots
- Include cover image
- Add table of contents
- Cross-link related posts
- Engage with comments

**Tags (Max 4):**
- nextjs
- typescript
- webdev
- security (or relevant topic)

---

### Hashnode

**Format:** Full tutorial with canonical URL
**Timing:** Thursday-Friday, 10am-12pm ET
**Strategy:**
- Join relevant communities
- Use appropriate tags
- Add cover image
- Include meta description
- Cross-link related posts
- Participate in discussions

---

### Reddit

**Format:** Discussion post with link
**Timing:** Monday-Wednesday, 9-11am ET
**Subreddits:**
- r/nextjs (primary for Next.js content)
- r/webdev (general web development)
- r/reactjs (React-related content)
- r/programming (high-level topics)
- r/devops (infrastructure topics)

**Strategy:**
- Follow subreddit rules strictly
- Lead with value, not self-promotion
- Be present to answer questions
- Don't post same link to multiple subs same day
- Space submissions 24-48 hours apart

**Sample Post:**
```
Title: I built a production-ready security layer for Next.js (CSP, rate limiting, bot detection)

Body:
After deploying my portfolio to production, I spent weeks implementing defense-in-depth security. Here's what I learned:

[2-3 key insights with bullets]

Wrote up the complete implementation with code examples: [link]

Happy to answer questions!
```

---

### Twitter/X

**Format:** Thread (5-10 tweets)
**Timing:** Tuesday-Wednesday, 2-4pm ET
**Strategy:**
- Lead with engaging hook tweet
- One key point per tweet
- Include code snippets as images
- Use relevant hashtags (2-3 max)
- End with link + CTA
- Pin thread for 24 hours
- Engage with replies

**Sample Thread Structure:**
```
1/ Hook: I just spent 2 weeks hardening my Next.js app for production. Here's what every developer should implement 🧵

2/ First: Content Security Policy. Without it, you're vulnerable to XSS attacks. Here's how to implement it properly...

3-8/ [Key points with code snippets]

9/ Full implementation guide with all the code: [link]

What security measures do you implement in production?
```

---

### Hacker News

**Format:** Link post
**Timing:** 8-10am ET or 6-8pm ET (best engagement)
**Strategy:**
- Only submit if genuinely novel or valuable
- Title must be exact or slightly modified article title
- Be present to respond to comments
- Don't be defensive to criticism
- Provide additional context if asked
- Max 1 submission per month

**Guidelines:**
- Must provide significant value
- Avoid click-bait titles
- Be ready for intense technical scrutiny
- Learn from feedback

---

## Performance Review (Monthly)

### Metrics to Track

**Traffic Metrics:**
- Total page views (per post)
- Unique visitors
- Traffic sources (organic, social, referral)
- Bounce rate
- Average time on page
- Scroll depth

**Engagement Metrics:**
- Comments (across all platforms)
- Social shares
- Backlinks
- Newsletter signups (if applicable)
- Contact form submissions

**SEO Metrics:**
- Keyword rankings (top 3 per post)
- Organic search traffic
- Featured snippets
- Click-through rate

**Business Metrics:**
- Consulting inquiries
- Job opportunities
- Speaking invitations
- Professional connections

---

### Monthly Review Process

**First Friday of Each Month (2 hours):**

1. **Traffic Analysis (30 min)**
   - Review Vercel Analytics dashboard
   - Identify top-performing posts
   - Identify underperforming posts
   - Analyze traffic sources

2. **Engagement Review (30 min)**
   - Count comments across platforms
   - Review social media performance
   - Check backlinks in Google Search Console
   - Monitor keyword rankings

3. **Content Audit (30 min)**
   - Update outdated information
   - Fix broken links
   - Respond to pending comments
   - Plan improvements

4. **Strategy Adjustment (30 min)**
   - What worked well?
   - What didn't work?
   - What to double down on?
   - What to change?

**Document in:** `docs/analytics/monthly-content-review-YYYY-MM.md`

---

## Success Criteria

### 3 Months (End of Q1 2026)

- [ ] 3 blog posts published
- [ ] 500+ monthly organic visits
- [ ] 5+ backlinks from dev blogs
- [ ] 100+ social shares combined
- [ ] 3+ consulting inquiries

### 6 Months (End of Q2 2026)

- [ ] 6 blog posts published
- [ ] 1,500+ monthly organic visits
- [ ] 10+ backlinks from dev blogs
- [ ] 250+ social shares combined
- [ ] 5+ consulting inquiries
- [ ] Top 10 ranking for 2+ target keywords

### 12 Months (End of Q4 2026)

- [ ] 7+ blog posts published
- [ ] 3,000+ monthly organic visits
- [ ] 20+ backlinks from reputable sites
- [ ] 500+ social shares combined
- [ ] 10+ consulting inquiries
- [ ] Top 5 ranking for 5+ target keywords
- [ ] Featured in industry newsletter
- [ ] Speaking opportunity at conference/meetup

---

## Newsletter Strategy (Future Consideration)

### Phase 1: Email List Building (Months 1-3)
- Add email capture to blog posts
- Offer lead magnet (e.g., "Next.js Security Checklist PDF")
- Goal: 100 subscribers

### Phase 2: Newsletter Launch (Month 4)
- Monthly newsletter with content roundup
- Exclusive tips not in blog posts
- Community highlights

### Phase 3: Growth (Months 5-12)
- Cross-promotion with other developers
- Featured in larger newsletters
- Goal: 500 subscribers by end of year

**Tools to Consider:**
- ConvertKit (generous free tier)
- Substack (simple, built-in audience)
- Buttondown (privacy-focused, developer-friendly)

---

## Backup Content Ideas

If primary posts take longer or circumstances change:

**Quick Wins (2-4 hours each):**
- "5 Next.js Performance Optimizations That Actually Matter"
- "How I Built a Serverless Contact Form with Inngest"
- "Debugging Next.js Hydration Errors"
- "Tailwind v4: What Changed and How to Migrate"

**Community-Driven:**
- "Reader Q&A: Your Next.js Questions Answered"
- "Common Mistakes I See in Next.js Code Reviews"
- "Tools I Use Every Day as a Full-Stack Developer"

---

## Content Calendar Summary

| Month | Post | Primary Keyword | Est. Traffic | Status |
|-------|------|-----------------|--------------|--------|
| Jan 2026 | Security Best Practices | next.js security | 500-1k | 📝 Planning |
| Feb 2026 | MDX Setup | mdx blog next.js | 5k-8k | 📝 Planning |
| Mar 2026 | GitHub Heatmap | github heatmap | 2k-3k | 📝 Planning |
| Apr 2026 | Sentry Integration | sentry next.js | 3k-5k | 📝 Planning |
| May 2026 | Custom Analytics | vercel analytics | 2k-3k | 📝 Planning |
| Jun 2026 | Dependabot | dependabot config | 1.5k-2.5k | 📝 Planning |
| Jul-Aug 2026 | Buffer Period | — | — | 📝 Planning |
| Sep 2026 | Performance (Bonus) | next.js performance | 3k-5k | 📝 Planning |
| Oct-Dec 2026 | Maintenance | — | — | 📝 Planning |

**Total Projected Organic Traffic (End of Year):** 15k-25k monthly visits

---

## Next Actions

**This Week:**
1. ✅ Create content calendar (this document)
2. ⏳ Create outline for Post 1 (Security Best Practices)
3. ⏳ Set up social media accounts if not already active
4. ⏳ Join relevant online communities

**Next 2 Weeks:**
1. ⏳ Write first draft of Post 1
2. ⏳ Create social preview image
3. ⏳ Set up code examples repository
4. ⏳ Schedule promotion posts

**Next Month:**
1. ⏳ Publish Post 1
2. ⏳ Execute promotion plan
3. ⏳ Begin Post 2 research and outline
4. ⏳ First monthly content review
