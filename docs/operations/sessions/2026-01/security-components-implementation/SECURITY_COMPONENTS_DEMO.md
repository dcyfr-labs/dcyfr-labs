# Security Components Demo Guide

This guide demonstrates how to use the new RIVET security components in blog posts.

---

## Components Overview

### 1. SeverityLabel
Color-coded badges for CVE severity levels.

**Variants:**
- `CRITICAL` - Red badge
- `HIGH` - Orange badge
- `MEDIUM` - Yellow badge
- `LOW` - Blue badge
- `INFO` - Gray badge

**Usage:**
```mdx
<SeverityLabel severity="critical" />
<SeverityLabel severity="high" count={3} />
<SeverityLabel severity="medium" count={4} />
```

**Visual Output:**
```
[🔴 CRITICAL]  [🟠 3 HIGH]  [🟡 4 MEDIUM]
```

---

### 2. CVELink
Auto-link CVE IDs to NIST NVD with first-mention footnote tracking.

**Usage:**
```mdx
<CVETracker>
  This vulnerability (<CVELink cve="CVE-2025-55131" />) affects Node.js.
  
  Later mention: <CVELink cve="CVE-2025-55131" /> (no footnote marker)
</CVETracker>
```

**Visual Output:**
```
This vulnerability (CVE-2025-55131¹) affects Node.js.
Later mention: CVE-2025-55131 (no footnote marker)
```

---

### 3. CVEFootnote
Detailed CVE information cards.

**Usage:**
```mdx
<CVEFootnote
  cve="CVE-2025-55131"
  description="Buffer Memory Leak via Race Condition in Node.js VM module"
  cvssScore={7.5}
  severity="HIGH"
/>
```

**Visual Output:**
```
┌─────────────────────────────────────────────────┐
│ CVE-2025-55131                    [🟠 HIGH]     │
│                                                 │
│ Buffer Memory Leak via Race Condition in       │
│ Node.js VM module                               │
│                                                 │
│ CVSS Score: 7.5/10                              │
│ → View on NIST NVD                              │
└─────────────────────────────────────────────────┘
```

---

## Complete Example

Here's how to enhance a security blog post:

```mdx
---
title: "Critical Vulnerabilities in Package X"
---

<CVETracker>

## Vulnerability Summary

<div className="flex flex-wrap gap-2 my-4">
  <SeverityLabel severity="critical" count={1} />
  <SeverityLabel severity="high" count={3} />
  <SeverityLabel severity="medium" count={2} />
</div>

---

## Critical Vulnerabilities

### CVE-2025-55131: Buffer Memory Leak

**Severity:** <SeverityLabel severity="critical" />  
**CVE ID:** <CVELink cve="CVE-2025-55131" />

This vulnerability (<CVELink cve="CVE-2025-55131" />) allows attackers to...

Later in the document, you can reference it again: <CVELink cve="CVE-2025-55131" /> 
(notice: no footnote marker on second mention)

---

## CVE Details

<CVEFootnote
  cve="CVE-2025-55131"
  description="Buffer Memory Leak via Race Condition"
  cvssScore={9.8}
  severity="CRITICAL"
/>

<CVEFootnote
  cve="CVE-2025-55130"
  description="Symlink Bypass in Permissions Model"
  cvssScore={7.3}
  severity="HIGH"
/>

</CVETracker>
```

---

## Real Example

See the enhanced Node.js CVE blog post:
- **File:** `src/content/blog/nodejs-vulnerabilities-january-2026/index.mdx`
- **URL:** http://localhost:3000/blog/nodejs-vulnerabilities-january-2026

**Features demonstrated:**
- Vulnerability summary with severity badges
- CVE links with first-mention tracking
- 8 CVE footnotes with full details
- Proper CVETracker context wrapping

---

## Best Practices

### 1. Always wrap in CVETracker
```mdx
<CVETracker>
  <!-- All CVE content here -->
</CVETracker>
```

### 2. Use severity badges consistently
```mdx
**Severity:** <SeverityLabel severity="high" />
```

### 3. Link CVEs on first mention
```mdx
This (<CVELink cve="CVE-2025-XXXXX" />) is the first mention.
Later mentions can drop the superscript.
```

### 4. Place footnotes at end
```mdx
## CVE Details

<CVEFootnote ... />
<CVEFootnote ... />
<CVEFootnote ... />

</CVETracker>
```

### 5. Group by severity
```mdx
<div className="flex flex-wrap gap-2">
  <SeverityLabel severity="critical" count={1} />
  <SeverityLabel severity="high" count={3} />
  <SeverityLabel severity="medium" count={4} />
  <SeverityLabel severity="low" count={1} />
</div>
```

---

## Accessibility

All components include:
- ✅ ARIA labels (`role="status"` for severity badges)
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader friendly text
- ✅ External link indicators

---

## Dark Mode Support

All severity colors have dark mode variants:
- `CRITICAL`: `bg-red-600` → `dark:bg-red-900`
- `HIGH`: `bg-orange-600` → `dark:bg-orange-800`
- `MEDIUM`: `bg-yellow-600` → `dark:bg-yellow-700`
- `LOW`: `bg-blue-600` → `dark:bg-blue-700`
- `INFO`: `bg-gray-600` → `dark:bg-gray-700`

---

## TypeScript Support

All components are fully typed:

```typescript
interface SeverityLabelProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  count?: number;
  className?: string;
}

interface CVELinkProps {
  cve: string; // Format: CVE-YYYY-XXXXX
  className?: string;
}

interface CVEFootnoteProps {
  cve: string;
  description: string;
  cvssScore?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}
```

---

**Ready to use in any blog post!** See `SESSION_SUMMARY.md` for full implementation details.
