# Activity Feed Embed Documentation

**Feature:** Embeddable activity feed for external websites  
**Path:** `/activity/embed`  
**Status:** Production Ready  
**Last Updated:** December 24, 2025

---

## 📋 Overview

The Activity Feed Embed feature allows you to display your dcyfr-labs activity feed on external websites, blogs, portfolio sites, or documentation. The embed supports filtering by source, time range, and item limit, with automatic height adjustment for responsive layouts.

---

## 🚀 Quick Start

### 1. Generate Embed Code

Visit [https://dcyfr.ai/activity](https://dcyfr.ai/activity) and click "Show Embed Code" to access the embed generator.

### 2. Customize Options

- **Source Filter:** Show only specific types of activities (blog, projects, GitHub, etc.)
- **Time Range:** Filter by recency (today, week, month, year, or all time)
- **Limit:** Number of items to display (1-100)
- **Dimensions:** Width and height for the iframe

### 3. Copy and Paste

Copy the generated iframe code and paste it into your website's HTML.

---

## 💻 Basic Usage

### Embed All Activities

```html
<iframe
  src="https://dcyfr.ai/activity/embed"
  width="100%"
  height="600px"
  frameborder="0"
  scrolling="auto"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="Activity Feed"
></iframe>

<script>
  // Auto-resize iframe based on content height
  window.addEventListener("message", function (e) {
    if (e.data.type === "activity-embed-resize") {
      const iframe = document.querySelector('iframe[src*="/activity/embed"]');
      if (iframe) {
        iframe.style.height = e.data.height + "px";
      }
    }
  });
</script>
```

### Embed Blog Posts Only

```html
<iframe
  src="https://dcyfr.ai/activity/embed?source=blog&limit=10"
  width="100%"
  height="600px"
  frameborder="0"
  scrolling="auto"
  title="Recent Blog Posts"
></iframe>
```

### Embed Recent Activity (Last Week)

```html
<iframe
  src="https://dcyfr.ai/activity/embed?timeRange=week&limit=20"
  width="100%"
  height="600px"
  frameborder="0"
  scrolling="auto"
  title="This Week's Activity"
></iframe>
```

---

## 🔧 Configuration Options

### URL Parameters

| Parameter   | Type   | Values                                                                              | Default | Description                        |
| ----------- | ------ | ----------------------------------------------------------------------------------- | ------- | ---------------------------------- |
| `source`    | string | `blog`, `project`, `github`, `trending`, `milestone`, `certification`, `engagement` | All     | Filter by activity source          |
| `timeRange` | string | `today`, `week`, `month`, `year`, `all`                                             | `all`   | Filter by time period              |
| `limit`     | number | 1-100                                                                               | 20      | Maximum number of items to display |

### Examples

**Filter Combinations:**

```html
<!-- Blog posts from the last month -->
<iframe
  src="https://dcyfr.ai/activity/embed?source=blog&timeRange=month"
></iframe>

<!-- Recent GitHub activity (last 7 days) -->
<iframe
  src="https://dcyfr.ai/activity/embed?source=github&timeRange=week&limit=15"
></iframe>

<!-- Top 5 trending items -->
<iframe src="https://dcyfr.ai/activity/embed?source=trending&limit=5"></iframe>

<!-- All milestones -->
<iframe src="https://dcyfr.ai/activity/embed?source=milestone"></iframe>
```

---

## 📱 Responsive Design

The embed automatically adjusts its height based on content using the `postMessage` API. Include the resize script to enable this feature:

```html
<script>
  window.addEventListener("message", function (e) {
    if (e.data.type === "activity-embed-resize") {
      const iframe = document.querySelector('iframe[src*="/activity/embed"]');
      if (iframe) {
        iframe.style.height = e.data.height + "px";
      }
    }
  });
</script>
```

### Mobile-Friendly Embeds

For mobile-optimized layouts, use responsive width:

```html
<div style="max-width: 100%; overflow: hidden;">
  <iframe
    src="https://dcyfr.ai/activity/embed?limit=10"
    width="100%"
    height="auto"
    style="min-height: 400px;"
  ></iframe>
</div>
```

---

## 🎨 Styling

The embed uses a minimal, clean design that matches the dcyfr-labs brand. You can add custom styling to the iframe container:

```html
<div class="activity-embed-container">
  <iframe
    src="https://dcyfr.ai/activity/embed"
    width="100%"
    height="600px"
    frameborder="0"
  ></iframe>
</div>

<style>
  .activity-embed-container {
    max-width: 800px;
    margin: 2rem auto;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .activity-embed-container iframe {
    display: block;
    border: none;
  }
</style>
```

---

## 🔐 Security & Privacy

### CORS Configuration

The embed route includes CORS headers to allow cross-origin embedding:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
X-Frame-Options: ALLOWALL
```

### No Tracking

The embed does not:

- Set cookies
- Track user behavior across sites
- Collect personal information
- Execute third-party scripts

### Content Security Policy

The embed is safe to include on sites with strict CSP policies. It only loads content from `dcyfr.ai` and does not execute external scripts.

---

## 🧪 Testing

### Manual Testing

1. **Preview in Browser:** Click "Preview embed in new window" in the embed generator
2. **Test Responsiveness:** Resize browser window to verify responsive behavior
3. **Test Filters:** Try different source and time range combinations
4. **Test Auto-Resize:** Scroll and verify height adjusts automatically

### Validation

- ✅ Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- ✅ Test on mobile devices (iOS, Android)
- ✅ Verify iframe security (no XSS vulnerabilities)
- ✅ Check CORS headers with browser DevTools
- ✅ Validate accessibility (keyboard navigation, screen readers)

---

## 🛠️ Troubleshooting

### Embed Not Loading

**Symptom:** Blank iframe or error message  
**Solution:** Check that the URL is correct and accessible:

```javascript
// Test in browser console
fetch("https://dcyfr.ai/activity/embed").then((r) => console.log(r.status)); // Should be 200
```

### Height Not Auto-Adjusting

**Symptom:** Iframe height is fixed or shows scrollbars  
**Solution:** Ensure the resize script is included:

```html
<script>
  window.addEventListener("message", function (e) {
    if (e.data.type === "activity-embed-resize") {
      const iframe = document.querySelector('iframe[src*="/activity/embed"]');
      if (iframe) {
        iframe.style.height = e.data.height + "px";
      }
    }
  });
</script>
```

### Content Security Policy Errors

**Symptom:** CSP violation in browser console  
**Solution:** Add frame-src directive to CSP:

```http
Content-Security-Policy: frame-src https://dcyfr.ai;
```

### Filters Not Working

**Symptom:** All activities shown regardless of filters  
**Solution:** Verify URL parameters are correctly formatted:

```html
<!-- ✅ Correct -->
<iframe
  src="https://dcyfr.ai/activity/embed?source=blog&timeRange=week"
></iframe>

<!-- ❌ Incorrect -->
<iframe src="https://dcyfr.ai/activity/embed?source:blog"></iframe>
```

---

## 📊 Performance

### Caching

The embed route uses **ISR (Incremental Static Regeneration)** with a 5-minute revalidation period:

- First load: Fetches fresh data
- Subsequent loads: Serves cached data (≤5 min old)
- Background: Automatically updates cache

### Load Times

| Metric       | Target | Actual |
| ------------ | ------ | ------ |
| Initial Load | <2s    | ~800ms |
| Cached Load  | <500ms | ~200ms |
| Auto-Resize  | <100ms | ~50ms  |

### Optimization Tips

1. **Limit Items:** Use `limit=10` for faster loads
2. **Cache Headers:** Serve from CDN if possible
3. **Lazy Loading:** Use `loading="lazy"` on iframe
4. **Preconnect:** Add DNS prefetch for faster connections

```html
<link rel="preconnect" href="https://dcyfr.ai" />
<iframe loading="lazy" src="https://dcyfr.ai/activity/embed?limit=10"></iframe>
```

---

## 🌐 Use Cases

### Personal Portfolio

Showcase your latest work and achievements:

```html
<section class="activity-section">
  <h2>Recent Activity</h2>
  <iframe src="https://dcyfr.ai/activity/embed?limit=15"></iframe>
</section>
```

### Blog Sidebar

Display recent blog posts in sidebar:

```html
<aside class="sidebar">
  <h3>Latest Posts</h3>
  <iframe
    src="https://dcyfr.ai/activity/embed?source=blog&limit=5"
    height="400px"
  ></iframe>
</aside>
```

### Project Landing Page

Show GitHub activity for open-source projects:

```html
<div class="github-activity">
  <h2>Development Activity</h2>
  <iframe
    src="https://dcyfr.ai/activity/embed?source=github&timeRange=month&limit=20"
  ></iframe>
</div>
```

### Documentation Site

Embed changelog and milestones:

```html
<div class="changelog">
  <h2>What's New</h2>
  <iframe
    src="https://dcyfr.ai/activity/embed?source=milestone&limit=10"
  ></iframe>
</div>
```

---

## 🔗 Related Documentation

- [Activity Feed Source Code](../../src/app/activity/embed/)
- [Activity Feed API](../api/activity-feed.md)
- [Component Documentation](../components/activity-components.md)

---

## 📝 Changelog

### December 24, 2025 - v1.0.0

- ✅ Initial release
- ✅ Support for source and time range filtering
- ✅ Auto-resize iframe with postMessage API
- ✅ Embed code generator with live preview
- ✅ CORS headers for cross-origin embedding
- ✅ Comprehensive unit and E2E tests
- ✅ Performance optimization with ISR caching

---

**Questions or Issues?** [Open an issue on GitHub](https://github.com/dcyfr/dcyfr-labs/issues) or [contact us](/contact).
