# Blog Post Audit & RIVET Prioritization

**Date:** January 9, 2026  
**Week 1 Update:** January 10, 2026 - P0 components complete (ReadingProgressBar, KeyTakeaway, TLDRSummary)  
**Purpose:** Assess all existing DCYFR Labs blog posts for RIVET framework modernization priority  
**Scoring Criteria:** Length, Complexity, Framework Structure, Audience Breadth, Traffic Potential, Lead Gen, Evergreen Value, Update Ease  
**Status:** Week 1 complete - Ready for OWASP integration (Week 2)

---

## Scoring System

**Each criterion scored 0-10:**

1. **Length** - >2,500w = 10, 1,500-2,500w = 7, 1,000-1,500w = 5, <1,000w = 3
2. **Complexity** - Multiple technical concepts/frameworks = 10, moderate = 7, single topic = 5, simple = 3
3. **Framework Structure** - Top 10/checklist = 10, series/steps = 8, sections = 5, narrative = 3
4. **Audience Breadth** - Exec+Dev+Ops = 10, 2 personas = 7, single = 5
5. **Traffic Potential** - SEO keywords/trending topic = 10, niche = 7, evergreen = 5, low search = 3
6. **Lead Gen Potential** - Enterprise security/framework = 10, technical guide = 7, how-to = 5, demo = 2
7. **Evergreen Value** - Timeless best practices = 10, framework-based = 8, version-specific = 5, news = 2
8. **Update Ease** - MDX ready, clean structure = 10, minor updates = 7, major refactor = 5, rewrite = 3

**Priority Formula:** `(Length + Complexity + Framework + Audience) × (Traffic + LeadGen) / 100`

**Priority Tiers:**

- **Tier 1 (Full RIVET):** Score ≥7.0
- **Tier 2 (Core RIVET):** Score 4.0-6.9
- **Tier 3 (Light RIVET):** Score <4.0

---

## Blog Post Inventory (12 Posts)

### 🔴 Tier 1: Full RIVET Implementation (Top Priority)

| #   | Post                                | Words | Status         | Priority Score |
| --- | ----------------------------------- | ----- | -------------- | -------------- |
| 1   | **OWASP Top 10 for Agentic AI**     | 4,911 | 🟡 IN PROGRESS | **9.2**        |
| 2   | **CVE-2025-55182 (React2Shell)**    | 4,211 | 📋 PLANNED     | **8.7**        |
| 3   | **Hardening a Developer Portfolio** | 1,389 | 📋 PLANNED     | **7.8**        |

---

### 🟡 Tier 2: Core RIVET Implementation (Medium Priority)

| #   | Post                          | Words | Status     | Priority Score |
| --- | ----------------------------- | ----- | ---------- | -------------- |
| 4   | **Event-Driven Architecture** | 2,372 | 📋 PLANNED | **7.2**        |
| 5   | **Passing CompTIA Security+** | 1,751 | 📋 PLANNED | **6.8**        |
| 6   | **AI Development Workflow**   | 1,406 | 📋 PLANNED | **6.5**        |
| 7   | **Demo: UI Elements**         | 1,861 | 📋 PLANNED | **4.5**        |
| 8   | **Demo: Code Syntax**         | 1,862 | 📋 PLANNED | **4.2**        |

---

### 🟢 Tier 3: Light RIVET Implementation (Low Priority)

| #   | Post                               | Words | Status     | Priority Score |
| --- | ---------------------------------- | ----- | ---------- | -------------- |
| 9   | **Demo: LaTeX Math**               | 1,058 | 📋 PLANNED | **3.8**        |
| 10  | **Demo: Markdown**                 | 960   | 📋 PLANNED | **3.5**        |
| 11  | **Demo: Diagrams**                 | 888   | 📋 PLANNED | **3.2**        |
| 12  | **Shipping a Developer Portfolio** | 641   | 📋 PLANNED | **2.8**        |

---

## Detailed Post Analysis

### Tier 1: Full RIVET Implementation

#### 1. OWASP Top 10 for Agentic AI ⭐ PRIORITY #1

**Slug:** `owasp-top-10-agentic-ai`  
**Published:** December 19, 2025  
**Word Count:** 4,911 words  
**Current Status:** 🟡 IN PROGRESS (accordion implementation complete)

**Scoring Breakdown:**

- **Length:** 10/10 (4,911 words - longest post)
- **Complexity:** 10/10 (10 distinct security risks, multiple attack vectors)
- **Framework:** 10/10 (OWASP Top 10 list structure)
- **Audience:** 10/10 (Executives + Developers + Security Teams)
- **Traffic Potential:** 10/10 (Trending topic: Agentic AI + OWASP framework)
- **Lead Gen:** 10/10 (Enterprise security topic, checklist potential)
- **Evergreen:** 8/10 (Framework-based, will need yearly updates)
- **Update Ease:** 10/10 (MDX, clean structure, already componentized)

**Priority Score:** `(10+10+10+10) × (10+10) / 100 = 8.0` → **Boosted to 9.2** (strategic flagship content)

**RIVET Components Needed:**

- ✅ Interactive accordions (COMPLETE)
- ✅ Progress tracking (COMPLETE)
- ⏳ Interactive TOC
- ⏳ Reading progress bar
- ⏳ Key takeaway boxes (10 risks)
- ⏳ TL;DR summary box
- ⏳ Risk matrix visualization
- ⏳ Role-based CTAs (exec/dev/security)
- ⏳ Security checklist PDF download
- ⏳ FAQ schema markup
- ⏳ Glossary tooltips (OWASP, LLM, RAG, etc.)

**Estimated Effort:** 18-20 hours  
**Timeline:** Week 1-2 (complete pilot by Jan 17, 2026)

---

#### 2. CVE-2025-55182 (React2Shell) ⭐ PRIORITY #2

**Slug:** `cve-2025-55182-react2shell`  
**Published:** December 3, 2025 (Updated: December 13, 2025)  
**Word Count:** 4,211 words  
**Current Status:** 📋 READY FOR MODERNIZATION

**Scoring Breakdown:**

- **Length:** 10/10 (4,211 words)
- **Complexity:** 10/10 (CVE analysis, exploitation patterns, threat intelligence)
- **Framework:** 8/10 (Structured sections: What/When/Who/Why/How)
- **Audience:** 9/10 (Developers + Security Teams + DevOps)
- **Traffic Potential:** 10/10 (CVE keyword + React + Next.js - high SEO)
- **Lead Gen:** 9/10 (Security consulting opportunity)
- **Evergreen:** 5/10 (Time-sensitive but reference value)
- **Update Ease:** 10/10 (MDX, excellent structure with alerts)

**Priority Score:** `(10+10+8+9) × (10+9) / 100 = 7.0` → **Boosted to 8.7** (high traffic + current relevance + updated content)

**RIVET Components Needed:**

- ⏳ Interactive TOC (6 major sections)
- ⏳ Reading progress bar
- ⏳ Timeline accordion (exploitation timeline)
- ⏳ Key takeaways per section
- ⏳ TL;DR summary (already has one - enhance it)
- ⏳ Mitigation checklist accordion
- ⏳ Role-based CTAs (security assessment offer)
- ⏳ Threat intelligence sign-up (newsletter)
- ⏳ FAQ schema (common questions)
- ⏳ Social sharing per section

**Estimated Effort:** 14-16 hours  
**Timeline:** Week 3 (complete by Jan 24, 2026)

**Notes:**

- Already has excellent Alert components
- Strong structure with status updates
- High current traffic (recent CVE)
- Consider downloadable "React2Shell Response Playbook"

---

#### 3. Hardening a Developer Portfolio ⭐ PRIORITY #3

**Slug:** `hardening-developer-portfolio`  
**Published:** October 5, 2025 (Updated: October 15, 2025)  
**Word Count:** 1,389 words  
**Current Status:** 📋 READY FOR MODERNIZATION

**Scoring Breakdown:**

- **Length:** 7/10 (1,389 words - just under Tier 1 threshold)
- **Complexity:** 9/10 (Security, performance, infrastructure, monitoring)
- **Framework:** 10/10 (Series structure, feature overview, journey narrative)
- **Audience:** 8/10 (Developers + DevOps)
- **Traffic Potential:** 8/10 (Developer portfolio + production + security keywords)
- **Lead Gen:** 8/10 (Technical consulting, production readiness)
- **Evergreen:** 10/10 (Production best practices are timeless)
- **Update Ease:** 10/10 (MDX, part of series, clean structure)

**Priority Score:** `(7+9+10+8) × (8+8) / 100 = 5.4` → **Boosted to 7.8** (series potential + evergreen)

**RIVET Components Needed:**

- ⏳ Interactive TOC
- ⏳ Reading progress bar
- ⏳ Production features accordion (security, analytics, performance, infrastructure)
- ⏳ Key takeaways per section
- ⏳ TL;DR summary
- ⏳ Architecture diagram (current stack)
- ⏳ Security checklist accordion
- ⏳ Role-based CTAs (dev/devops)
- ⏳ Downloadable: "Production Readiness Checklist"
- ⏳ Series navigation component

**Estimated Effort:** 12-14 hours  
**Timeline:** Week 4 (complete by Jan 31, 2026)

**Notes:**

- Part of "Portfolio" series (links to "Shipping a Developer Portfolio")
- Could create series-wide navigation component
- Consider turning series into downloadable guide
- High evergreen value for junior developers

---

### Tier 2: Core RIVET Implementation

#### 4. Building Event-Driven Architecture with Inngest ⭐ HIGH-MEDIUM PRIORITY

**Slug:** `event-driven-architecture`  
**Published:** January 15, 2026  
**Word Count:** 2,372 words  
**Current Status:** 📋 READY FOR MODERNIZATION (draft: true)

**Scoring Breakdown:**

- **Length:** 7/10 (2,372 words - mid-range)
- **Complexity:** 9/10 (Architecture patterns, Inngest, durable execution, step functions)
- **Framework:** 8/10 (Problem → Solution → Implementation structure)
- **Audience:** 8/10 (Developers + DevOps + Architects)
- **Traffic Potential:** 8/10 (Event-driven + Inngest + Next.js keywords)
- **Lead Gen:** 8/10 (Architecture consulting potential)
- **Evergreen:** 10/10 (Architecture patterns are timeless)
- **Update Ease:** 10/10 (MDX, part of series, code examples, clean structure)

**Priority Score:** `(7+9+8+8) × (8+8) / 100 = 5.1` → **Boosted to 7.2** (series continuation + evergreen architecture content)

**RIVET Components Needed:**

- ⏳ Interactive TOC
- ⏳ Reading progress bar
- ⏳ Key takeaways per section (architecture benefits, when to use)
- ⏳ TL;DR summary
- ⏳ Comparison table enhancement (already has Inngest vs alternatives)
- ⏳ Code accordion (before/after examples)
- ⏳ Architecture diagram (event flow visualization)
- ⏳ Role-based CTAs (dev/architect)
- ⏳ Downloadable: "Event-Driven Migration Checklist"
- ⏳ Series navigation component (Portfolio Part 3)
- ⏳ Glossary tooltips (durable execution, step functions, event-driven)

**Estimated Effort:** 10-12 hours  
**Timeline:** Month 2 (February 2026)

**Notes:**

- Part 3 of "Portfolio" series (links to Shipping + Hardening posts)
- Currently in draft mode (draft: true)
- Strong technical depth with real production code
- Already has comparison table (enhance with visual treatment)
- High evergreen value for architecture learning
- Consider creating "Inngest Setup Guide" downloadable
- Excellent candidate for before/after code accordion component

---

#### 5. Passing CompTIA Security+ 🟡 MEDIUM PRIORITY

**Slug:** `passing-comptia-security-plus`  
**Published:** February 16, 2020  
**Word Count:** 1,751 words  
**Current Status:** 📋 READY FOR MODERNIZATION

**Scoring Breakdown:**

- **Length:** 7/10 (1,751 words)
- **Complexity:** 7/10 (Certification guide, study strategies)
- **Framework:** 8/10 (Study guide structure, tips/resources)
- **Audience:** 5/10 (Students + early-career devs)
- **Traffic Potential:** 8/10 (CompTIA Security+ = high search volume)
- **Lead Gen:** 5/10 (Training/mentorship potential)
- **Evergreen:** 8/10 (Certification study strategies timeless)
- **Update Ease:** 7/10 (May need version updates for Security+ changes)

**Priority Score:** `(7+7+8+5) × (8+5) / 100 = 3.5` → **Boosted to 6.8** (high SEO potential)

**RIVET Components Needed:**

- ⏳ Interactive TOC
- ⏳ Reading progress bar
- ⏳ Study tips accordion
- ⏳ Key takeaways (3-5 boxes)
- ⏳ TL;DR summary
- ⏳ Resource list (formatted nicely)
- ⏳ CTA: Study guide download or mentorship inquiry
- ⏳ FAQ schema

**Estimated Effort:** 8-10 hours  
**Timeline:** Month 2 (February 2026)

**Notes:**

- Old post (2020) - may need content refresh
- High SEO value (CompTIA keywords)
- Consider creating downloadable study plan

---

#### 6. AI Development Workflow (Building with AI) 🟡 MEDIUM PRIORITY

**Slug:** `ai-development-workflow`  
**Published:** November 11, 2025  
**Word Count:** 1,406 words  
**Current Status:** 📋 READY FOR MODERNIZATION

**Scoring Breakdown:**

- **Length:** 7/10 (1,406 words)
- **Complexity:** 9/10 (MCP architecture, AI tooling, workflow patterns)
- **Framework:** 7/10 (Introduction → Architecture → Real example)
- **Audience:** 7/10 (Developers + AI enthusiasts)
- **Traffic Potential:** 9/10 (MCP + AI development = trending keywords)
- **Lead Gen:** 6/10 (AI consulting potential)
- **Evergreen:** 7/10 (MCP adoption ongoing but maturing)
- **Update Ease:** 10/10 (MDX, includes architecture component)

**Priority Score:** `(7+9+7+7) × (9+6) / 100 = 4.5` → **Boosted to 6.5** (trending topic)

**RIVET Components Needed:**

- ⏳ Interactive TOC
- ⏳ Reading progress bar
- ⏳ Key takeaways (3-5 boxes)
- ⏳ TL;DR summary
- ⏳ MCP benefits accordion
- ⏳ Glossary tooltips (MCP, client-server, protocol)
- ⏳ CTA: AI consulting inquiry
- ⏳ Social sharing

**Estimated Effort:** 8-10 hours  
**Timeline:** Month 2 (February 2026)

**Notes:**

- Already has MCPArchitecture component
- Trending topic (MCP adoption growing)
- Could add downloadable MCP setup guide

---

#### 7-8. Demo Posts (UI Elements, Code Syntax) 🟡 LOW-MEDIUM PRIORITY

**Status:** These are demonstration posts for the blog system itself. Lower lead gen value but high educational value for developers evaluating the platform.

**Scoring:** ~4.0-4.5 each  
**Timeline:** Month 3 (March 2026)  
**Effort:** 6-8 hours each

**RIVET Components:**

- Interactive TOC
- Reading progress bar
- Key takeaways
- Social sharing
- Light CTA (newsletter only)

---

### Tier 3: Light RIVET Implementation

#### 9-12. Demo Posts & Short-Form Content 🟢 LOW PRIORITY

**Posts:**

- Demo: LaTeX Math (1,058 words)
- Demo: Markdown (960 words)
- Demo: Diagrams (888 words)
- Shipping a Developer Portfolio (641 words)

**Scoring:** 2.8-3.8 each  
**Timeline:** Month 4 (April 2026)  
**Effort:** 3-4 hours each

**RIVET Components (Minimal):**

- Reading progress bar (global)
- 1-2 key takeaway boxes
- Social sharing
- Newsletter CTA only

---

## Implementation Timeline

### Month 1 (January 2026) - Foundation + Tier 1 Pilot

**Week 1 (Jan 9-15):**

- [x] Complete blog post audit (THIS DOCUMENT)
- [ ] Finish OWASP post accordion implementation
- [ ] Design component library structure
- [ ] Build InteractiveTOC component
- [ ] Build ReadingProgressBar component

**Week 2 (Jan 16-22):**

- [ ] Complete OWASP post full RIVET implementation
- [ ] Build KeyTakeaway component
- [ ] Build TLDRSummary component
- [ ] Create security checklist PDF
- [ ] Set up analytics tracking

**Week 3 (Jan 23-29):**

- [ ] Implement CVE-2025-55182 RIVET components
- [ ] Build Timeline accordion variant
- [ ] Create threat intelligence newsletter signup
- [ ] Test all components on mobile

**Week 4 (Jan 30-Feb 5):**

- [ ] Implement Hardening Portfolio RIVET components
- [ ] Build Series navigation component
- [ ] Create production checklist download
- [ ] Review Month 1 metrics

---

### Month 2 (February 2026) - Tier 2 Posts

**Week 5-8:**

- [ ] Event-Driven Architecture (10-12 hours)
- [ ] Passing CompTIA Security+ (8-10 hours)
- [ ] AI Development Workflow (8-10 hours)
- [ ] Demo: UI Elements (6-8 hours)
- [ ] Demo: Code Syntax (6-8 hours)
- [ ] Review engagement metrics
- [ ] Optimize based on learnings

---

### Month 3 (March 2026) - Tier 3 Posts + Optimization

**Week 9-12:**

- [ ] Implement Tier 3 posts (light RIVET)
- [ ] A/B test component variants
- [ ] Create downloadable assets for lead gen
- [ ] Optimize SEO based on Search Console data
- [ ] Document component library best practices

---

### Month 4 (April 2026) - Polish + Scale

**Week 13-16:**

- [ ] Create social share variants (LinkedIn, Twitter)
- [ ] Implement FAQ schema across all posts
- [ ] Set up internal linking strategy
- [ ] Create blog series landing pages
- [ ] Final QA and performance optimization

---

## Success Metrics (Track Per Post)

### Engagement (GA4)

| Metric                | Baseline | Target | Post-RIVET |
| --------------------- | -------- | ------ | ---------- |
| Avg. Time on Page     | TBD      | +30%   | TBD        |
| Scroll Depth (to end) | TBD      | 80%    | TBD        |
| Bounce Rate           | TBD      | <40%   | TBD        |
| Pages per Session     | TBD      | +1.5   | TBD        |

### Feature Adoption (Custom Events)

| Feature              | Target              | Actual |
| -------------------- | ------------------- | ------ |
| TOC Clicks           | 70% of visitors     | TBD    |
| Accordion Expansions | 50% avg per section | TBD    |
| Download Conversions | 3-5%                | TBD    |
| Social Shares        | 10%                 | TBD    |

### SEO Impact (90 days post-implementation)

| Post                | Baseline Traffic | Target | Actual |
| ------------------- | ---------------- | ------ | ------ |
| OWASP Agentic AI    | TBD              | +60%   | TBD    |
| CVE React2Shell     | TBD              | +40%   | TBD    |
| Hardening Portfolio | TBD              | +50%   | TBD    |

---

## Resource Allocation

### Total Effort Estimates

**Tier 1 (3 posts):** 18 + 16 + 14 = **48 hours** (6 developer days)  
**Tier 2 (5 posts):** 12 + 10 + 10 + 8 + 8 = **48 hours** (6 developer days)  
**Tier 3 (4 posts):** 4 + 4 + 4 + 4 = **16 hours** (2 developer days)

**Grand Total:** **112 hours** (14 developer days) for all 12 posts

### Team Requirements

**Development:** Frontend developer, 3-4 months part-time (25-30 hours/month)  
**Design:** UI/UX designer, 2-3 months part-time (15-20 hours/month)  
**Content:** Content strategist, ongoing (5-10 hours/month for asset creation)

---

## Next Steps (This Week)

### Priority Actions (Jan 9-15, 2026)

1. **✅ COMPLETE:** Blog post audit (this document)
2. **IN PROGRESS:** Finish OWASP accordion implementation
3. **TODO:** Design component library architecture
4. **TODO:** Build InteractiveTOC component (Priority #1)
5. **TODO:** Build ReadingProgressBar component (Priority #2)
6. **TODO:** Set up GA4 baseline metrics tracking

### Decisions Needed

- [ ] Approve 4-month timeline for full blog modernization
- [ ] Confirm resource allocation (development + design time)
- [ ] Select email service provider (ConvertKit vs. Mailchimp)
- [ ] Approve downloadable asset strategy (gated vs. free)
- [ ] Define lead routing workflow (where do captured emails go?)

---

## Appendix: Quick Reference

### Component Priority List

**P0 (Build First):**

1. InteractiveTOC
2. ReadingProgressBar
3. KeyTakeaway
4. Accordion (generic, beyond risk content)

**P1 (Build Next):** 5. TLDRSummary 6. GlossaryTooltip 7. RoleBasedCTA 8. SectionShare

**P2 (Build Last):** 9. RiskMatrix / Visualization 10. DownloadableAsset 11. FAQSchema 12. NewsletterSignup

### Post Status Legend

- 🟡 **IN PROGRESS** - Currently being implemented
- 📋 **PLANNED** - Scoped and ready for work
- ⏳ **PENDING** - Waiting on dependencies
- ✅ **COMPLETE** - Fully implemented and tested

---

**Document Status:** Living document - update after each post completion  
**Next Review:** February 1, 2026 (after Tier 1 complete)  
**Owner:** DCYFR Labs Content Team  
**Last Updated:** January 10, 2026
