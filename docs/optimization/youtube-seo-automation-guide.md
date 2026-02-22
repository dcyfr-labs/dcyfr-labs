<!-- TLP:CLEAR -->

# YouTube SEO Automation — Implementation Guide

**Information Classification:** TLP:CLEAR (Public)
**Last Updated:** 2026-02-21
**Scope:** `dcyfr-labs` — YouTube channel automation lane
**Parent Strategy:** [search-channel-priority-automation.md](./search-channel-priority-automation.md)

---

## Purpose

This guide defines the implementation contract for the YouTube automation lane
(Channel Priority P1). It covers the metadata-pack generator spec, publication
quality checks, cross-linking rules, `VideoObject` JSON-LD alignment, and event
hook integration.

YouTube is treated as a **parallel SEO surface** alongside Google/Bing: ranking
in YouTube Search and appearing in Google video carousels both use overlapping
metadata signals.

---

## 2.1 Metadata-Pack Generator Contract

Every published video asset receives an auto-generated **metadata pack**. The
generator produces draft output for human review before publication.

### Required Fields (mandatory for pack generation)

| Field               | Type                       | Notes                                          |
| ------------------- | -------------------------- | ---------------------------------------------- |
| `title_primary`     | string                     | ≤60 chars; primary keyword near front          |
| `title_variants`    | string[2]                  | A/B test candidates; same keyword intent       |
| `description_short` | string                     | ≤120 chars; used for snippet/preview           |
| `description_long`  | string                     | ≤5000 chars; keyword-rich, no keyword stuffing |
| `tags`              | string[5–15]               | Ordered by specificity descending              |
| `chapters`          | `{title, start_seconds}[]` | Min 3 chapters for videos ≥5 min               |

### Optional Fields (include where applicable)

| Field               | Type     | Notes                                                 |
| ------------------- | -------- | ----------------------------------------------------- |
| `category_id`       | number   | YouTube category ID (e.g., 28 = Science & Technology) |
| `language`          | string   | BCP-47 code (default: `en`)                           |
| `related_post_slug` | string   | Slug of canonical blog post                           |
| `playlist_ids`      | string[] | Target playlists for publication                      |

### Generator Behaviour

- Input: blog post slug (or raw video metadata).
- Output: JSON metadata pack saved to draft state.
- All output is **draft only** — no field is published without human confirmation.
- Title variants must differ meaningfully (not just word reordering).
- Description must include the related blog post URL if `related_post_slug` is set.

---

## 2.2 Publication Quality Checks

Before a video is scheduled for publication, the following checks must pass. A
failing check blocks scheduling and surfaces a clear remediation message.

### Mandatory Checks

| Check                           | Pass Condition                                     | Failure Action              |
| ------------------------------- | -------------------------------------------------- | --------------------------- |
| Caption/transcript completeness | Transcript file attached OR auto-captions verified | Block + prompt upload       |
| Thumbnail accessibility         | Alt text set; contrast ratio ≥4.5:1                | Block + prompt fix          |
| Description length              | 100–5000 chars                                     | Block + show char count     |
| Title length                    | 10–60 chars                                        | Block + show char count     |
| Tags count                      | 5–15 tags                                          | Block + show tag count      |
| Chapter markers (≥5 min video)  | ≥3 chapters with valid timestamps                  | Block + prompt add chapters |

### Advisory Checks (warn, do not block)

| Check             | Condition                            | Advisory Message                            |
| ----------------- | ------------------------------------ | ------------------------------------------- |
| Keywords in title | At least one target keyword detected | "Consider placing keyword earlier in title" |
| Description CTA   | URL or call-to-action in description | "Add a link to the related article"         |
| End screen        | End screen card configured           | "Configure an end screen for retention"     |

---

## 2.3 Blog ↔ Video Cross-Linking Rules

Cross-links between blog posts and YouTube videos increase dwell time, reduce
bounce rate, and strengthen topical authority signals.

### Required Relationships

When a video is associated with a blog post (`related_post_slug` set):

1. **Blog post → Video:** Embed the YouTube video or add a prominent link in the
   blog post body (in `<VideoEmbed>` component or equivalent).
2. **Video description → Blog post:** The canonical blog post URL must appear in
   the first 200 chars of the video description.
3. **Canonical consistency:** If the blog post has a canonical URL tag, that
   same URL should be used in the video description link.

### Cross-Link Validation

Run before finalising video publication:

- [ ] Blog post URL is present in video description.
- [ ] Video embed or link is present in blog post.
- [ ] Both point to the same slug/URL (no redirect chains).

### Orphan Prevention

Videos with no `related_post_slug` and no corresponding blog post should be
flagged as **orphaned video assets** in the content audit dashboard. Orphaned
videos miss the cross-authority benefit and should be reviewed monthly.

---

## 2.4 VideoObject JSON-LD Alignment

When a blog post embeds or references a YouTube video, add structured data to
maximise eligibility for Google video rich results.

### Minimum Required Properties

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "<video title>",
  "description": "<video description ≤5000 chars>",
  "thumbnailUrl": "<YouTube maxresdefault or custom>",
  "uploadDate": "<ISO 8601 date>",
  "contentUrl": "https://www.youtube.com/watch?v=<VIDEO_ID>",
  "embedUrl": "https://www.youtube.com/embed/<VIDEO_ID>",
  "duration": "<ISO 8601 duration, e.g. PT8M30S>"
}
```

### Optional but Recommended Properties

```json
{
  "transcript": "<full transcript text>",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": "<view count>"
  }
}
```

### Implementation Decision

- `VideoObject` is injected via the existing
  `JsonLD` component in `dcyfr-labs`.
- The blog post MDX frontmatter can optionally include a `video` field that the
  layout auto-converts to `VideoObject` JSON-LD.
- Do not duplicate `VideoObject` across both the post page and any parent list
  pages.

---

## 2.5 Event Hooks for Publish / Update Flow

YouTube automation integrates with the existing Inngest-based content publish flow.

### Events to Handle

| Event Name                | Trigger                         | Handler Responsibility                                               |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `content/post.published`  | New blog post published         | Generate metadata-pack draft if `video` field present in frontmatter |
| `content/post.updated`    | Blog post slug or title changes | Re-validate cross-link consistency; flag any description mismatches  |
| `youtube/video.scheduled` | Video queued for publication    | Run publication quality checks; block if mandatory checks fail       |
| `youtube/video.published` | Video goes live                 | Trigger cross-link audit; log to channel audit trail                 |
| `youtube/video.updated`   | Video metadata changed manually | Re-run JSON-LD sync check for related blog posts                     |

### Handler Design Constraints

- All handlers follow the **Validate → Queue → Respond** pattern.
- Handlers MUST NOT auto-publish or auto-update YouTube directly — all mutations
  require human confirmation via the CMS draft review interface.
- Failures emit `youtube/workflow.failed` with structured error payload for
  alerting.

---

## Roll-Out Order

YouTube lane implementation is **Phase 2** of the overall channel priority
roadmap:

1. ✅ Phase 1: Google + Bing baseline (complete)
2. 🔄 Phase 2: YouTube automation lane (this doc)
3. ⏳ Phase 3: Reddit policy-safe lane (separate guide)

Implementation should proceed in this order within Phase 2:

1. Metadata-pack generator (2.1)
2. Publication quality checks (2.2)
3. Blog ↔ Video cross-linking (2.3)
4. VideoObject JSON-LD (2.4)
5. Inngest event hook wiring (2.5)

---

## Related Documentation

- [SEO Channel Priority Matrix](../features/SEO_CHANNEL_PRIORITY.md)
- [Search Channel Priority and Automation Strategy](./search-channel-priority-automation.md)
- [JSON-LD Implementation](./json-ld-implementation.md)
- [Reddit Policy-Safe Workflow](./reddit-policy-safe-workflow.md)
- [Channel Automation Monitoring](./channel-automation-monitoring.md)
