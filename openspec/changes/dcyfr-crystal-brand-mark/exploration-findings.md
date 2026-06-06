<!-- TLP:AMBER - Internal Use Only -->

# Exploration Findings: DCYFR Crystal Brand-Mark

**Change:** [dcyfr-crystal-brand-mark](./proposal.md) · **Session:** 2026-06-05 · **Status of record:** [status.md](./status.md)
**Scope reminder:** Exploration only. No production mark / favicon / OG / `design-tokens.ts` change. Governs by [specs/dcyfr-brand-mark/spec.md](./specs/dcyfr-brand-mark/spec.md).

---

## Decision (ratified 2026-06-05, Drew)

**Lane chosen: EVOLVE — keep the four-point sparkle silhouette, adopt the faceted-crystal treatment.** (Rei recommended *replace* → faceted "D"; Drew chose evolve, prioritizing brand continuity over differentiation.)

What this means for the graduation session:
- **Primary mark stays the four-point sparkle**; the win is layering the **flat crystal-facet** look onto it (the `F1` direction — but **drop the extra mini-sparkles**; one clean faceted star).
- **Hero/marketing treatment = the 3D crystal sparkle** (`A1` / the PR dcyfr-labs#695 sanctum render) — already in play as brand art.
- Finding #1 still binds: the **favicon must be the flat silhouette**, not the 3D render. The current flat `svg-icon.svg` already reduces fine; the open question is whether to add faceting to the favicon or keep it plain and let the crystal live only in hero/large sizes.
- Tasks 1 (light/mono variants) and 3 (hand-authored owned vector, lockups) proceed **on the sparkle**, not the "D".

**Canonical evolve mark (rendered this session — the vector target):** one clean faceted star, no extra sparkles, both surfaces. Dark: `…/imagegen/E1-evolve-dark.png` · Light: `…/imagegen/E2-evolve-light.png` · [side-by-side](https://s8nbr6d94xjlucu9.public.blob.vercel-storage.com/imagegen/crystal-explore/evolve-sheet.png) · [reduction 512→16px](https://s8nbr6d94xjlucu9.public.blob.vercel-storage.com/imagegen/crystal-explore/evolve-reduction.png). These are AI references only; the production mark must be a **hand-authored owned vector** (Task 3 / provenance, open-Q5).

---

## Method

- **Model:** `gpt-image-1.5` via the imagegen `openai` lane (crisp geometry) — enabled by [imagegen-current-gen-models](../imagegen-current-gen-models/).
- **10 renders, $1.70 total**, all `org=dcyfr`, recorded one-row-per-image in the governance ledger. Well under the $5/day dcyfr ceiling.
- **Form set (A*)** — 1024² 3D faceted-crystal marks, isolated on solid navy (mark, not scene), dcyfr palette.
- **Flat set (F*)** — flat low-poly "crystal-facet" marks (cyan/white duotone), the form a real favicon would actually use.
- **App-icon reduction** tested locally (free) by downscaling each render to 512/64/32/16px and viewing at honest pixel scale.
- Previews are on Vercel Blob (`…/imagegen/<id>.png`); contact sheets + reduction strips archived under `logs/rei/imagegen/crystal-brand-mark/` and `/tmp/crystal-refs/`.

## Render catalog

Blob base: `https://s8nbr6d94xjlucu9.public.blob.vercel-storage.com/imagegen/`

### 3D faceted forms (sparkle vs non-sparkle)

| ID | Form | URL | Read |
|----|------|-----|------|
| **A1** | four-point sparkle-crystal *(evolve baseline)* | `A1-sparkle-crystal.png` | Stunning. On-brand. **But = the AI-cliché silhouette** (Gemini/Claude). |
| A2 | single brilliant-cut gem | `A2-gem.png` | Beautiful, reads "diamond/luxury/crypto," not cybersecurity. Generic. |
| A3 | angular crystal monolith / shard | `A3-monolith.png` | Elegant FF-Crystal. Distinctive *as art*, generic *as identity* (reads "a gem," not DCYFR). |
| A4 | faceted octahedron polyhedron | `A4-polyhedron.png` | Clean geometric, but reads as a generic 3D crystal/cube. |
| **A5** | crystalline **"D" monogram** | `A5-dmono.png` | Came through despite the anti-lettering negative. **Most ownable** (the brand's own letter), maximal break from the sparkle. |
| A6 | faceted crystal **shield** + lock | `A6-shield.png` | Gorgeous, but stacks shield+padlock+circuit = the most *generic* security-vendor trope, and too detailed to reduce. |
| A7 | faceted hexagon | `A7-hexagon.png` | Clean, but reads "gem/cube"; not ownable. |

### Flat "crystal-facet" derivatives (what a favicon would be)

| ID | Form | URL | Read |
|----|------|-----|------|
| **F1** | flat faceted sparkle *(evolve)* | `F1-flat-sparkle.png` | Clean, modern — but the model *added two mini-sparkles*, making it **even more** Gemini-like. Doubles down on the cliché. |
| **F2** | flat faceted **"D"** *(replace)* | `F2-flat-dmono.png` | Bold, ownable, legible monogram with a crystal-facet feel. Strong primary-mark candidate. |
| F3 | flat faceted abstract glyph *(replace)* | `F3-flat-glyph.png` | Original non-letter crystalline emblem; distinctive, but busy. |

## Key findings

### 1. The 3D crystal can only be a *hero treatment*, never the primary mark.
Reduction test: **every** photographic 3D render dissolves at favicon scale — A1 sparkle is a fuzzy blob by 16px, A6 shield by 32px, A5 "D" holds best (the letterform survives) but still muddies. The flat F* marks reduce cleanly (F1 sparkle and F2 "D" both legible at 16px; F3 glyph muddies — too much internal facet detail). **⇒ Architecture: a flat, high-contrast silhouette is the primary mark/favicon; the luminous faceted crystal is its hero/marketing treatment.** (Resolves open question #2.)

### 2. Faceting the sparkle does **not** solve the differentiation problem.
A1/F1 are the best-looking outputs, but they are still the four-pointed AI-product glyph — the flat version literally grew *extra* sparkles. "Make the current mark a crystal" = keep the cliché, just prettier. If differentiation is the goal (Drew's stated operative question), the crystal *aesthetic* must be applied to a *differentiated silhouette*. (Resolves open question #1: the sparkle is viable but does not differentiate.)

### 3. The crystal visual language itself is a clear win.
Faceted, luminous, electric-cyan-on-navy renders beautifully and is unmistakably on-brand (matches `design-tokens.ts`). The question is *what shape* wears it — not *whether* to adopt it.

## Scoring vs. open questions

| Direction (flat mark + 3D hero) | Differentiate (#1) | Own/trademark (#5) | Favicon-legible (#4) | Brand continuity (#3) | Hero appeal |
|---|---|---|---|---|---|
| **Evolve** — flat sparkle (F1) + 3D sparkle hero (A1) | ✗ still cliché | ✗ generic glyph | ✓ | ✓✓ keeps equity | ✓✓ stunning |
| **Replace** — flat "D" (F2) + 3D "D" hero (A5) | ✓✓ | ✓✓ brand's letter | ✓ | ✗ new mark | ✓ good |
| **Replace** — custom glyph (F3-simplified) + 3D hero | ✓✓✓ | ✓✓✓ original | ✗ needs simplification | ✗ | ✓ |

## Recommendation

**Adopt the crystal visual language; reconsider the silhouette.** Concretely — *evolve the treatment, replace the glyph*:

1. **Primary lane:** the faceted **"D" monogram** — flat `F2` as the primary mark/favicon, 3D `A5` as the marketing/hero treatment. It is the only option that is simultaneously **differentiated, ownable, and favicon-legible**, and it keeps the luminous-crystal look that started this.
2. **If originality > instant legibility:** a **custom faceted glyph** (F3 direction, simplified for reduction) — maximal differentiation, but needs real vector design work to survive 16px.
3. **Evolve (keep sparkle)** is the lowest-risk-to-equity but **does not answer the question Drew actually raised.** It's the right pick *only if* brand continuity outweighs differentiation.

This is a brand-owner decision (Drew). The exploration's job — render sparkle vs non-sparkle, prove the reduction behavior, and recommend a lane — is complete.

## Not decided here (gates before any vector work)

- **Drew picks the lane** (evolve-sparkle / replace-D / replace-custom-glyph). Until then, no vector/favicon/token work.
- Light-surface + monochrome-print derivations of the chosen mark (not yet rendered — productionization detail).
- Hand-authored **owned vector** (not an AI render) for trademark cleanliness — Task 3, only after the lane is chosen.
- On graduation, **migrate this change into `dcyfr-labs/dcyfr-labs/openspec/changes/`** and wire `design-tokens.ts` / favicon / OG there.
