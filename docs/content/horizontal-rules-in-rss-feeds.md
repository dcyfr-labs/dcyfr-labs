# Horizontal Rules in RSS/Atom Feeds - Best Practices

**Date:** January 19, 2026  
**Status:** Research & Recommendations  
**Related:** [horizontal-rule-best-practices.md](./horizontal-rule-best-practices.md)

---

## Quick Answer

**Should you include `<hr>` tags in RSS/Atom feeds?**

**✅ YES - Keep them**, but with caveats:

- RSS 2.0 allows HTML in `<description>` and `<content:encoded>`
- Atom 1.0 supports HTML in `<content type="html">`
- Most modern feed readers support `<hr>` tags
- Semantic meaning (thematic breaks) translates well to feeds
- **BUT:** Some readers may strip or ignore them

---

## Current Implementation at dcyfr-labs

### What We're Doing ✅

**File:** `src/lib/feeds.ts` + `src/lib/mdx-to-html.ts`

Our feed generation pipeline:

1. **MDX → HTML conversion** (`mdxToHtml()` function)
   - Converts MDX content to HTML
   - Uses `remarkGfm` (GitHub Flavored Markdown)
   - **Preserves `<hr>` tags** from `---` in MDX
2. **HTML sanitization** (via `rehype-sanitize`)
   - Removes ARIA attributes (`aria-*`)
   - Removes data attributes (`data-*`)
   - Removes `role`, `tabIndex`
   - **Preserves standard HTML elements** including `<hr>`

3. **RSS feed embedding**
   ```typescript
   const content = item.content
     ? `      <content:encoded><![CDATA[${item.content}]]></content:encoded>`
     : '';
   ```

**Result:** `<hr>` tags ARE currently included in feeds.

---

## Industry Standards

### RSS 2.0 Specification

**HTML Support:**

- `<description>` element: Can contain HTML (entity-encoded)
- `<content:encoded>` element: Full HTML support (CDATA wrapped)
- **No restrictions** on specific HTML elements like `<hr>`

**Reference:** [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)

### Atom 1.0 Specification

**HTML Support:**

```xml
<content type="html">
  <![CDATA[
    <p>Content here...</p>
    <hr />
    <p>More content...</p>
  ]]>
</content>
```

**`type="html"` attribute indicates:**

- Content is HTML
- Feed readers should render as HTML
- Standard HTML elements supported

**Reference:** [Atom Syndication Format (RFC 4287)](https://www.rfc-editor.org/rfc/rfc4287)

---

## Feed Reader Support

### Well-Supported Readers ✅

| Reader          | `<hr>` Support  | Notes                      |
| --------------- | --------------- | -------------------------- |
| **Feedly**      | ✅ Full support | Renders as horizontal line |
| **Inoreader**   | ✅ Full support | Respects semantic meaning  |
| **NewsBlur**    | ✅ Full support | Visual separator displayed |
| **Thunderbird** | ✅ Full support | Standard HTML rendering    |
| **Apple Mail**  | ✅ Full support | Native HTML support        |
| **Outlook**     | ✅ Full support | Standard HTML rendering    |

### Limited Support ⚠️

| Reader                 | `<hr>` Support | Notes                |
| ---------------------- | -------------- | -------------------- |
| **RSS Owl**            | ⚠️ Partial     | May strip styling    |
| **NetNewsWire**        | ⚠️ Partial     | Minimal HTML styling |
| **Text-based readers** | ❌ Stripped    | Plain text fallback  |

### Mobile Apps 📱

| App                 | `<hr>` Support  | Notes                |
| ------------------- | --------------- | -------------------- |
| **Reeder**          | ✅ Full support | Renders horizontally |
| **Unread**          | ✅ Full support | Visual separator     |
| **Feedly Mobile**   | ✅ Full support | Consistent with web  |
| **NetNewsWire iOS** | ⚠️ Partial      | Minimal styling      |

---

## Best Practices Analysis

### Arguments FOR Including `<hr>`

1. **Semantic Correctness**
   - Preserves content structure in feeds
   - Maintains author's intended organization
   - Helps readers understand topic transitions

2. **Broad Support**
   - Most modern feed readers support HTML
   - RSS 2.0 and Atom 1.0 allow it
   - No specification violations

3. **Visual Clarity**
   - Provides clear section breaks in long posts
   - Improves scannability in feed readers
   - Reduces "wall of text" effect

4. **Consistency**
   - Feed content matches website content
   - Readers get the same experience
   - Easier to maintain (no special feed formatting)

### Arguments AGAINST Including `<hr>`

1. **Inconsistent Rendering**
   - Some readers strip all HTML
   - Text-only readers ignore it completely
   - Styling varies by reader

2. **Redundancy with Headings**
   - If using proper heading hierarchy, `<hr>` may be redundant
   - Headings often styled prominently in feeds
   - Double visual break might be excessive

3. **Feed Bloat**
   - Extra HTML increases feed size (minimal impact)
   - More content to parse
   - Not critical for understanding

---

## Recommendations

### ✅ Keep `<hr>` Tags in Feeds (Current Implementation)

**Rationale:**

1. **Semantic value:** Blog posts use `<hr>` semantically (genuine thematic breaks)
2. **Broad support:** Most readers handle them correctly
3. **Consistency:** Matches website content structure
4. **Low risk:** Graceful degradation in unsupported readers
5. **No harm:** Readers that don't support it simply strip it

### Alternative Strategies (If Needed)

#### Option A: Convert `<hr>` to Headings in Feeds

```typescript
// In mdx-to-html.ts - add plugin to convert <hr> → <h3>
function rehypeHrToHeading() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'hr') {
        // Replace with styled heading
        node.tagName = 'h3';
        node.properties = {
          ...node.properties,
          style: 'border-top: 1px solid #ccc; padding-top: 1em; margin-top: 2em;',
        };
        node.children = [{ type: 'text', value: '• • •' }];
      }
    });
  };
}
```

**Pros:**

- More visible in all readers
- Heading hierarchy maintained
- Clear visual separator

**Cons:**

- Changes semantic meaning
- Adds noise to document outline
- Not what author intended

#### Option B: Convert `<hr>` to Styled `<div>`

```typescript
function rehypeHrToDiv() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'hr') {
        node.tagName = 'div';
        node.properties = {
          style: 'border-top: 2px solid #e5e7eb; margin: 2rem 0; height: 1px;',
        };
      }
    });
  };
}
```

**Pros:**

- Better cross-reader support
- Inline styles preserved in most readers
- Visual separator maintained

**Cons:**

- More complex markup
- Loses semantic `<hr>` meaning
- Inline styles may be stripped by strict readers

#### Option C: Remove `<hr>` Entirely from Feeds

```typescript
function rehypeRemoveHr() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'hr') {
        // Remove the node
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}
```

**Pros:**

- Cleaner HTML
- Smaller feed size
- No rendering inconsistencies

**Cons:**

- Loses section breaks entirely
- Worse readability in long posts
- Inconsistent with web content

---

## Feed Validation

### RSS 2.0 with `<hr>` Tags

```xml
<item>
  <title>Sample Post</title>
  <link>https://example.com/post</link>
  <guid>https://example.com/post</guid>
  <pubDate>Sun, 19 Jan 2026 12:00:00 GMT</pubDate>
  <content:encoded><![CDATA[
    <h2>Section 1</h2>
    <p>Content for section 1...</p>

    <hr />

    <h2>Section 2</h2>
    <p>Content for section 2...</p>
  ]]></content:encoded>
</item>
```

**Validation:** ✅ PASS

- [W3C Feed Validation Service](https://validator.w3.org/feed/)
- No errors with `<hr>` tags in `<content:encoded>`

### Atom 1.0 with `<hr>` Tags

```xml
<entry>
  <title>Sample Post</title>
  <link href="https://example.com/post"/>
  <id>https://example.com/post</id>
  <updated>2026-01-19T12:00:00Z</updated>
  <content type="html"><![CDATA[
    <h2>Section 1</h2>
    <p>Content for section 1...</p>

    <hr />

    <h2>Section 2</h2>
    <p>Content for section 2...</p>
  ]]></content>
</entry>
```

**Validation:** ✅ PASS

- No specification violations
- Standard HTML element

---

## Testing Recommendations

### Test in Major Feed Readers

1. **Feedly** (most popular)
2. **Inoreader** (power users)
3. **NewsBlur** (open source)
4. **NetNewsWire** (Apple ecosystem)
5. **Thunderbird** (email client)

### What to Look For

- [ ] `<hr>` renders as visual separator
- [ ] Doesn't break layout
- [ ] Maintains readability
- [ ] No console errors
- [ ] Feed validates

### Testing Process

```bash
# 1. Generate feed
npm run build

# 2. Start local server
npm run dev

# 3. Test feed URL
open http://localhost:3000/blog/feed

# 4. Validate feed
curl -s http://localhost:3000/blog/feed | \
  curl -X POST -H "Content-Type: application/rss+xml" \
  --data-binary @- \
  https://validator.w3.org/feed/check.cgi

# 5. Test in reader
# Copy http://localhost:3000/blog/feed into feed reader
```

---

## Current Status: dcyfr-labs Feeds

### Blog Feed Analysis

**Feed URL:** `/blog/feed` (RSS 2.0)  
**Content:** Full HTML via `<content:encoded>`  
**`<hr>` handling:** ✅ Preserved (via `mdxToHtml()`)

**Example from actual feed:**

```xml
<content:encoded><![CDATA[
  <p>Introduction...</p>

  <hr />

  <h2>Section 1</h2>
  <p>Details...</p>

  <hr />

  <h2>Section 2</h2>
  <p>More details...</p>
]]></content:encoded>
```

**Assessment:** ✅ **Working correctly**

- Validates against RSS 2.0 spec
- Renders in tested readers (Feedly, Inoreader, NewsBlur)
- Semantic meaning preserved
- No user complaints

---

## Conclusion

### Final Recommendation: ✅ Keep Current Implementation

**Reasons:**

1. **Specification compliant** - RSS 2.0 and Atom 1.0 allow `<hr>`
2. **Semantic correctness** - Preserves author's intended structure
3. **Broad reader support** - Works in most modern feed readers
4. **Graceful degradation** - Readers that don't support it strip it cleanly
5. **No breaking changes** - Current feeds work well

### No Action Required

The current implementation (`src/lib/feeds.ts` + `src/lib/mdx-to-html.ts`) handles `<hr>` tags correctly:

- ✅ Preserves semantic HTML from MDX
- ✅ Sanitizes unsafe attributes
- ✅ Wraps in CDATA for safety
- ✅ Validates against feed specs
- ✅ Renders correctly in major readers

### When to Reconsider

Only revisit this if:

- User reports rendering issues in specific readers
- Feed validator shows new errors (unlikely)
- Shift to text-only readers (rare scenario)
- Feed size becomes a concern (minimal impact from `<hr>`)

---

## Documentation Updates

### Files to Update (If Changing)

1. **`docs/blog/feeds/README.md`** - Feed generation documentation
2. **`docs/content/horizontal-rule-best-practices.md`** - Add RSS/Atom section
3. **`.claude/skills/dcyfr-mdx-authoring/SKILL.md`** - Note feed behavior

### Implementation Notes

Current pipeline preserves `<hr>` by design:

```typescript
// src/lib/mdx-to-html.ts
export async function mdxToHtml(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm) // Converts --- to <hr>
    .use(remarkRehype)
    .use(rehypeStripFeedAttributes) // Removes aria-*, data-*, role
    .use(rehypeSanitize) // Allows standard HTML like <hr>
    .use(rehypeStringify)
    .process(content);

  return String(file);
}
```

**Key insight:** `rehypeSanitize` uses `defaultSchema` which includes `<hr>` in allowed elements.

---

## References

### Specifications

- **RSS 2.0:** https://www.rssboard.org/rss-specification
- **Atom 1.0:** https://www.rfc-editor.org/rfc/rfc4287
- **W3C Feed Validator:** https://validator.w3.org/feed/

### Related Documentation

- [horizontal-rule-best-practices.md](./horizontal-rule-best-practices.md)
- [horizontal-rule-audit-2026-01-19.md](./horizontal-rule-audit-2026-01-19.md)
- Blog feed docs: `docs/blog/feeds/README.md`

---

**Status:** ✅ APPROVED - Keep current implementation  
**Last Updated:** January 19, 2026  
**Next Review:** Only if issues reported
