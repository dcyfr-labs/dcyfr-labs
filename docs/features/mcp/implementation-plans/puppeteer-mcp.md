# Puppeteer MCP Implementation Plan

## Overview

**Package**: `@modelcontextprotocol/server-puppeteer`  
**Type**: stdio  
**Priority**: High (Tier 1)  
**Complexity**: ⭐⭐ Medium (requires Chrome/Chromium)

The Puppeteer MCP enables automated browser control within VS Code, perfect for generating screenshots, testing responsive design, automating accessibility audits, and creating Open Graph images programmatically.

---

## Prerequisites

### 1. Chrome/Chromium Installation

Puppeteer requires Chrome or Chromium browser.

**macOS** (you're on macOS):
```bash
# Chrome is likely already installed
# OR install via Homebrew:
brew install --cask google-chrome

# OR use Chromium:
brew install --cask chromium
```

**Verify installation**:
```bash
# Chrome location (typical):
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --version

# Chromium location (typical):
/Applications/Chromium.app/Contents/MacOS/Chromium --version
```

### 2. Disk Space

**Requirements**:
- Chrome/Chromium: ~200MB
- Puppeteer cache: ~300MB
- Screenshots/generated content: varies

**Total**: ~500MB minimum

---

## Installation & Configuration

### Step 1: Add to mcp.json

```jsonc
{
  "servers": {
    // ... existing servers ...
    "Puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "type": "stdio",
      "disabled": false,
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      }
    }
  }
}
```

**Note**: Update `PUPPETEER_EXECUTABLE_PATH` to your Chrome/Chromium location if different.

### Step 2: Test Installation

First time using Puppeteer with npx will download dependencies (~300MB).

### Step 3: Restart VS Code

After adding the configuration, restart VS Code.

### Step 4: Verify Installation

Ask Copilot: "Take a screenshot of https://example.com"

---

## Security Considerations

### Allowed Operations

Puppeteer MCP should:
- ✅ Visit public URLs only
- ✅ Take screenshots of your own site
- ✅ Run accessibility tests
- ✅ Test responsive design
- ✅ Generate images

### Restricted Operations

Puppeteer MCP should NOT:
- ❌ Visit localhost/internal networks (security risk)
- ❌ Scrape private/authenticated sites
- ❌ Bypass bot protection/CAPTCHA
- ❌ Automate form submissions with real data
- ❌ Access sites that prohibit automation

### Sandboxing

Configure Puppeteer to run in sandboxed mode:
```javascript
// If creating custom Puppeteer scripts
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

---

## Use Cases for This Project

### 1. Open Graph Image Generation

**Auto-generate Blog Post OG Images**
```
Prompt: "Create an Open Graph image for my blog post about Next.js 16 with:
- Title: 'Next.js 16: What's New'
- Dark gradient background
- Code snippet overlay
- 1200x630 dimensions"
```

**Expected Result**:
- PNG image: `public/blog/images/og/nextjs-15-whats-new.png`
- Optimized for social media
- Consistent with site branding

**Batch Generate for All Posts**
```
Prompt: "For each blog post without a featured image:
1. Generate OG image from template
2. Include post title and tags
3. Save to public/blog/images/og/
4. Update frontmatter with image path"
```

### 2. Responsive Design Testing

**Test Across Devices**
```
Prompt: "Take screenshots of https://www.dcyfr.ai/blog at:
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1920x1080)
- Ultra-wide (2560x1440)"
```

**Expected Result**:
- 4 screenshots showing responsive behavior
- Identifies layout issues
- Validates breakpoints

**Test Dark Mode**
```
Prompt: "Screenshot the homepage in both light and dark mode"
```

**Expected Result**:
- Light mode screenshot
- Dark mode screenshot
- Side-by-side comparison

### 3. Accessibility Auditing

**Run Lighthouse Audit**
```
Prompt: "Run a Lighthouse accessibility audit on https://www.dcyfr.ai/blog/my-post"
```

**Expected Result**:
- Accessibility score
- List of issues
- Suggestions for fixes
- WCAG compliance check

**Test Keyboard Navigation**
```
Prompt: "Test keyboard navigation on the blog page:
1. Tab through all interactive elements
2. Verify focus indicators
3. Check skip link works
4. Test form accessibility"
```

### 4. Visual Regression Testing

**Compare Versions**
```
Prompt: "Screenshot the current homepage and compare with production"
```

**Expected Result**:
- Local version screenshot
- Production version screenshot
- Visual diff highlighting changes

**Test Component Changes**
```
Prompt: "Screenshot the GitHub heatmap component before and after my changes"
```

**Expected Result**:
- Before/after comparison
- Highlights visual differences
- Helps catch unintended changes

### 5. Content Screenshot Generation

**Documentation Screenshots**
```
Prompt: "Take screenshots of key pages for documentation:
- Homepage hero
- Blog post layout
- Project cards
- Contact form"
```

**Expected Result**:
- High-quality screenshots
- Saved to `/docs/screenshots/`
- Ready for documentation

**Social Media Content**
```
Prompt: "Create a Twitter-optimized screenshot of my latest blog post (1200x675)"
```

**Expected Result**:
- Optimized dimensions
- Clear, readable text
- Branded appearance

---

## Integration with Existing Workflow

### With Blog System

**Pre-Publish Checklist**:
```
Workflow:
1. "Generate OG image for this post"
2. "Test post layout on mobile and desktop"
3. "Run accessibility audit"
4. "Screenshot for social media"
```

**Visual Testing**:
```
Workflow:
1. "Screenshot all blog posts"
2. "Compare with production"
3. "Identify layout regressions"
4. "Fix before deploying"
```

### With Vercel Deployment

**Post-Deployment Verification**:
```
Workflow:
1. Wait for Vercel deployment
2. "Screenshot new deployment"
3. "Compare with local version"
4. "Verify everything looks correct"
```

### With Accessibility Testing

**Automated Audits**:
```
Workflow:
1. "Run Lighthouse on all pages"
2. "Generate accessibility report"
3. "Save to /docs/accessibility/"
4. "Track improvements over time"
```

---

## Example Commands for This Project

### Screenshot Generation
- "Take a screenshot of my homepage at 1920x1080"
- "Screenshot all blog posts for the documentation"
- "Capture the GitHub heatmap in dark mode"

### OG Image Creation
- "Generate an OG image for my latest blog post"
- "Create social media images for all posts without featured images"
- "Design an OG image with this title and gradient"

### Responsive Testing
- "Test the blog page across mobile, tablet, and desktop"
- "Screenshot the contact form at different screen sizes"
- "Verify navigation menu works on small screens"

### Accessibility
- "Run Lighthouse accessibility audit on this page"
- "Test keyboard navigation throughout the site"
- "Check color contrast ratios on the homepage"

### Visual Regression
- "Compare current site with production deployment"
- "Screenshot before and after this CSS change"
- "Verify component looks identical across browsers"

---

## Advanced Use Cases

### 1. Automated OG Image Pipeline

Create a complete OG image generation system:

```
Prompt: "For each blog post:
1. Read frontmatter (title, tags, description)
2. Generate OG image with:
   - Post title
   - Tag badges
   - Code pattern background
   - Site branding
3. Save to public/blog/images/og/[slug].png
4. Update frontmatter with image path
5. Optimize image size"
```

### 2. Comprehensive Accessibility Testing

Monthly accessibility audit:

```
Prompt: "Run accessibility audits on:
- Homepage
- Blog index
- 3 recent blog posts
- About page
- Contact page

Generate report with:
- Lighthouse scores
- WCAG violations
- Suggested fixes
- Comparison with last month"
```

### 3. Visual Documentation Generation

Automated documentation:

```
Prompt: "Generate visual documentation:
1. Screenshot each major page
2. Annotate key features
3. Show responsive variations
4. Include dark/light modes
5. Save to /docs/screenshots/
6. Generate markdown gallery"
```

### 4. Performance Monitoring

Track visual performance:

```
Prompt: "For each deployment:
1. Screenshot homepage loading states
2. Measure time to interactive
3. Capture largest contentful paint
4. Generate performance report
5. Compare with previous deployment"
```

### 5. Social Media Asset Generation

Batch create social media content:

```
Prompt: "For this blog post, generate:
- Twitter card (1200x675)
- LinkedIn post (1200x627)
- Instagram story (1080x1920)
- Facebook post (1200x630)

Include post title, key visual, and branding"
```

---

## Best Practices

### ✅ Do's

- ✅ **Run headless**: Faster and uses less resources
- ✅ **Close browsers**: Always cleanup after operations
- ✅ **Optimize screenshots**: Compress images before saving
- ✅ **Use viewports**: Specify exact dimensions needed
- ✅ **Cache results**: Don't regenerate identical content
- ✅ **Test locally first**: Before running on production URLs

### ❌ Don'ts

- ❌ **Don't run multiple instances**: Resource intensive
- ❌ **Don't screenshot private pages**: Security risk
- ❌ **Don't ignore timeouts**: Set reasonable limits
- ❌ **Don't store huge screenshots**: Optimize file sizes
- ❌ **Don't automate authenticated actions**: Use responsibly

---

## Troubleshooting

### "Chrome not found" Error

**Cause**: Puppeteer can't locate Chrome/Chromium

**Solution**:
1. Verify Chrome is installed
2. Update `PUPPETEER_EXECUTABLE_PATH` in `mcp.json`
3. Use full absolute path to Chrome binary

### "Timeout" Errors

**Cause**: Page takes too long to load

**Solution**:
- Increase timeout in commands
- Check network connection
- Verify URL is accessible
- Try simpler page first

### "Out of Memory" Errors

**Cause**: Too many browser instances

**Solution**:
- Close other applications
- Run one operation at a time
- Restart VS Code
- Check system resources

### Screenshots Look Wrong

**Cause**: Timing or rendering issues

**Solution**:
- Add delay before screenshot
- Wait for specific elements
- Check viewport dimensions
- Verify CSS is loaded

---

## Performance Considerations

### Resource Usage

**Per Browser Instance**:
- RAM: ~100-200MB
- CPU: Moderate during operation
- Disk: Temporary files during execution

**Optimization Tips**:
- Reuse browser instances when possible
- Close browsers promptly after use
- Limit concurrent operations
- Use headless mode (default)

### Speed

**Typical Operations**:
- Simple screenshot: 2-5 seconds
- Full page render: 3-8 seconds
- Lighthouse audit: 10-30 seconds
- Complex automation: 30+ seconds

---

## Storage Management

### Screenshot Organization

Recommended structure:
```
public/
  blog/
    images/
      og/               # Open Graph images
        post-slug.png
      screenshots/      # Blog post screenshots
      social/          # Social media assets
  
docs/
  screenshots/         # Documentation images
  accessibility/       # Audit screenshots
```

### File Size Guidelines

**Target sizes**:
- OG images: < 200KB (optimize for web)
- Screenshots: < 500KB (compress PNG)
- Social media: < 300KB (platform limits)

**Optimization**:
- Use PNG for screenshots
- Use JPEG for photos (if applicable)
- Compress with tools like Sharp or ImageMagick
- Consider WebP format for web usage

---

## Testing the Implementation

### Test 1: Basic Screenshot
```
Prompt: "Take a screenshot of https://example.com"
Expected: PNG file of the example.com homepage
```

### Test 2: Custom Dimensions
```
Prompt: "Screenshot https://www.dcyfr.ai at 1920x1080"
Expected: Full HD screenshot of your homepage
```

### Test 3: Dark Mode
```
Prompt: "Screenshot the homepage in dark mode"
Expected: Dark themed screenshot
```

### Test 4: Mobile View
```
Prompt: "Screenshot the blog page at iPhone 14 dimensions (390x844)"
Expected: Mobile-sized screenshot
```

---

## Integration Scripts

### Custom OG Image Generator

Create `scripts/generate-og-image.mjs`:

```javascript
#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';

async function generateOGImage(title, tags, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load your OG image template HTML
  const templateHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: linear-gradient(135deg, #020617 0%, #1f2937 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 630px;
            font-family: system-ui, sans-serif;
          }
          .container {
            color: white;
            padding: 60px;
            max-width: 800px;
          }
          h1 {
            font-size: 64px;
            font-weight: bold;
            margin: 0 0 30px 0;
            line-height: 1.1;
          }
          .tags {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .tag {
            background: rgba(255,255,255,0.1);
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <div class="tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(templateHTML);
  await page.screenshot({ path: outputPath });
  await browser.close();
  
  console.log(`✅ Generated: ${outputPath}`);
}

// Usage: node scripts/generate-og-image.mjs "My Post Title" "react,nextjs,typescript" output.png
const title = process.argv[2];
const tags = process.argv[3].split(',');
const output = process.argv[4];

await generateOGImage(title, tags, output);
```

---

## Next Steps After Implementation

1. **Test basic screenshots** to ensure Chrome path is correct
2. **Create OG image template** for consistent branding
3. **Set up screenshot directory** structure
4. **Generate OG images** for existing posts
5. **Integrate with blog workflow** for new posts
6. **Set up accessibility testing** schedule

---

## Related Documentation

- [Blog System Architecture](../../blog/architecture)
- [Accessibility Testing Guide](../../accessibility/testing-report-skip-link-2025-11-11)
- [Content Creation Guide](../../blog/content-creation)
- [Image Optimization](../../performance/image-optimization) (if exists)

---

## Cost Analysis

**One-time Setup**:
- Chrome/Chromium: Free (likely already installed)
- Disk space: ~500MB
- Time: 15 minutes

**Ongoing Costs**:
- Disk space for screenshots: varies (100KB-2MB per screenshot)
- CPU/RAM during operation: temporary spike
- No monthly fees

**ROI**:
- Automated OG image generation: High
- Accessibility testing: High
- Visual regression testing: Medium
- Documentation screenshots: Medium

---

**Status**: Ready to implement  
**Estimated Setup Time**: 20 minutes (including Chrome verification)  
**Monthly Cost**: $0  
**Estimated ROI**: High - significant automation of visual tasks and quality assurance
