# Production Design Audit — dcyfr.ai

**Date:** 2026-05-09
**Auditor:** Drew + Claude (live inspection)
**Production URL:** https://www.dcyfr.ai/
**Build:** v2026.05.09 (commit `e654ef8`)

---

## Methodology

Live inspection of the production site at three breakpoints (1440 desktop, 768 tablet, 375 mobile) across seven public surfaces:

| Surface    | URL                             | Notes                                                                                              |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Home       | `/`                             | Hero + 4-pillar grid + featured post + recent posts + DCYFR AI promo + newsletter + topic taxonomy |
| Blog index | `/blog`                         | Faceted: Authors, Sort, Categories, Topics; 3 view modes                                           |
| Blog post  | `/blog/owasp-top-10-agentic-ai` | Sticky left sidebar (byline, post meta, tags, share, related, TOC)                                 |
| Work       | `/work`                         | 6-project grid, "6 projects · 16 technologies"                                                     |
| About      | `/about`                        | Single-column prose                                                                                |
| Contact    | `/contact`                      | 4 service cards + contact form                                                                     |
| DCYFR AI   | `/ai`                           | Package landing: `@dcyfr/ai`, install, links, badges, "What's included" grid                       |

Inspection captured: computed styles, design tokens, heading hierarchy, contrast (WCAG AA + AAA programmatic check, 65 samples), alt text, button/link labels, form label coverage, landmarks, skip link, focus-visible coverage, prefers-reduced-motion respect, console errors, and resource performance.

Tools: Claude in Chrome MCP (Chromium, headless desktop session).

---

## Headline numbers

| Metric                         | Value                                         | Verdict                               |
| ------------------------------ | --------------------------------------------- | ------------------------------------- |
| TTFB                           | 31ms                                          | Excellent                             |
| DOMContentLoaded               | 423ms                                         | Excellent                             |
| Load                           | 556ms                                         | Excellent                             |
| DOM size                       | 206 KB                                        | Healthy for a Next.js App Router site |
| Resources >50 KB               | 0                                             | Lean — single-image homepage          |
| Console errors                 | 1 (Vercel Web Analytics)                      | One config bug                        |
| Contrast samples               | 65/65 pass AAA                                | Clean                                 |
| Images missing alt             | 0/1                                           | Clean                                 |
| Buttons/links without label    | 0                                             | Clean                                 |
| Inputs without label           | 0 (placeholder-backed)                        | Acceptable; see P1                    |
| `prefers-reduced-motion` rules | 3                                             | Good — animations gated               |
| Skip link present              | Yes (`.sr-only focus:not-sr-only`)            | Good                                  |
| Landmarks                      | `main`, `header`, `nav`, `footer` all present | Clean                                 |

---

## System primitives

### Typography

| Role                | Family                                                    | Notes                                                    |
| ------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Body                | `ui-sans-serif, system-ui, sans-serif`                    | System stack — fast, no FOFT                             |
| Display             | **Alegreya**, 600 weight                                  | Serif; sets editorial tone for headings + brand wordmark |
| Mono                | Geist Mono (loaded as CSS var, applied to terminals/code) |                                                          |
| Sans                | Geist Sans (loaded as CSS var)                            | Loaded but not applied to body — apparent legacy         |
| Display sizes       | `clamp(2.25rem, 4.5vw + 1rem, 3rem)` for hero wordmark    | Fluid type — good                                        |
| Body                | 16px                                                      |                                                          |
| H1 (interior pages) | 36px                                                      |                                                          |
| H2 (section)        | 24-36px                                                   |                                                          |
| Reading width       | `max-w-5xl` (~1024px) on prose                            | Comfortable                                              |
| Line height         | 1.5 body, 1 hero (leading-none)                           |                                                          |

### Color & theme

- **Single dark theme.** `<html class="view-transitions-supported dark">` — no light-mode toggle observed in production navigation. The icon in the top-right header may be a theme switcher, but it's unlabeled (see P1.3).
- **600+ CSS custom properties** — substantial token system (full Tailwind v4 OKLCH palette + semantic aliases like `--sidebar-primary-foreground`, `--syntax-function`, `--highlight-background-color--normal`).
- **Foreground:** ~`lab(98 0 0)` (near-white). **Background:** ~`lab(1.76 0 0)` (near-black). Contrast at body text ≈ 19:1 (well above AAA's 7:1).
- **Border tokens** at low alpha: `--border: lab(100% 0 0/.1)` (10% white) — gives the airy outlined-card look but means card borders are nearly invisible at distance.
- **Accents** noted in screenshots: yellow (highlight), green (badges like "New"), gradient hero illustrations (purple→blue→cyan).

### Spacing & rhythm

- **Hero pattern**: `pt-28 md:pt-32 lg:pt-36` (112/128/144px top), `pb-8 md:pb-12` (32/48px bottom). Consistent across pages.
- **Section gaps**: `space-y-8 md:space-y-10 lg:space-y-14` between vertical sections.
- **Container**: `max-w-5xl px-4 sm:px-6 md:px-8` for content, narrower variants for prose.
- **Card grid**: 4-up at desktop, 2-up at tablet, 1-up at mobile, with sensible reflow.

### Components observed

- **Header**: logo · centered nav (Blog, Work, DCYFR AI, About, Contact) · search trigger · theme/screen icon. Clean. Mobile collapses to hamburger + tab bar.
- **Mobile tab bar**: bottom-fixed (Home, Blog, Work, DCYFR AI, Contact). Native-app feel. Strong.
- **Buttons**: 2 variants — solid outline pill ("Read our blog"), ghost pill (icon-led links).
- **Cards**: 1px border, `--radius` rounded, dark fill, icon-led header, optional badge row. Consistent across home/blog/work/ai.
- **Chips/Badges**: pill-shaped, multiple semantic colors (Hot/red, New/green, neutral grey for tags).
- **Code blocks**: terminal-styled with `$` prompt, copy button. Strong.
- **Stats**: large number + small label, dot-separated meta lines.
- **Article TOC**: search input ("Search headings…") + scroll-spy active highlight. Excellent.

---

## Findings

Severity scale: **P0** = broken or broken-feeling; **P1** = refinement opportunity with measurable impact; **P2** = polish / system hygiene.

---

### P0 — Hero fade-in creates flash of low-contrast content

**Where:** Homepage `/`, About `/about`, Contact `/contact`, Work `/work`, DCYFR AI `/ai`.
**What:** The hero container uses `opacity-0 translate-y-2 animate-fade-in-up`. On first paint the hero is invisible/faded, then animates in. Caught in the very first screenshot before the animation completed — heading + tagline + CTAs were ghost-text against the dark background.
**Why it matters:**

- Erodes first impression — for the first ~600-1200ms, the page reads as half-loaded.
- Real risk to Largest Contentful Paint and Cumulative Layout Shift Lighthouse scores (the hero is LCP candidate on most pages).
- Users on `prefers-reduced-motion: reduce` get protected by 3 existing media queries — verify this hero animation is gated by one of them.

**Fix paths (cheapest first):**

1. Set the hero's at-rest state to `opacity-1` and animate only `translate-y` (or no animation) — content paints solid immediately, motion is bonus, not gating.
2. Reduce `animation-duration` from current (likely 600-800ms) to ~250ms with an `animation-delay` of 0.
3. Confirm the existing `prefers-reduced-motion` media queries cover `.animate-fade-in-up` and skip the opacity transition entirely.

---

### P0 — Vercel Web Analytics script 404s on every page

**Where:** All pages, observable in browser console.
**What:** `[Vercel Web Analytics] Failed to load script from /_vercel/insights/script.js. Be sure to enable Web Analytics for your project and deploy again.`
**Why it matters:** Analytics data is silently missing in production. The `analytics-integration.ts` upstream of milestone tracking depends on Vercel Analytics (`fetchVercelAnalyticsMilestones`) — those milestones never populate, and the activity feed reads `[]` from Redis as a result.
**Fix:** Enable Web Analytics in the Vercel project dashboard, redeploy. (One-click; no code change.)

---

### P0 — Homepage `<h1>` is sr-only; visible "DCYFR Labs" wordmark is a `<span>`

**Where:** `/` only. Other pages (`/ai`, `/about`, `/blog`, `/work`, `/contact`, blog post) use a real visible `<h1>`.
**What (verified via DOM):**

- `<h1>` exists at `1×1px`, `font-size: 16px`, `font-weight: 400`, with class `sr-only` semantics — text "DCYFR Labs".
- Visible 48px Alegreya 600 wordmark at the same position is a `<span class="text-[clamp(2.25rem,4.5vw+1rem,3rem)] font-serif font-semibold leading-none">` — semantically nothing.

**Why it matters:**

- **SEO**: search engines weight visible H1 heavily. A 16px sr-only h1 plus an unmarked-up display span is a weaker signal than a single visible H1. Bing/Google may pick the span as the title regardless, but the strategy is fragile.
- **Consistency**: every other page does this differently (real visible H1). The home page's pattern is an outlier.
- **A11y**: screen readers do see the sr-only h1, so the page IS labeled — but the semantics-vs-visuals split is unusual and worth deliberate.

**Fix:** Promote the visible "DCYFR Labs" wordmark to a real `<h1>`, drop the sr-only one. Apply the existing display class. Net result: same visual, cleaner semantics.

---

### P1 — About + Contact heroes feel half-empty for short copy

**Where:** `/about`, `/contact` (less so `/work`, `/ai` which have richer hero blocks).
**What:** Hero section is fixed at `pt-36 pb-12` (≈ 192px vertical breathing room) with content area sized for 2-3 lines of subtitle. About has 1 sentence; Contact has 1.5 sentences. The result is a tall hero with a small content bubble — visually reads as "did the page load completely?"
**Fix paths:**

1. **Content phase**: extend hero copy to 2-3 lines on About + Contact (preferred — copy is the easier lever).
2. **Design**: introduce a hero variant with smaller padding (`pt-20 pb-8`) for single-line subtitles; pick variant via prop or page layout.

---

### P1 — Heading hierarchy: card titles use `<h2>`, blurring the outline

**Where:** Homepage `/` — the four pillar cards (DCYFR AI, Blog, Work, Open Source) are each `<h2>` at 24px/500. The section heading "From the blog" is also `<h2>` at 24px/500.
**Why it matters:** Outline (h1 → h2 sections → h3 cards) is a useful screen-reader navigation pattern. Today's outline conflates section labels with within-section card titles.
**Fix:** Demote pillar-card titles and recent-posts row titles to `<h3>`. Net visual: zero change. Net semantic: cleaner outline.

---

### P1 — Only 1/7 `<section>` elements has an `aria-label` / `aria-labelledby`

**Where:** Homepage.
**What:** Sections without programmatic names show up as just "section" in the screen-reader rotor; users can't jump by name.
**Fix:** Add `aria-labelledby` pointing at each section's visible heading id (e.g. `<section aria-labelledby="from-the-blog"><h2 id="from-the-blog">From the blog</h2>…</section>`). Mechanical, no visual change.

---

### P1 — Header utility icons are unlabeled

**Where:** Header right-edge — search-trigger ("/" hint nearby) and a screen/monitor icon.
**What:** Both render as bare icons. The search trigger has an aria-label (verified via the contrast scan flagging "Search (/)"), but the screen icon's purpose is ambiguous from inspection — could be a theme switcher, fullscreen toggle, or layout switcher.
**Fix:** Confirm the screen icon's function and add an aria-label that matches. If it's a theme toggle and the site is dark-only by design, consider removing it.

---

### P1 — Outline-none used 7 times across stylesheets

**Where:** 7 CSS rules in production output strip `outline`. Most of these are likely paired with `focus-visible` replacements (the audit confirmed `focus-visible` styles are present in 542 rule-scans).
**Why it matters:** A single missed pairing creates an invisible focus state on a control that's tab-reachable.
**Fix:** Tab-walk every interactive control on every public route at least once with the keyboard, confirm a visible ring on each. The existing `eslint-local-rules/` directory could grow a rule that bans `outline: none` without an adjacent `focus-visible:` selector.

---

### P1 — Newsletter / contact form success+error UX not surfaced inline

**Where:** Homepage newsletter ("Stay in the loop"), Contact form below the service cards.
**What:** Form labels are correct (`name="…"` paired with placeholder, no label-association issues observed). What I couldn't verify in this pass is the post-submit state (toast? inline status? page route?).
**Fix:** Manual test with a valid + invalid submission, document in [docs/components/forms.md](docs/components/forms.md). If the success state is a toast, ensure it's announced via `role="status"` / `aria-live="polite"`.

---

### P2 — DCYFR AI homepage card under-sells the package

**Where:** Homepage 4-pillar grid → DCYFR AI card.
**What:** Card teases generically ("Portable multi-provider agent with telemetry, quality gates, and a plugin marketplace"). The actual `/ai` landing surfaces real credibility — `npm v3.0.2`, `1.8k/month downloads`, `TypeScript Strict` — none of which are visible until you click through.
**Fix (content phase):** Bring at least one credibility metric (downloads or version) onto the homepage card.

---

### P2 — Stats row vanity numbers are unlinked

**Where:** Homepage stats row — `6+ Years security architecture`, `25 Industry certifications`, `4 npm packages shipped`.
**What:** They're static visual proof. Each one is a click-worthy interaction:

- `6+` → `/about` (career timeline)
- `25` → some certifications surface (does this exist?)
- `4` → `/work` filtered to Code, or `/ai` family
  **Fix (content phase):** Wire the numbers to their natural deeper pages. Adds engagement without redesign.

---

### P2 — "Browse by topic" taxonomy in footer reads dense

**Where:** Homepage footer section, just above site footer.
**What:** 21 chips (Next.js 6, TypeScript 4, React 3, Security 3, AI 2, MCP 2, CVE 2, GitHub Copilot 1, Developer Productivity 1, Workflow 1, Content Strategy 1, UX 1, Component Architecture 1, Node.js 1, HTTP/2 1, AsyncLocalStorage 1, Inngest 1, Event-Driven 1, Background Jobs 1, AI Security 1).
**Why it matters:** Long tail of single-article topics dilutes the signal that DCYFR Labs is "about" something specific. Skews toward looking like a tech-grab-bag.
**Fix (content phase, not design):** Editorial decision on whether to (a) hide topics with `count == 1`, (b) consolidate into 5-7 pillar topics, or (c) accept density as-is.

---

### P2 — Footer lacks visual separation from last content section

**Where:** All pages.
**What:** Footer (`© 2026 DCYFR Labs · About · DCYFR AI · Docs · Open Source · Contact · Sponsors · Privacy · Terms`) sits flush against the last content section with only padding-top. No top border, no background-color shift.
**Fix:** Apply `border-top` using the existing `--border` token, or shift footer background a notch (`bg-card` if it isn't already). Pure CSS, ~5 lines.

---

### P2 — Mobile tab bar partially overlaps last-row content on short pages

**Where:** Mobile homepage at `375×800`, looking at the bottom of the 4-pillar grid.
**What:** The fixed bottom tab bar sits over the "Open Source" card's last line ("npm packages for AI agents…").
**Fix:** Add bottom padding to `<main>` equal to tab-bar height on mobile, or a `pb-safe-bottom` utility. Likely a one-line change.

---

## Strengths worth keeping

These are working — call them out so they aren't accidentally regressed:

- **The Alegreya display + system body pairing** sets DCYFR apart from generic dev-tools sites. Stays.
- **Mobile tab bar** for primary nav is unusually good and feels native.
- **Sticky article sidebar** (post meta, share, related posts, TOC with search + scroll-spy) is best-in-class for a security blog. Match this in any future article template iterations.
- **Faceted blog filtering** (Authors, Sort, Categories, Topics, layout switcher) is a content-discovery superpower if the catalog grows past ~20 articles.
- **Code block + copy button** + `npm install @dcyfr/ai` terminal styling — strong signal that the audience is engineers.
- **Performance** (sub-1s load, 0 oversized resources) is a moat.

---

## Open questions for the content phase

The audit surfaces design-side findings. The following are **content / editorial decisions** that should be answered before or during the content focus pass:

1. **Hero copy on `/about`** — is one sentence the deliberate brand voice, or should this expand to 2-3 lines?
2. **Hero copy on `/contact`** — same question.
3. **Stats row freshness** — are `6+`, `25`, `4` still accurate? What's the cadence for updating them? Should each link to its supporting page?
4. **Featured post slot** — is "OWASP Top 10 for Agentic AI" a permanent lead, or should it rotate (manually? algorithmically by views?)?
5. **DCYFR AI homepage card** — should the card surface the live npm download count? (Available via the same data path the `/ai` page uses.)
6. **Topic taxonomy density** — 39 topics for 9 articles. Editorial call: prune to pillars or keep the long tail.
7. **Newsletter strategy** — two surfaces (homepage inline form, blog index Subscribe button). Single canonical CTA, or different intents per surface?
8. **Theme toggle** — keep dark-only and remove the unlabeled icon, or build the light theme out?
9. **Mobile tab bar contents** — is "DCYFR AI" the right slot vs. "About" or "Activity"?

---

## Recommended sequence

If picking these off, suggested order (impact ÷ effort):

| #   | Item                                                                           | Severity | Effort            |
| --- | ------------------------------------------------------------------------------ | -------- | ----------------- |
| 1   | Enable Vercel Web Analytics in dashboard                                       | P0       | 1 click           |
| 2   | Promote homepage `<span>DCYFR Labs</span>` to real `<h1>`                      | P0       | 1 line            |
| 3   | Fix hero fade-in to start at `opacity-1` (or gate behind reduced-motion check) | P0       | ~5 lines          |
| 4   | Demote homepage card titles `h2` → `h3`                                        | P1       | mechanical        |
| 5   | Add `aria-labelledby` to homepage `<section>` elements                         | P1       | mechanical        |
| 6   | Label header utility icons (or remove the dark-mode-only theme toggle)         | P1       | 1 line + decision |
| 7   | Tab-walk every public surface for missing focus rings                          | P1       | 30 min            |
| 8   | Add footer `border-top` using `--border`                                       | P2       | 1 line            |
| 9   | Add mobile bottom-safe padding to `<main>`                                     | P2       | 1 line            |
| 10  | Wire homepage stats numbers to deeper pages                                    | P2       | content phase     |
| 11  | About + Contact hero copy expansion                                            | P2       | content phase     |

Items 1-3 close every P0 in under 30 minutes of work. Items 10-11 belong to the content phase and are not blockers.

---

## Appendix — what was NOT audited

This pass deliberately skipped the following — flag them if they're priorities:

- **Light theme** — the codebase has tokens for it (`.dark` class scopes), but the inspected production renders only dark. No light-theme rendering verified.
- **Search functionality** — search trigger present, but the search results UI itself was not exercised.
- **Form submissions** — newsletter and contact forms were not submitted; success/error states unverified.
- **Authenticated views** — none observed in nav. If they exist behind a route, not in scope.
- **Print styles** — `docs/design/print/` exists in source, but no `@media print` audit performed.
- **Sponsor surfaces** — `Sponsors` link in footer was not followed.
- **Activity feed** — referenced internally but not surfaced in nav. Status not verified.
- **Lighthouse / Web Vitals lab data** — used only navigation timing API. A real Lighthouse run is a sensible next step.
- **axe-core full sweep** — programmatic checks ran a focused subset (contrast, alt, labels, landmarks, focus-visible presence). A full axe pass would catch additional issues.

---

**Next phase:** Content focus pass (separately scoped). The "Open questions for the content phase" section above is the ready-to-go input.
