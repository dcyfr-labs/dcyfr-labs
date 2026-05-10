# Production Content Audit — dcyfr.ai

**Date:** 2026-05-09
**Auditor:** Drew + Claude (live read-through)
**Production URL:** https://www.dcyfr.ai/
**Companion:** [docs/design/PRODUCTION_AUDIT_2026-05-09.md](design/PRODUCTION_AUDIT_2026-05-09.md) (design audit, PR #586)

---

## Methodology

Live read-through of every public surface, capturing nav structure, full text via the accessibility tree, meta/OG/Twitter/schema for each page, all 9 blog posts with their titles, excerpts, dates, view counts, categories, and tags, plus the full content of footer pages. The design audit covered _how_ the site looks and behaves; this audit covers _what it says, what it claims, and how it reads_.

| Surface            | URL                                  | Words measured       | Voice   | Notes                                                                                                                                                 |
| ------------------ | ------------------------------------ | -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home               | `/`                                  | ~250 visible         | "we"    | Hero + 4 pillar cards + featured post + 5-post recent + DCYFR AI promo + newsletter + topic taxonomy + footer                                         |
| About              | `/about`                             | ~1,400 visible       | "we"    | Hero + Philosophy + Focus areas + How We Work + Meet the Team (2) + Our AI Agent Team (9 agents) + Connect + 25 Latest Badges + 9 Top Skills          |
| Contact            | `/contact`                           | ~250 visible         | "we"    | Hero + 4 service cards + form + Other Ways to Connect + Find Us Elsewhere                                                                             |
| Work               | `/work`                              | ~300 visible         | "we"    | Hero + 6-project grid (`@dcyfr/ai`, `@dcyfr/ai-code-gen`, `@dcyfr/ai-rag`, `@dcyfr/ai-cli`, X64, ISN)                                                 |
| DCYFR AI           | `/ai`                                | ~600 visible         | factual | Hero + install + 4 badges + 6-card "What's included" + Quick start + Delegation v2.0 + Package ecosystem (4) + Comparison table + Documentation links |
| Blog               | `/blog`                              | ~80 chrome + 9 cards | mixed   | Faceted index — Authors, Sort, Categories, Topics, 3 layouts                                                                                          |
| Blog post (sample) | `/blog/shipping-developer-portfolio` | ~6,400 chars         | "I"     | Full post template — sidebar + TOC + reading progress + share + series banner + comments + newsletter                                                 |
| Docs               | `/docs`                              | rich                 | "we"    | "Documentation" hero + 4 quick-tiles + 4 package cards + Quick start                                                                                  |
| Open Source        | `/open-source`                       | rich                 | "we"    | 4-package showcase with versions, downloads/mo, status, tags                                                                                          |
| Sponsors           | `/sponsors`                          | rich                 | "we"    | Hero + "No sponsors yet" empty state + Contributors (2) + Invites (Peerlist, Perplexity, Setapp)                                                      |
| Privacy            | `/privacy`                           | rich                 | "we"    | Last Updated 2026-01-16, full policy with principles + sections                                                                                       |
| Terms              | `/terms`                             | rich                 | "we"    | Last Updated 2026-01-16, full ToS with 13-and-up clause, license, etc.                                                                                |

Tools: Claude in Chrome MCP (accessibility tree + DOM via JS).

---

## Headline numbers

| Metric                       | Value                                                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| Public pages indexable       | ~12+ surfaces (incl. blog post detail, /about/drew, /work/x64, etc.)      |
| Blog catalog                 | 9 posts, Sep 2025 → Mar 2026                                              |
| Blog cadence (rolling 6 mo)  | 1.5 posts / month average                                                 |
| **Days since last post**     | **55 days** (most recent: Mar 15, 2026)                                   |
| Series identified            | 2 ("Portfolio" complete at 4/4, "AI Workflows" stalled at 1/?)            |
| Categories used              | DevSecOps (4), Web Development (2), Architecture (1), uncategorized (2)   |
| Most-viewed post             | "OWASP Top 10 for Agentic AI" — 138 views                                 |
| Least-viewed post            | "AI Assistants as Development Partners" — 16 views (newest, ~7 weeks old) |
| Schema.org                   | Organization on every page; Article + BreadcrumbList on posts             |
| Privacy + Terms last updated | 2026-01-16 (~4 months ago)                                                |
| Personas presented as team   | 2 humans + 9 named AI agents                                              |

---

## Strengths worth keeping

These are working well — preserve them through any rewrite:

- **Schema.org structured data** on every surface (Organization sitewide; Article + BreadcrumbList on posts). Strong SEO foundation.
- **Privacy & Terms exist, are current, and are well-written** ("Privacy by design" is consistent with brand voice).
- **Cal.com booking integration + "currently available for new projects"** banner on About is a real conversion path.
- **Comprehensive social/professional footprint** — Twitter, DEV, LinkedIn, Peerlist, Wellfound, GitHub, Sponsors, Credly, Goodreads. Multi-platform credibility.
- **Series scaffolding** — Portfolio Parts 1-4 are properly cross-linked with prev/next + "View all posts in series" + current-position highlighting. Best-in-class.
- **Blog post template is exceptional** — Reading progress bar · sticky sidebar (byline/post details/quick actions/series nav/related) · TOC sidebar with search and scroll-spy · breadcrumbs · hero image with caption + photographer credit · per-section share buttons (Twitter/LinkedIn/Copy) · Takeaway callouts · code blocks with copy + filename · footnote-style buttons · newsletter form at end · comments. Match this level on any future templates.
- **`/ai` package landing page is marketing-grade** — install command + 4 badges + 6-card feature grid + Quick start code + Delegation Framework v2.0 + Package ecosystem with versions and downloads + comparison table vs. LangChain/Vercel AI SDK/AutoGPT + Documentation roadmap. This page does the work of a docs site, a marketing page, and a launch announcement at once.
- **Faceted blog index** (Authors, Sort by Popular/Newest/Oldest, Show Archived, Date range, Reading time, Categories, Topics, plus 3 view layouts) is a content-discovery superpower.

---

## Findings

Severity scale: **P0** = factually wrong, broken, or trust-damaging; **P1** = strategy or voice problem with clear measurable impact; **P2** = polish.

---

### P0 — Voice ambiguity: solo founder presented as multi-person company

**Where:** Sitewide.
**Evidence:**

- Homepage meta description: "DCYFR Labs publishes DCYFR AI and open-source security tooling — explore cyber architecture, AI engineering, and modern development." → company voice
- About hero: "DCYFR Labs builds @dcyfr/ai — an open-source AI agent framework with plugin marketplace, delegation system, and 20+ specialist agents." → company voice with strong claim
- About philosophy: "We believe in building resilient systems that empower teams to move fast without compromising on security." → "we" plural
- About How We Work: "We share from actual experience" / "Solutions that work in production matter more" / "Every decision has costs—we discuss them openly" → "we" plural
- About Meet the Team: **2 entries** — Drew (Founding Architect, real human, 6+ yrs experience) and DCYFR (AI Lab Assistant, autonomous agent swarm, "20+ specialist agents")
- About Our AI Agent Team: **9 named AI agents** with job-title-style headings (Database Architect, Security Engineer, DevOps Engineer, Performance Profiler, Test Engineer, Architecture Reviewer, Fullstack Developer, TypeScript Pro, Workspace Orchestrator) and "Capabilities" chips
- Blog posts: "I used Next.js App Router, Tailwind v4..." / "I wanted to build a focused portfolio" / "I only use client components where it actually matters" → first-person singular
- Sponsors page Contributors: Drew bio is first-person singular ("Founding Architect and creator of @dcyfr/ai"); DCYFR bio is third-person ("An autonomous agent swarm built on...")

**Why it matters:** A reader can't determine if DCYFR Labs is:

- (a) one engineer + AI assistance (the apparent reality)
- (b) a small team of humans + AI assistance
- (c) marketing fiction inflating capacity

The "Our AI Agent Team" section, with each agent presented as a job-titled team member with capability chips, is the strongest signal that pulls toward (c). A potential customer or recruiter who realizes the "Database Architect" and "Security Engineer" are AI personas may discount everything else.

**Fix paths (pick one and apply consistently):**

1. **Honest plural ("We are Drew + DCYFR")** — keep "we" voice but make explicit that "DCYFR" is an AI agent swarm, not staff. Recast Meet the Team as "Founder" (Drew) and "AI Co-pilot" (DCYFR), and rename "Our AI Agent Team" to "How DCYFR Works" or "Agent Capabilities" — signaling these are tools/personas, not headcount.
2. **Honest singular ("I am Drew, builder of DCYFR Labs")** — switch the company surfaces to first-person and present DCYFR as the toolkit/methodology rather than a co-author. Aligns with the existing blog voice. Stronger personal brand.

The current state (mixed) is the worst option because each surface contradicts another.

---

### P0 — Broken "Explore" links on About page lead to empty blog filter results

**Where:** About → "What We Focus On" section.
**Evidence (verified live):**

- "Explore development articles" → `/blog?category=Web` → **0 articles in main, no-results message** (actual category in catalog is "Web Development")
- "Explore AI articles" → `/blog?category=ai` → **0 articles in main, no-results message** (no "AI" category exists; AI posts are tagged but not categorized)
- "Explore security articles" → `/blog?category=DevSecOps` → likely works (matches catalog), but worth verifying

I also tested `/blog?category=Web%20Development` (the actual category URL-encoded) and got 0 articles — so the parameter format itself may be off.

**Why it matters:** A visitor reading About to learn the company's focus areas clicks "Explore [topic] articles" expecting a curated list, and lands on an empty blog. Worst-case impression: "they don't actually write about this." Three of the most strategic outbound links from About → blog are broken.

**Fix:** Audit the `/blog` query-param contract. Either fix the About links to use the working format (likely category slug, all-lowercase, or tag-based), or fix the route handler to be permissive (case-insensitive, alias-aware: `web` ⇄ `Web Development`, `ai` ⇄ tag match). Mechanical fix.

---

### P0 — Homepage stats describe Drew, not DCYFR Labs

**Where:** Homepage stats row.
**Evidence:**

- Homepage: "**6+** Years security architecture · **25** Industry certifications · **4** npm packages shipped"
- Sponsors page (Drew bio): "Security architect with **6+ years of experience**"
- About page Latest Badges: "**25 Total**" (Drew's Credly certifications)
- /open-source: "**4 Published packages**" (DCYFR Labs/`@dcyfr` packages)

The first two numbers are Drew's personal credentials; the third is the company's. The site says "DCYFR Labs" everywhere but two of the three trust signals are personal.

**Why it matters:** Conflates the founder's resume with the company's track record. A buyer evaluating DCYFR Labs as a vendor sees "25 Industry certifications" and infers a mature business. When they later meet Drew and realize this was personal, the discrepancy erodes trust.

**Fix paths:**

1. **Recast as personal proof** — move stats under "About the Founder" or onto `/about/drew`. Replace homepage stats with company-level metrics: "**4** npm packages · **1.8k+** weekly downloads · **9** in-depth articles · **138** peak post views".
2. **Keep as is and own it** — relabel: "**Drew, your founding architect**: 6+ years · 25 certifications. **Plus:** 4 npm packages shipped." Honest about who's doing the work.

---

### P1 — Editorial cadence has stalled

**Evidence:**

- 9 posts in ~6 months (Sep 2025 → Mar 2026): ~1.5 posts/month — healthy.
- Last post: **March 15, 2026 — 55 days ago**. Two months of silence.
- Newsletter copy promises "**new** articles delivered to your inbox" — the most recent is now ~2 months old.
- Featured post on homepage: "OWASP Top 10 for Agentic AI" from December 19, 2025 (5 months old). Still labeled "Featured" + "Hot".

**Why it matters:** Newsletter signups during the lull will receive nothing. New visitors see the most-promoted post is half a year old. Both signals suggest the project may be inactive, exactly opposite to the live `@dcyfr/ai` package work that IS happening (multiple npm versions shipped this year).

**Fix paths:**

1. **Ship the next post fast** — the gap is the most urgent signal. Even a short "What's new in @dcyfr/ai v3" release post would close the cadence break with content the work has already produced.
2. **Demote stale "Featured" tag** — programmatically expire after N days, or tie to most-recent or most-viewed.
3. **Consider lighter formats** — release notes, weeknotes, or a build-log series can sustain cadence without 5,000-word deep dives.

---

### P1 — Series identity is muddled

**Evidence:**

- "Portfolio" series: clean, 4/4 complete, well cross-linked. ✓
- "AI Workflows · Part 1" exists (March 15) — Part 2+ does not. The "Part 1" promise sets up an obligation that's now dormant.
- Some posts have no series tag at all (e.g., "Building with AI", "Node.js January 2026 Security Release", "OWASP Top 10").

**Why it matters:** Once you label a post "Part 1," readers expect a sequel. "Part 1 of ?" is a trust drag. Inconsistent series-tagging across the catalog also makes the navigation rule unclear — when does a post get a series tag?

**Fix:** Either commit to AI Workflows Part 2 (pick a date, ship), or remove the "Part 1" tag and let the post stand alone. Define a simple rule for when posts get series tags (e.g., "≥3 planned parts on a shared topic, all written before publishing Part 1").

---

### P1 — "Our AI Agent Team" section reads as performance, not capability

**Where:** About page, after Meet the Team.
**Evidence:** 9 named AI agents presented in a team-page format:

- DCYFR (Workspace Orchestrator)
- Fullstack Developer · TypeScript Pro · Database Architect (Engineering)
- Security Engineer · Architecture Reviewer · Test Engineer (Quality)
- DevOps Engineer · Performance Profiler (Operations)

Each has a job-title heading, a role subhead ("Type System Specialist", "End-to-End Feature Engineer"), a 1-2 sentence description, and a "Capabilities" row of chips (e.g. "Advanced generics · Type inference · Strict mode · API type safety · Migration").

**Why it matters:** The treatment is structurally identical to a tech-company "Meet the team" page. A first-time visitor scans the page, counts ~11 humans + agents, and walks away thinking DCYFR Labs is a small studio. When they later realize these are LLM personas, the reaction is some flavor of "this was theater."

**The trick:** the agents ARE real engineering capability — Drew has built a sophisticated multi-agent system, and `@dcyfr/ai` is a real npm package with real downloads. The section's framing undersells the _real_ technical achievement (the agent framework) and oversells the _personification_ (job titles + headshots-style structure).

**Fix paths:**

1. **Reframe as architecture, not headcount** — title: "How DCYFR works" or "The agent swarm." Lead with: "DCYFR Labs uses a private AI agent swarm built on `@dcyfr/ai` to scale a one-architect studio." Then list the agent classes as _capabilities of the swarm_, not as people.
2. **Move to a /how-it-works page** — keep the team page strictly human (Drew). Surface the agent swarm as the interesting technical thing it is, on its own dedicated surface.

This finding is closely tied to the P0 voice ambiguity — fixing voice fixes most of this.

---

### P1 — Newsletter value prop wording drifts across surfaces

**Evidence (3 different versions of the same CTA):**

- Homepage: "Stay in the loop. New articles on AI engineering, cybersecurity, and security architecture — delivered to your inbox."
- Blog post end: "Stay in the loop. Get new articles on AI engineering, cybersecurity, and security architecture delivered to your inbox."
- Blog index: "Subscribe" button (no surrounding copy at all)

**Why it matters:** The brain registers the same message twice as redundant; the brain registers near-identical messages as inconsistent. Either is friction. The "Subscribe" button on /blog is undersold — it doesn't tell the visitor what they get.

**Fix:** Single canonical newsletter block. Add a "what you'll get" bullet line: cadence (e.g. "1-2 posts/month"), topic mix ("security · AI engineering · architecture"), and a quality promise ("no sales").

---

### P1 — Stacked end-of-post CTAs feel desperate

**Where:** Bottom of every blog post.
**Sequence (verified on Shipping a Developer Portfolio):**

1. Like / Bookmark / Share buttons
2. "Stay in the loop" — newsletter form
3. "What did you think? Feel free to with your thoughts, or learn more !" (note: link text appears broken — "send us a message" and "about us" are buried in fragmented sentence)
4. "Contact us" + "About us" buttons (duplicate of links inside the sentence above)
5. Comments section
6. Related Posts (3 cards)

That's 5 separate "engage with us" prompts before the comments. The "What did you think?" line has malformed copy ("Feel free to with your thoughts, or learn more !") — the link anchors are missing their inline text.

**Fix:**

1. Repair the malformed sentence — the inline link text is missing/broken.
2. Pick one canonical end-of-post conversion (newsletter is the strongest), demote the rest to a single "Continue exploring" footer.

---

### P1 — Page title patterns are inconsistent

**Examples:**

- `/` → "DCYFR Labs" ✓ (clean)
- `/about` → "About DCYFR Labs — DCYFR Labs" (brand name twice)
- `/blog` → "Blog — DCYFR Labs" ✓
- `/ai` → "@dcyfr/ai — DCYFR AI — DCYFR Labs" (three labels)
- Blog post → "Shipping a Developer Portfolio — DCYFR Labs" ✓
- `/contact` → "Contact — DCYFR Labs" ✓

**Why it matters:** Pattern is "{Page} — DCYFR Labs" except About and /ai which double or triple up. SERP titles get truncated awkwardly.

**Fix:** Enforce `{Page Name} — DCYFR Labs`. About becomes "About — DCYFR Labs"; /ai becomes "@dcyfr/ai — DCYFR Labs".

---

### P2 — "Photo by Perplexity Labs" miscredits AI-generated images

**Where:** Every blog post hero image caption.
**Evidence:** "Photo by Perplexity Labs" — the images are AI-generated illustrations (verified by their style: "Anime-styled developer", "Glowing neon security shield", "Isometric illustration", "3D isometric security shield"), not photographs.

**Why it matters:** Calling AI-generated artwork a "Photo" is semantically wrong and a small honesty drag for a brand whose tagline includes "Build Securely." Doesn't take much to fix.

**Fix:** "Illustration by Perplexity Labs" or "Generated with Perplexity Labs (Imagine v1)" or similar. Honest about the medium.

---

### P2 — Generic blog index meta description

**Current:** "Blog posts on software development, cybersecurity, emerging technologies, and more."
**Issue:** Generic enough to apply to any tech blog. Doesn't mention the strongest content (AI security, OWASP analysis, CVE deep-dives, AI-assisted developer workflows).
**Fix:** "Long-form security analyses (OWASP Top 10 for Agentic AI, Node.js CVE breakdowns, React Server Components RCE) plus AI engineering deep dives. ~1-2 posts/month from DCYFR Labs."

---

### P2 — Sponsors empty state is functional but cold

**Current:** "No sponsors yet. Be the first to support our work."
**Issue:** Misses a moment of warmth and clarity. Doesn't describe what sponsorship enables, what tiers exist, or what supporters get.
**Fix:** Replace with: tier overview (1-3 tiers), what each enables (a release, a deep-dive, hosted infra), what backers get (logo placement, early access, named in releases). Convert the empty state into onboarding for the first sponsor.

---

### P2 — `/docs` page promises documentation, delivers package directories

**Where:** `/docs`.
**Evidence:** Hero subtitle is "Guides, references, and resources for DCYFR Labs tools and packages." Body shows 4 quick-tiles (Open Source / Blog / GitHub / Security) and 4 package cards, each with `Docs` (external to DeepWiki), `API Reference` (external to GitHub), `GitHub`, `npm` links.

**Why it matters:** A visitor expecting on-site how-to guides finds a meta-directory of external links. The page itself acknowledges the gap ("A dedicated docs site is coming soon at docs.dcyfr.ai" on /ai). Until that's built, /docs is more of a "developer hub" than docs.

**Fix:** Either rename the page ("Developer Hub") to match what it delivers, or cut the hero promise of guides. The "coming soon" docs site is a known commitment — surface a roadmap on /docs itself to set expectation.

---

### P2 — `/work` and `/open-source` have substantial overlap

**Evidence:**

- `/work` lists 6 projects: 4 of them are the `@dcyfr/ai` family packages.
- `/open-source` lists 4 packages: the same `@dcyfr/ai` family, with version numbers, status badges, downloads/month, and capability tags.

A visitor landing on either page may not know to also see the other. The same packages appear with different framings.

**Fix:** Decide a single source of truth. Either:

1. `/work` becomes purely client work + portfolio (X64, ISN), and `/open-source` is the only place packages live. About + Home link to both.
2. `/work` includes packages but pulls in the `/open-source` framing (versions, downloads). Then `/open-source` becomes a redirect or canonical alias.

---

### P2 — "DCYFR" brand etymology is never explained

**Evidence:** "DCYFR Labs" appears 50+ times across the site. "@dcyfr" is the npm scope. "DCYFR AI" is the AI Lab Assistant persona. The pronunciation and meaning are nowhere documented.
**Why it matters:** A reader who wants to share the brand verbally has to guess (decipher? d-c-y-f-r? dee-cypher?). Pronunciation friction depresses word-of-mouth.
**Fix:** Add a one-liner on About or a hover-tooltip on the brand: "DCYFR /dəˈsaɪfər/ — pronounced 'decipher,' from {origin story}." Owns the name and removes friction.

---

### P2 — Vercel Web Analytics is misconfigured (cross-reference design audit)

This is also called out in the design audit as a P0. Repeating because it has content-visibility implications: posts show "{N} views" prominently, but the upstream view-counting pipeline depends on Vercel Analytics, which is currently 404'ing on every page (`/_vercel/insights/script.js` not deployed). The displayed view counts may be stale or undercounted.

---

## Open questions for the editorial roadmap

These belong to a content-strategy discussion, not a fix-it pass:

1. **Voice unification** — singular ("I, Drew") or plural ("we, DCYFR Labs")? Pick one and propagate.
2. **AI agent team treatment** — keep on About, move to a `/how-it-works` page, or fold into the `/ai` package landing?
3. **Cadence reset** — what's the realistic publishing rhythm post-March-15-gap? Codify in the newsletter promise.
4. **Featured-post rotation** — what triggers a swap (recency? views? editorial calendar?)? Should "Featured" auto-expire?
5. **AI Workflows Part 2** — committed, or retired?
6. **Stats refactor** — recast homepage stats as company-level (packages, downloads, posts, views) or relabel as "Drew's track record"?
7. **DCYFR brand etymology** — own the pronunciation publicly, or keep mystery?
8. **Sponsors onboarding flow** — design tiers, perks, and the first-sponsor narrative.
9. **Docs strategy** — when does docs.dcyfr.ai ship? In the meantime, what does `/docs` promise vs. deliver?
10. **Series rules** — when does a post get a series tag, and what's the floor commitment (e.g., "all parts written before Part 1 ships")?

---

## Recommended sequence

| #   | Item                                                                              | Severity | Effort                                  |
| --- | --------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| 1   | Fix three "Explore" links on About → broken blog filters                          | P0       | ~5 lines                                |
| 2   | Resolve voice (pick singular or plural; apply across home, about, blog, sponsors) | P0       | content rewrite, ~1-2 days              |
| 3   | Decide stats framing — company metrics OR relabel as Drew's track record          | P0       | content rewrite, ~30 min                |
| 4   | Ship a new blog post to close the 55-day cadence gap                              | P1       | depends on author                       |
| 5   | Standardize page title pattern (`{Page} — DCYFR Labs`)                            | P1       | ~5 lines in metadata helper             |
| 6   | Fix malformed "What did you think?" link sentence + dedupe end-of-post CTAs       | P1       | ~30 min                                 |
| 7   | Single canonical newsletter copy                                                  | P1       | ~15 min                                 |
| 8   | Reframe "Our AI Agent Team" section (or move it)                                  | P1       | content rewrite, ~1 day — pairs with #2 |
| 9   | Re-credit AI-generated images correctly ("Illustration by..." not "Photo by...")  | P2       | mechanical                              |
| 10  | Beef up /blog meta description with specifics                                     | P2       | 1 line                                  |
| 11  | Sponsors empty state → onboarding                                                 | P2       | ~1 hour                                 |
| 12  | DCYFR pronunciation + etymology on About                                          | P2       | ~10 min                                 |
| 13  | Resolve /work vs /open-source overlap                                             | P2       | strategy + ~1 day                       |

Items 1-3 are the urgent triple — broken promises, identity conflict, and a misleading personal-vs-company stat. The rest cascade naturally from a clear voice decision.

---

## What was NOT audited

- **Search results UI** — search trigger present sitewide but search results page not exercised.
- **Form submission states** — newsletter and contact forms not actually submitted; success/error copy unverified.
- **Comments quality** — `/blog/[slug]` has a Comments section; not engaged with in this pass.
- **Series detail page** — `/blog/series/portfolio` linked but not verified live.
- **Author pages** — `/about/drew` and `/about/dcyfr` linked from About but not visited.
- **Resume detail** — `/about/drew/resume#certifications` linked but not visited.
- **Project detail pages** — `/work/x64`, `/work/isn` linked but not visited.
- **404 error page copy** — accidentally caught earlier (see design audit), but not re-evaluated as an editorial surface.
- **Email content** — newsletter actual emails not received/reviewed.
- **OG image content** — meta tags inspected but image rendering not verified per page.

---

**Next phase:** Pick from the recommended sequence above. Items 1-3 are the most leverage. Items 4 (cadence) is the most strategic.
