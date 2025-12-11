# Content Strategy & Editorial Calendar

**Last Updated:** October 27, 2025  
**Publishing Cadence:** 1 post per month  
**Target Audience:** Full-stack developers, tech leads, builders shipping to production

---

## 🧭 Consolidation & Canonical Sources

To reduce fragmentation and establish a single source of truth, `docs/operations/content-strategy.md` is the canonical content strategy document for the site. Supporting artifacts such as editorial calendars and promotion plans live in `docs/blog/` (for example `docs/blog/content-calendar-2026.md`) and are treated as companion documents.

Guidelines:
- Use this file (`docs/operations/content-strategy.md`) for strategic content decisions, pillars, and long-term publishing cadences.
- Use `docs/blog/content-calendar-2026.md` (and future calendar files under `docs/blog`) for granular publication schedules, promotion plans, and keyword-level planning.
- Ensure cross-references: each calendar or promotion plan should link back to this canonical doc and include a short changelog to record when the calendar was updated.
- If you need to store private drafts or documents (PII or sensitive content), do not store them in the repository; instead use a secure document store (Notion, Google Drive, or an encrypted store). If you need to keep drafts in the codebase temporarily, store them under `docs/operations/private/` *and* ensure `.gitignore` blocks the folder (see repository policies and `.gitignore`).

If you maintain a separate content calendar file, add a short header to the top of that file that points back to this canonical doc and the intended owner/editor.

### Definitions

- **PI (Proprietary Information)** — Per NIST, proprietary information includes trade secrets, internal designs, business processes, and other information that is privately owned and should not be publicly disclosed. See: [NIST glossary — Proprietary Information](https://csrc.nist.gov/glossary/term/proprietary_information)
- **PII (Personally Identifiable Information)** — Information that can be used to uniquely identify a person (names, phone numbers, addresses, emails, etc.). Do not store PII in repository files.

If content or drafts fall into either category, follow the 'private drafts' guidance described above: keep them off-repo and in a secure, access-controlled storage location. Add a short header in the draft that references the canonical doc and the owner/editor when necessary.


---

## 🎯 Content Pillars

This blog focuses on three interconnected pillars that reflect real-world development:

### 1. **Developer Portfolio Series** — From Shipping to Scale
Building and evolving a production-grade portfolio and blog platform. This series covers the entire journey: architecture decisions, security hardening, feature implementation, and performance optimization.

**Audience:** Developers building their own platforms, learning full-stack patterns  
**Current Status:** 2 posts published, series expanding with new features  
**Cadence:** 1 post/month (flexible with new features)

### 2. **AI & Agentic Developer Workflows** — Human-AI Collaboration
How AI assistants (GitHub Copilot, Claude, etc.) and agentic systems (MCP servers, automation frameworks) can augment developer productivity without replacing critical thinking.

**Audience:** Developers adopting AI, teams building automation, prompt engineers  
**Current Status:** New pillar, launching Q4 2025  
**Cadence:** 1 post/month

### 3. **Cybersecurity in Production** — Practical Hardening
Real-world security patterns, threat modeling, compliance, and DevSecOps. Moving beyond "security + next.js" to comprehensive hardening strategies.

**Audience:** Full-stack developers, team leads, security-conscious builders  
**Current Status:** Initial coverage in portfolio series, expanding Q4 2025  
**Cadence:** 1 post/month

---

## 📅 Publishing Schedule (Q4 2025 - Q2 2026)

### Q4 2025 (October - December)

**November 2025** - Developer Portfolio Series  
**Title:** *Building Event-Driven Architecture: Inngest, Background Jobs & Reliability*  
**Series:** Developer Portfolio (Part 3)  
**Pillar:** Developer Portfolio  
**Status:** 🟢 Ready to write (code complete, documentation done)  
**Estimated Length:** 2,500-3,000 words  
**Target Publish Date:** November 15, 2025  
**Key Topics:** Event-driven patterns, async processing, retry logic, observability, contact form optimization

---

**December 2025** - Cybersecurity in Production  
**Title:** *From CSP to Zero-Trust: A Practical Security Audit of a Next.js Portfolio*  
**Series:** Cybersecurity in Production (Part 1)  
**Pillar:** Cybersecurity  
**Status:** 🟡 Planning phase (implementation complete, needs polish)  
**Estimated Length:** 2,500-3,200 words  
**Target Publish Date:** December 15, 2025  
**Key Topics:** CSP deep-dive, rate limiting, HTTP security headers, threat modeling, defense-in-depth

### Q1 2026 (January - March)

**January 2026** - AI & Agentic Workflows  
**Title:** *AI Assistants as Pair Programmers: Model Context Protocol, Instructions & Workflows*  
**Series:** AI & Agentic Workflows (Part 1)  
**Pillar:** AI & Agentic Workflows  
**Status:** 🟡 Planning phase  
**Estimated Length:** 2,200-2,800 words  
**Target Publish Date:** January 15, 2026  
**Key Topics:** GitHub Copilot patterns, MCP servers, contributor instructions, AI code review

---

**February 2026** - Developer Portfolio Series  
**Title:** *Blog Analytics Without the Database: Redis, View Counts & Trending Posts*  
**Series:** Developer Portfolio (Part 4)  
**Pillar:** Developer Portfolio  
**Status:** 🟡 Planning phase  
**Estimated Length:** 2,000-2,500 words  
**Target Publish Date:** February 15, 2026  
**Key Topics:** Redis integration, analytics architecture, graceful degradation, privacy-preserving tracking

---

**March 2026** - Cybersecurity in Production  
**Title:** *Secrets Management: From .env to Production — A No-Compromise Approach*  
**Series:** Cybersecurity in Production (Part 2)  
**Pillar:** Cybersecurity  
**Status:** 🔴 Backlog  
**Estimated Length:** 2,000-2,400 words  
**Target Publish Date:** March 15, 2026  
**Key Topics:** Environment variables, secret rotation, CI/CD security, accidental exposure prevention

### Q2 2026 (April - June)

**April 2026** - Developer Portfolio Series  
**Title:** *Search at Scale: Full-Text Search Without Elasticsearch*  
**Series:** Developer Portfolio (Part 5)  
**Pillar:** Developer Portfolio  
**Status:** 🔴 Backlog  
**Estimated Length:** 2,000-2,600 words  
**Target Publish Date:** April 15, 2026  
**Key Topics:** Algolia integration, client-side search, indexing strategies, search UX

---

**May 2026** - AI & Agentic Workflows  
**Title:** *Automating Repetitive Tasks: Building Agentic Workflows with Inngest & AI*  
**Series:** AI & Agentic Workflows (Part 2)  
**Pillar:** AI & Agentic Workflows  
**Status:** 🔴 Backlog  
**Estimated Length:** 2,200-2,800 words  
**Target Publish Date:** May 15, 2026  
**Key Topics:** Inngest for AI workflows, function chaining, human approval loops, cost optimization

---

**June 2026** - Cybersecurity in Production  
**Title:** *OWASP Top 10 for Next.js: Practical Defense Against Real Attacks*  
**Series:** Cybersecurity in Production (Part 3)  
**Pillar:** Cybersecurity  
**Status:** 🔴 Backlog  
**Estimated Length:** 2,800-3,200 words  
**Target Publish Date:** June 15, 2026  
**Key Topics:** XSS/CSRF prevention, SQL injection in ORMs, authentication patterns, vulnerability assessment

---

## 📚 Active Series Overview

### Series 1: Developer Portfolio — From Shipping to Scale

**Series Tagline:** "Building a production-grade portfolio platform and learning full-stack patterns along the way."

**Overview:**
A comprehensive journey from weekend project to production platform. Each post covers a distinct technical challenge: security hardening, event-driven architecture, analytics, performance optimization, and search. Real code, real constraints, real solutions.

**Target Audience:** Full-stack developers, indie builders, developers learning advanced Next.js patterns  
**Key Themes:** Next.js, TypeScript, serverless, full-stack architecture, observability

**Series Arc:**
1. ✅ **Shipping Fast** - Shipping a Developer Portfolio (Published: Sep 2025)
2. ✅ **Security Hardening** - Security, Performance & Production Readiness (Published: Oct 2025)
3. 🎯 **Event-Driven** - Background Jobs & Inngest (Nov 2025)
4. 🎯 **Analytics** - Redis, View Counts & Trending (Feb 2026)
5. 🎯 **Search** - Full-Text Search Without Elasticsearch (Apr 2026)

**Lessons Learned (from first 2 posts):**
- Server-first rendering is powerful but requires discipline
- Security hardening is continuous, not a one-time task
- Production readiness requires thinking about failure modes
- Documentation of decisions matters as much as the decisions themselves

---

### Series 2: Cybersecurity in Production — Real Threats, Real Defenses

**Series Tagline:** "Moving beyond checkbox security to practical, defense-in-depth strategies."

**Overview:**
Deep dive into security hardening for full-stack applications. Not theoretical; based on real vulnerabilities and fixes. Covers threat modeling, defense-in-depth, compliance considerations, and lessons from production incidents.

**Target Audience:** Full-stack developers, tech leads, security-conscious builders  
**Key Themes:** Threat modeling, defense-in-depth, OWASP, DevSecOps, incident response

**Series Arc:**
1. 🎯 **Foundations** - CSP & HTTP Security Headers (Dec 2025)
2. 🎯 **Secrets** - Environment Variables & Secret Management (Mar 2026)
3. 🎯 **Threats** - OWASP Top 10 & Real Attacks (Jun 2026)
4. (Future) **Compliance** - GDPR, HIPAA, PCI-DSS for indie builders
5. (Future) **Monitoring** - Security observability and incident response

**Why This Matters:**
Security is often treated as a checklist ("add CSP headers, enable HTTPS, done"). In reality, it's a continuous process of understanding threats, building defenses, and iterating based on incident learnings.

---

### Series 3: AI & Agentic Developer Workflows — Human-AI Collaboration

**Series Tagline:** "Using AI assistants and agentic systems to augment, not replace, developer capability."

**Overview:**
Practical patterns for integrating AI assistants (GitHub Copilot, Claude, etc.) and agentic systems (MCP servers, Inngest workflows) into developer workflows. Focuses on augmentation, not automation; productivity gains, not blind AI generation.

**Target Audience:** All developers, teams adopting AI, builders interested in agentic systems  
**Key Themes:** GitHub Copilot, MCP, LLMs, agentic systems, prompt engineering, AI code review

**Series Arc:**
1. 🎯 **AI Assistants** - Copilot Patterns & Contributor Instructions (Jan 2026)
2. 🎯 **Agentic Workflows** - Automating Tasks with Inngest & AI (May 2026)
3. (Future) **AI-Assisted Testing** - Unit tests, E2E tests, mutation testing
4. (Future) **Code Review with AI** - Structural feedback, security scanning, performance analysis
5. (Future) **Prompt Engineering** - Techniques for effective AI interaction

**Why This Matters:**
AI is transformative, but only when used thoughtfully. This series shares patterns for integrating AI into your workflow in ways that enhance rather than compromise code quality and developer experience.

---

## 📝 Detailed Post Outlines

---

### Developer Portfolio Part 3: Event-Driven Architecture (November 2025)

**Working Title:** *Building Event-Driven Architecture: Inngest, Background Jobs & Reliability*

**Hook:** "Your API routes are lying to your users. They say '200 OK' while work is still happening. Here's how Inngest fixed that problem for our portfolio."

**Outline:**

1. **The Problem** (300 words)
   - Synchronous API route limitations in Next.js
   - Real example: Contact form taking 1-2s to respond
   - Cascading failures when third-party services are slow
   - User experience: what users actually care about

2. **Why Event-Driven?** (400 words)
   - Decouple response time from work completion time
   - Automatic retries without explicit error handling
   - Better observability and distributed tracing
   - Scales infinitely with serverless
   - When NOT to use (CRUD operations, low latency requirements)

3. **Introducing Inngest** (300 words)
   - What it is: serverless durable execution engine
   - Comparison to: cron jobs, webhooks, message queues
   - Key features: retries, scheduling, observability, local dev
   - Free tier generosity vs. paid plans
   - Why we chose it over other solutions

4. **Architecture: Before & After** (400 words)
   - Before: Contact form → email service → slow response
   - After: Contact form → event → Inngest queue → email + logging + monitoring
   - Sequence diagrams
   - Key: user gets 100ms response, work happens in background

5. **Implementation: Contact Form** (600 words)
   - Step 1: Send event from API route (code walkthrough)
   - Step 2: Define step function with retry logic
   - Step 3: Email sending with failure handling
   - Step 4: Error notifications
   - Result metrics: latency improvement, reliability gains

6. **Implementation: Scheduled Tasks** (400 words)
   - GitHub contribution heatmap pre-population (5-min cron)
   - View count aggregation and trending calculation
   - Cache warming for blog posts
   - Running locally with Inngest Dev UI

7. **Developer Experience & Testing** (300 words)
   - Local dev UI for testing functions
   - Replay failed executions
   - Monitoring runs and errors
   - Debugging tips and common pitfalls

8. **Deployment & Observability** (200 words)
   - Vercel integration and environment setup
   - Monitoring dashboard overview
   - Cost analysis (generous free tier)
   - Production readiness checklist

9. **Key Takeaways** (200 words)
   - Event-driven isn't just for "big tech"
   - Reliability compounds: each 9% improvement stacks
   - User experience > implementation complexity
   - Start simple, add complexity when needed

**Assets Needed:**
- Before/after architecture diagrams
- Inngest Dev UI screenshots
- Performance comparison graphs (latency, error rates)
- Code snippets from `/src/inngest/`

**SEO Keywords:** event-driven architecture, Next.js background jobs, Inngest, async processing, durable execution, serverless

---

### Cybersecurity Part 1: CSP & HTTP Security (December 2025)

**Working Title:** *From CSP to Zero-Trust: A Practical Security Audit of a Next.js Portfolio*

**Hook:** "I found 7 security vulnerabilities in my portfolio in the first security audit. Most could have been prevented with better headers and middleware."

**Outline:**

1. **Why Security Audits Matter** (250 words)
   - Security is often an afterthought
   - Real-world incidents: how breaches happen
   - The cost of ignoring security (reputation, legal, data)
   - Shifting left: security during development

2. **Content Security Policy (CSP)** (600 words)
   - What CSP does: prevents XSS, clickjacking, data exfiltration
   - Common mistakes: `unsafe-inline`, overly permissive policies
   - Nonce-based CSP in Next.js middleware (our approach)
   - Testing and debugging CSP violations
   - Common pain points and solutions
   - Code walkthrough: `src/middleware.ts` implementation

3. **HTTP Security Headers** (500 words)
   - X-Frame-Options: DENY (clickjacking prevention)
   - X-Content-Type-Options: nosniff (MIME-sniffing)
   - Strict-Transport-Security (HSTS)
   - Referrer-Policy (privacy protection)
   - Permissions-Policy (browser feature control)
   - Vercel configuration example

4. **Rate Limiting & DOS Protection** (500 words)
   - Why rate limiting matters (spam, DOS, cost control)
   - Our implementation: Redis-backed with graceful fallback
   - Per-IP vs. per-route vs. per-user
   - Testing rate limits locally
   - Cost implications (what happens under attack?)

5. **Defense-In-Depth** (300 words)
   - Security is layers, not a single solution
   - Application layer + CDN layer + WAF
   - When to add each layer
   - Diminishing returns (don't over-engineer)

6. **Threat Model** (300 words)
   - Who would attack my portfolio? (probably nobody)
   - What could they do? (XSS, DOS, data theft)
   - What am I protecting? (user data, reputation)
   - Proportional defenses based on threat level

7. **Monitoring & Incident Response** (250 words)
   - How to detect attacks (CSP reports, rate limit alerts)
   - Responding to security incidents
   - Post-incident analysis
   - When to escalate

8. **Key Takeaways** (200 words)
   - Security isn't optional, even for small projects
   - Start with basics (headers, CSP, rate limiting)
   - Automate security checks in CI
   - Monitor and iterate based on real data

**Assets Needed:**
- CSP violation examples (browser DevTools screenshots)
- Attack scenario diagrams
- Header comparison table (before/after)
- Monitoring dashboard screenshots

**SEO Keywords:** Content Security Policy, HTTP security headers, Next.js security, XSS prevention, DOS protection, CSP nonce

---

### AI & Agentic Workflows Part 1: AI Assistants (January 2026)

**Working Title:** *AI Assistants as Pair Programmers: Model Context Protocol, Instructions & Workflows*

**Hook:** "I taught an AI my codebase's rules. Now it writes code that's actually usable without heavy revision."

**Outline:**

1. **The AI Adoption Problem** (250 words)
   - AI tools often violate project conventions
   - Generic code that doesn't fit your architecture
   - Constant context-switching and correction
   - Why most AI adoption fails (wrong expectations)

2. **AI as Augmentation, Not Replacement** (350 words)
   - What AI is good at: scaffolding, boilerplate, exploration
   - What AI is bad at: architecture decisions, trade-offs, requirements
   - Mental model: AI as intern, you as architect
   - Where AI-assisted coding shines vs. fails

3. **Contributor Instructions: Teaching AI Your Rules** (500 words)
   - `.github/copilot-instructions.md` strategy
   - What to document (stack, conventions, constraints)
   - What NOT to document (leave room for AI creativity)
   - Auto-sync with workspace for IDE integration
   - Example: our contributor instructions and results

4. **Model Context Protocol (MCP)** (400 words)
   - What is MCP? (standardized communication between AI and tools)
   - Why it matters: security, local-first, extensibility
   - Available servers: Memory, Sequential Thinking, Context7, Sentry, Vercel
   - Configuration in VS Code
   - MCP example: Vercel MCP for deployment management

5. **AI Code Review & Quality Gates** (350 words)
   - Using GitHub Copilot for code review
   - What to automate: style, patterns, obvious bugs
   - What NOT to automate: architecture, trade-offs, security
   - Integrating AI review into PR workflow

6. **Real Workflow: From Prompt to Merge** (400 words)
   - Case study: Using AI to add a new feature to our blog
   - Step 1: Prompt with requirements + contributor instructions
   - Step 2: AI generates code, sometimes with hallucinations
   - Step 3: Local testing and human review
   - Step 4: Requesting AI to fix issues
   - Step 5: Final human approval and merge

7. **Avoiding Common Pitfalls** (300 words)
   - Over-reliance on AI: the quality cliff
   - Security blindspots: AI doesn't think about attacks
   - Hallucination: AI confidently suggests wrong solutions
   - When to push back: trusting your instincts
   - Measuring effectiveness (fewer revisions = better instructions)

8. **Key Takeaways** (200 words)
   - AI is a force multiplier, not a replacement
   - Your project's documentation matters more than ever
   - Good contributor guidelines = better AI assistance
   - Pair it with MCP for even better results

**Assets Needed:**
- Contributor instructions examples
- MCP server architecture diagram
- Before/after code comparison (AI vs. AI-assisted)
- Copilot output screenshot with annotation

**SEO Keywords:** GitHub Copilot, AI coding assistants, Model Context Protocol, contributor guidelines, AI code review, prompt engineering

---

### Developer Portfolio Part 4: Analytics (February 2026)

**Working Title:** *Blog Analytics Without the Database: Redis, View Counts & Trending Posts*

**Hook:** "How I track blog analytics with just Redis and no database—and how the fallback still works when Redis is down."

**Outline:**

1. **The Analytics Dilemma** (250 words)
   - Why track analytics? (measure success, find great content)
   - Common approach: full analytics platforms (Amplitude, Mixpanel)
   - Cost for indie builders: can be expensive
   - Privacy concerns: tracking users
   - A better way: minimal analytics

2. **Redis for Real-Time Counters** (400 words)
   - Why Redis? (fast, atomic operations, expiration)
   - View count tracking architecture
   - Per-post counters with INCR
   - Graceful fallback when Redis is unavailable
   - Upstash Redis: serverless Redis setup

3. **Trending Post Algorithm** (400 words)
   - Simple algorithm: views in last 7/30 days
   - More sophisticated: weighted by recency
   - Implementation: cron job to aggregate daily
   - Displaying trending on homepage
   - Why trending matters for discoverability

4. **Privacy-First Tracking** (300 words)
   - What NOT to track (user IDs, sessions, behavior paths)
   - What to track (page views, traffic source if available)
   - GDPR considerations
   - Cookie-free tracking
   - User privacy as feature, not afterthought

5. **Analytics Dashboard** (300 words)
   - Simple internal dashboard showing metrics
   - Post view leaderboard
   - Traffic over time
   - When to hide (production) vs. show (dev)
   - Read-only for developers, read-write for author

6. **Integration with Inngest** (300 words)
   - Scheduled aggregation jobs
   - Moving raw counts → daily summaries
   - Archiving old data to reduce Redis size
   - Cost optimization: batch operations

7. **Handling Edge Cases** (200 words)
   - Redis connection failures
   - Preventing double-counting (INCR race conditions)
   - Time zone handling for daily aggregation
   - Importing historical data

8. **Key Takeaways** (150 words)
   - You don't need complex analytics platforms
   - Redis is incredibly useful for simple counting
   - Graceful degradation is underrated
   - Start simple, add features when needed

**Assets Needed:**
- Analytics dashboard screenshots
- Redis architecture diagram
- Trending algorithm visualization
- Fallback flow chart

**SEO Keywords:** blog analytics, Redis, view counts, serverless database, trending posts, Upstash

---

### Cybersecurity Part 2: Secrets Management (March 2026)

**Working Title:** *Secrets Management: From .env to Production — A No-Compromise Approach*

**Hook:** "A developer on my team accidentally committed an API key. Here's the story and how I fixed it."

**Outline:**

1. **The Secrets Leak Problem** (300 words)
   - Real incident: API key in GitHub (takes minutes to compromise)
   - Cost of exposure: account takeover, data theft, ransom
   - Why it happens: developers aren't trained, tooling is confusing
   - Prevention: people + process + tooling

2. **Types of Secrets & Their Lifecycle** (350 words)
   - API keys (GitHub, third-party services)
   - Database credentials
   - Private encryption keys
   - OAuth tokens and JWTs
   - Each has different rotation requirements

3. **Development: Local .env Files** (300 words)
   - `.env.local` for development (never commit)
   - `.env.example` as documentation
   - Tools for managing multiple .env files
   - Dangers: still commits mistakes
   - Best practices: automation that prevents commits

4. **CI/CD: GitHub Secrets** (300 words)
   - GitHub Actions secrets management
   - Organization vs. repository secrets
   - Principle of least privilege: minimal scope
   - Audit trail: who accessed what and when
   - Rotating secrets: automation vs. manual

5. **Production: Secret Management Services** (400 words)
   - Vercel Environment Variables: right for Vercel deployments
   - AWS Secrets Manager / Systems Manager Parameter Store
   - HashiCorp Vault: for self-hosted
   - 1Password / Bitwarden: team-friendly alternatives
   - When to use each

6. **Preventing Accidental Commits** (250 words)
   - Git hooks: pre-commit scanning
   - Tools: `git-secrets`, `gitguardian`
   - GitHub push protection
   - CI/CD scanning before deploy
   - Defense in depth: multiple layers

7. **Access Control & Rotation** (250 words)
   - Principle of least privilege
   - Role-based access control (RBAC)
   - Secret rotation schedules
   - Automated vs. manual rotation
   - Audit logging for compliance

8. **Incident Response** (200 words)
   - If a secret leaks: immediate rotation
   - Scanning commit history
   - Timeline of access (who accessed it, when)
   - Post-incident: automation to prevent recurrence

9. **Key Takeaways** (150 words)
   - Secrets are risk vectors, treat accordingly
   - Automate everything (prevent human mistakes)
   - Rotation is as important as protection
   - Audit trail is critical for compliance

**Assets Needed:**
- Secret types comparison table
- Lifecycle diagram (create → rotate → retire)
- Access control matrix
- Incident response flowchart

**SEO Keywords:** secrets management, API keys, environment variables, GitHub secrets, credential rotation, DevSecOps

---

### Developer Portfolio Part 5: Search (April 2026)

**Working Title:** *Search at Scale: Full-Text Search Without Elasticsearch*

**Hook:** "I added full-text blog search without a single database query. Here's how Algolia changed the game."

**Outline:**

1. **The Search Problem** (250 words)
   - Basic client-side search: poor UX for large blogs
   - Database search: adds complexity, cost
   - Elasticsearch: overkill for indie blogs, operational burden
   - The sweet spot: managed search services

2. **Search UX Fundamentals** (300 words)
   - Instant results (no page reload)
   - Typeahead suggestions
   - Relevance ranking
   - Filtering (by tag, date, author)
   - Mobile-friendly
   - Accessibility considerations

3. **Algolia: Managed Search** (400 words)
   - What it is: hosted full-text search service
   - Why it's great for blogs: generously free tier, fantastic UX
   - Indexing: how to keep search index in sync with blog posts
   - Query API: simple, powerful, well-documented
   - Cost: free tier covers most indie blogs

4. **Implementation: Indexing** (350 words)
   - Static index at build time (MDX posts)
   - Sending index to Algolia (API call)
   - Metadata: title, URL, date, tags, content
   - Partial indexing: updating only changed posts
   - Vercel integration: automatic on deploy

5. **Implementation: Search UI** (350 words)
   - React component for search input
   - Client-side Algolia SDK
   - Debounced queries (no query spam)
   - Displaying results: title, excerpt, metadata
   - Highlighting matching terms
   - Analytics: tracking searches

6. **Advanced Features** (250 words)
   - Faceted search (filter by tag)
   - Typo tolerance (fuzzy matching)
   - Synonyms (different terms for same concept)
   - Ranking customization (boost recent posts)
   - A/B testing search ranking

7. **Analytics: What People Search For** (200 words)
   - Popular search terms
   - Search success rate (found what they wanted?)
   - No results queries (content gap indicator)
   - Using analytics to improve content

8. **Privacy & Performance** (200 words)
   - Search queries are sent to Algolia (privacy consideration)
   - Algolia's privacy policy
   - Client-side search as alternative (slower, more storage)
   - Performance impact: minimal with Algolia

9. **Key Takeaways** (150 words)
   - Search enhances discoverability
   - Managed solutions (Algolia) beat DIY
   - Even small blogs benefit from search
   - Use analytics to guide content strategy

**Assets Needed:**
- Search UI screenshots
- Indexing pipeline diagram
- Before/after blog navigation
- Analytics examples (popular searches)

**SEO Keywords:** full-text search, Algolia, blog search, Next.js search, typeahead, search UX

---

### AI & Agentic Workflows Part 2: Automating Tasks (May 2026)

**Working Title:** *Automating Repetitive Tasks: Building Agentic Workflows with Inngest & AI*

**Hook:** "Every time a new blog post publishes, 5 things happen automatically. Here's how I built a no-code orchestration system with Inngest and AI."

**Outline:**

1. **The Automation Problem** (250 words)
   - Manual tasks are error-prone and time-consuming
   - Automation without agentic systems is fragile
   - AI-assisted automation: the next frontier
   - When to automate vs. when to keep manual

2. **What is an Agentic Workflow?** (350 words)
   - Definition: system that makes decisions and takes actions
   - Examples: approve-then-publish, multi-step pipelines
   - State machines and error recovery
   - Human-in-the-loop: keeping humans as decision-makers
   - Why Inngest: visual workflows, local dev, reliability

3. **Case Study: Blog Post Publishing Workflow** (600 words)
   - Trigger: new post file created/updated
   - Step 1: Validate frontmatter and content
   - Step 2: Generate social media posts (AI-assisted)
   - Step 3: Human review and approval
   - Step 4: Publish to blog and update index
   - Step 5: Send notifications (newsletter, social)
   - Human approval gates: where humans stay in control
   - Dashboard: visibility into workflow runs

4. **AI in Workflows: Augmentation Patterns** (400 words)
   - Generate content summaries from posts
   - Create social media variations (Twitter, LinkedIn, HN)
   - Suggest tags and categories
   - Draft email newsletter content
   - Important: AI-generated ≠ AI-published (humans decide)

5. **Building the Workflow** (400 words)
   - Defining events and triggers
   - Step functions with branching logic
   - Retry logic and error handling
   - Human approval steps (long-running flows)
   - Local testing with Inngest Dev UI
   - Deploying to production

6. **Monitoring & Observability** (250 words)
   - Dashboard: workflow success rate
   - Error patterns: what fails and why
   - Logs: debugging failed runs
   - Notifications: alerts for failures
   - Cost tracking: automation vs. manual

7. **Other Automation Opportunities** (250 words)
   - GitHub workflow automation (PR reviews, releases)
   - Content moderation (Giscus comments)
   - Analytics aggregation (daily/weekly reports)
   - Cache warming and index updates
   - When to say no (keep it simple)

8. **Key Takeaways** (150 words)
   - Automation amplifies mistakes if done wrong
   - Human approval gates are critical
   - AI + Inngest = powerful automation
   - Start with high-value tasks
   - Measure ROI (time saved vs. complexity)

**Assets Needed:**
- Workflow diagram (Inngest visual)
- Step function sequence diagram
- Dashboard screenshots
- AI-generated content examples

**SEO Keywords:** agentic workflows, Inngest automation, AI automation, event-driven automation, workflow orchestration, no-code automation

---

### Cybersecurity Part 3: OWASP Top 10 (June 2026)

**Working Title:** *OWASP Top 10 for Next.js: Practical Defense Against Real Attacks*

**Hook:** "The OWASP Top 10 is your roadmap to security. Here's how to defend against each one in your Next.js application."

**Outline:**

1. **What is OWASP?** (200 words)
   - OWASP Top 10 explained
   - Most critical web vulnerabilities
   - How it guides security testing
   - Version 2021 vs. 2017 changes

2. **A1: Broken Access Control** (350 words)
   - What it is: users accessing resources they shouldn't
   - Real example: accessing other user's data by ID guessing
   - Prevention: middleware, row-level security, API checks
   - Testing: attempt to access unauthorized resources
   - Code example: protected API route with auth check

3. **A2: Cryptographic Failures** (300 words)
   - Storing secrets in plaintext
   - Using outdated encryption
   - Not hashing passwords
   - Exposed credentials in version control
   - Prevention: bcrypt, environment variables, secrets rotation

4. **A3: Injection** (350 words)
   - SQL injection (ORM protection)
   - NoSQL injection (validation)
   - Command injection (avoid shell commands)
   - Prevention: parameterized queries, input validation, ORM
   - Real example: contact form validation

5. **A4: Insecure Design** (300 words)
   - Missing security requirements
   - Threat modeling not done
   - Security patterns not applied
   - Prevention: threat modeling, design review, STRIDE
   - Our threat model for the portfolio

6. **A5: Security Misconfiguration** (250 words)
   - Debug mode enabled in production
   - Default credentials not changed
   - Missing security headers
   - Verbose error messages revealing internals
   - Prevention: security headers, environment-based config

7. **A6: Vulnerable Components** (250 words)
   - Outdated dependencies with known CVEs
   - Dependencies with transitive vulnerabilities
   - Testing: Snyk, npm audit, supply chain risks
   - Prevention: regular updates, automated scanning
   - Case study: fixing a real CVE in our dependencies

8. **A7: Identification Failures** (250 words)
   - Weak authentication (predictable sessions)
   - No rate limiting on login
   - Credential stuffing attacks
   - Session fixation
   - Prevention: strong passwords, rate limiting, secure sessions

9. **A8: Data Integrity Failures** (200 words)
   - Trusting user input
   - Lack of validation on both client and server
   - Insecure CI/CD pipelines
   - Prevention: validation, code signing, secure deployment

10. **A9: Logging Failures** (200 words)
    - Not logging security events
    - Logs not monitored
    - Insufficient retention
    - Prevention: comprehensive logging, alerts, retention policy

11. **A10: SSRF (Server-Side Request Forgery)** (250 words)
    - Attacker makes server fetch malicious content
    - Real example: GitHub API integration with untrusted URL
    - Prevention: URL validation, allowlists, network segmentation
    - Testing: attempting to access internal services

12. **Defense-In-Depth Architecture** (250 words)
    - Layered defenses for each vulnerability class
    - No single defense is sufficient
    - Security testing checklist
    - Common patterns across the OWASP Top 10

13. **Key Takeaways** (150 words)
    - OWASP Top 10 is your security curriculum
    - Not all 10 apply equally to your app (threat modeling)
    - Automation (Snyk, SAST) catches some, not all
    - Manual testing and code review are critical
    - Security is ongoing, not a checkbox

**Assets Needed:**
- OWASP Top 10 comparison table
- Real attack scenarios (screenshots/diagrams)
- Vulnerability examples from code
- Remediation checklist

**SEO Keywords:** OWASP Top 10, Next.js security, web application security, OWASP 2021, secure coding practices

---

### Writing Style

**Voice & Tone:**
- Conversational but authoritative
- Technical depth without jargon overload
- Honest about trade-offs (not everything is perfect)
- Learning-focused (share mistakes and discoveries)

**Structure:**
- Hook in first 100 words (problem or surprising claim)
- Visual breaks every 300-500 words (code, diagrams, lists)
- "Key Takeaways" section at end
- "What's Next" preview of next post

**Code Examples:**
- Real code from the project (not toy examples)
- Syntax highlighting with Shiki
- Comments for complex logic
- Before/after comparisons when relevant

### Length Targets

- **Short posts:** 1,500-2,000 words (tactical, focused)
- **Medium posts:** 2,000-2,500 words (most common)
- **Deep-dive posts:** 2,500-3,500 words (architecture, complex topics)

### SEO Best Practices

- Primary keyword in title and first paragraph
- 2-3 secondary keywords naturally throughout
- Internal linking to previous posts in series
- External links to official documentation
- Alt text for all images
- Meta description (155 characters)

### Visual Assets

**Required for each post:**
- Hero image or featured graphic (OpenGraph)
- 2-3 diagrams or screenshots
- Code snippets with syntax highlighting

**Nice to have:**
- GIFs or videos for interactive features
- Performance graphs or charts
- Before/after comparisons

---

## 📊 Content Metrics & Goals

### Success Metrics (Per Post)

**Traffic Goals:**
- Month 1: 500-1,000 views
- Month 3: 2,000-5,000 views (as SEO kicks in)
- Month 12: 10,000+ views (evergreen content)

**Engagement Goals:**
- Average time on page: 5+ minutes
- Scroll depth: 70%+ reach end
- Comments: 5-10 per post (via Giscus)
- Social shares: 20-50 per post

**SEO Goals:**
- Index within 24 hours
- Rank on page 1 for primary keyword (within 6 months)
- Appear in "People also ask" snippets

### Growth Targets

**Q4 2025:** Establish publishing cadence, 2 posts published  
**Q1 2026:** Complete "Developer Portfolio" series (4 more posts), 10K monthly views  
**Q2 2026:** Launch new series, 20K monthly views  
**Q3 2026:** 2 active series, 40K monthly views

---

## 🗂️ Future Series Ideas (2026+)

These series are planned for future exploration based on community interest and project evolution:

### Q3 2026: "Zero-Infrastructure Features" 
Building blog features without a database: Giscus comments, RSS/Atom feeds, print stylesheets, zero-downtime migrations.

### Q4 2026: "TypeScript Patterns at Scale"
Practical TypeScript patterns: type-safe environment variables, discriminated unions for API responses, generic components, Zod for runtime safety.

### Q1 2027: "Performance Optimization Deep-Dive"
ISR strategies, multi-layer caching, CDN edge functions, image optimization, font loading strategies, INP optimization.

### Q2 2027: "DevOps for Indie Developers"
Deployments, preview environments, monitoring, error tracking, performance budgets, incident response for solo builders.

### Future: "Real-World Patterns from Production"
Case studies and lessons learned from running the blog at scale (if/when traffic grows), real incidents and how they were handled, architectural evolution.

---

## 🔬 Content Exploration Topics

These are topics we'll explore as blog post opportunities emerge:

### Primary Channels

**Blog (Primary)**
- Main distribution channel
- Full control over content and design
- SEO foundation

**GitHub (Code Examples)**
- Source code as living documentation
- Issues/Discussions for community feedback
- Stars as social proof

**Social Media (Promotion)**
- Twitter/X: Technical thread with key points
- LinkedIn: Professional angle, career advice
- Reddit: r/nextjs, r/webdev (tactfully)
- Hacker News: Occasional submission for series finales

**Dev.to / Medium (Syndication)**
- Cross-post after 2 weeks (canonical URL to blog)
- Reach broader audience
- Backlinks for SEO

### Community Engagement

**Comments**
- Respond to all Giscus comments within 24 hours
- Ask follow-up questions to encourage discussion
- Feature best comments in future posts

**Newsletter (Future)**
- Monthly digest when backlog is large enough
- Exclusive content or early access
- Start when reaching 10K monthly views

---

## 🎯 Content Goals by Quarter

### Q4 2025 (Current Quarter)
- ✅ Establish monthly publishing cadence
- ✅ Complete 2 posts ("Background Jobs" + "Performance")
- ✅ Document content strategy (this document)
- [ ] Reach 5K monthly blog views
- [ ] Get 50+ Giscus comments across all posts
- [ ] Improve average time on page to 6+ minutes

### Q1 2026
- [ ] Complete "Developer Portfolio" series (4 more posts)
- [ ] Reach 10K monthly blog views
- [ ] Start second series (pick from backlog)
- [ ] Guest post opportunity or podcast interview
- [ ] 100+ GitHub stars on repo

### Q2 2026
- [ ] Publish 3 posts (continue chosen series)
- [ ] Reach 20K monthly blog views
- [ ] Launch newsletter (if subscriber count justifies)
- [ ] Speak at local meetup about one of the series
- [ ] Feature on high-traffic aggregator (HN, Reddit, etc.)

### Q3 2026
- [ ] Run 2 series in parallel
- [ ] Reach 40K monthly blog views
- [ ] Comprehensive SEO audit and optimization
- [ ] Consider creating video content for YouTube

---

---

## 📋 Content Production Checklist

### Pre-Writing Phase (1-2 hours)
- [ ] Review outline and key points
- [ ] Gather code examples from repo
- [ ] Create diagrams (architecture, flow charts)
- [ ] Take screenshots if needed
- [ ] Research external sources and competitor content
- [ ] Draft meta description and title variations

### Writing Phase (4-6 hours)
- [ ] Write first draft following outline
- [ ] Add code examples with syntax highlighting
- [ ] Insert images, diagrams, and visual breaks
- [ ] Write introduction hook
- [ ] Write conclusion and key takeaways
- [ ] Add internal links to previous posts in series
- [ ] Add external links to official documentation

### Editing Phase (2-3 hours)
- [ ] Read aloud for flow and clarity
- [ ] Check for typos and grammar (Grammarly)
- [ ] Verify all code examples work
- [ ] Test all links (internal and external)
- [ ] Optimize images (size, format, alt text)
- [ ] Ensure mobile readability
- [ ] Get feedback from trusted reviewer (optional)

### Pre-Publish Phase (1 hour)
- [ ] Add frontmatter (title, summary, tags, dates)
- [ ] Set featured status if applicable
- [ ] Generate OpenGraph image
- [ ] Write social media posts (Twitter, LinkedIn)
- [ ] Schedule publish date
- [ ] Verify sitemap will update
- [ ] Check RSS/Atom feed generation

### Post-Publish Phase (ongoing)
- [ ] Share on social media immediately
- [ ] Submit to relevant communities (Reddit, HN)
- [ ] Monitor comments and respond
- [ ] Check analytics after 24 hours
- [ ] Fix any typos or broken links reported
- [ ] Update project todo with completion

**Total Time per Post:** 10-15 hours (research to publish)

---

## 🎬 Immediate Next Steps

**November 2025 - Event-Driven Architecture Post:**
1. [ ] Finalize outline
2. [ ] Gather Inngest code from `/src/inngest/` directory
3. [ ] Create architecture diagrams (before/after)
4. [ ] Write first draft (target: 2,500-3,000 words)
5. [ ] Get code examples working with syntax highlighting
6. [ ] Edit and polish
7. [ ] Publish by November 15, 2025

**December 2025 - CSP & Security Headers Post:**
1. [ ] Begin research on current CSP best practices
2. [ ] Document security improvements made in this project
3. [ ] Create screenshots of security headers
4. [ ] Start outline mid-November
5. [ ] Begin writing by end of November
6. [ ] Target publish: December 15, 2025

---

**Document Maintenance:**
- Update this document after each post publishes
- Track actual vs. estimated writing time for planning
- Adjust future topics based on traffic and engagement metrics
- Review quarterly and adjust goals based on performance

**Content Strategy Owner:** Drew  
**Last Updated:** October 27, 2025  
**Next Quarterly Review:** January 15, 2026

---

---

## 📚 Resources & References

### Writing Tools
- **Grammar:** Grammarly, LanguageTool
- **SEO:** Ahrefs, Semrush (free tier)
- **Images:** Excalidraw (diagrams), Carbon (code screenshots)
- **GIFs/Videos:** Screen Studio, LICEcap

### Inspiration & Research
- **Blogs to follow:**
  - Lee Robinson (Vercel VP, Next.js)
  - Kent C. Dodds (testing, React)
  - Josh W. Comeau (CSS, UI/UX)
  - Dan Abramov (React, deep technical)
  - Tania Rascia (beginner-friendly)

- **Newsletters:**
  - Bytes (JavaScript Weekly)
  - React Status
  - Node Weekly
  - Frontend Focus

### Analytics & SEO
- **Vercel Analytics** - Built-in, track page views
- **Google Search Console** - Monitor search performance
- **Ahrefs Webmaster Tools** - Free SEO audit
- **Plausible/Umami** - Privacy-friendly analytics (future)

---

## 🔄 Review & Update Cadence

**Monthly Review (15th of each month):**
- Review previous month's publishing performance
- Adjust next month's topic if needed
- Update content calendar
- Check backlog for new ideas

**Quarterly Review (End of quarter):**
- Analyze traffic trends and top-performing posts
- Update editorial guidelines based on learnings
- Evaluate series performance (continue or pivot)
- Plan next quarter's content themes

**Annual Review (December):**
- Comprehensive year-in-review post
- Update content strategy for next year
- Evaluate whether to increase publishing frequency
- Consider new content formats (video, podcast, etc.)

---

## 🎬 Next Steps (Immediate Actions)

1. **This Week (Oct 26 - Nov 1):**
   - [ ] Create outline for "Background Jobs" post
   - [ ] Gather code examples from `/src/inngest/`
   - [ ] Create architecture diagram (before/after contact form)
   - [ ] Draft introduction and problem statement

2. **Next Week (Nov 2 - Nov 8):**
   - [ ] Write first draft (2,500 words target)
   - [ ] Add code examples and syntax highlighting
   - [ ] Create Inngest Dev UI screenshots

3. **Week of Nov 9 - Nov 15:**
   - [ ] Edit and polish
   - [ ] Get feedback from trusted reviewer
   - [ ] Create social media posts
   - [ ] Publish on Nov 15

4. **Post-Publish (Nov 15+):**
   - [ ] Promote on social media
   - [ ] Monitor comments and engagement
   - [ ] Start outlining December post

---

**Document Maintenance:**
- Update this document after each post is published
- Track actual vs. estimated writing time to improve planning
- Add new series ideas as they emerge
- Review and adjust goals quarterly

**Owner:** Drew  
**Last Review:** October 26, 2025  
**Next Review:** November 15, 2025
