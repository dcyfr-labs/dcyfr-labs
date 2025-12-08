# Quick Reference: Figure Captions

## One-Minute Overview

Add captions to images in blog posts with automatic numbering:

```mdx
<Figure caption="Description of what the image shows">
  ![alt text](/path/to/image.png)
</Figure>
```

That's it! Figures are numbered automatically as "Fig. 1:", "Fig. 2:", etc.

## Usage Patterns

### Single Image with Caption
```mdx
<Figure caption="MCP architecture diagram">
  ![MCP Architecture](/images/mcp-arch.png)
</Figure>
```

### Multiple Figures (Auto-Numbered)
```mdx
## Architecture

<Figure caption="System overview showing three tiers">
  ![Overview](/images/overview.png)
</Figure>

## Implementation

<Figure caption="Detailed implementation flow">
  ![Flow](/images/flow.png)
</Figure>
```

Result:
- "Fig. 1: System overview showing three tiers"
- "Fig. 2: Detailed implementation flow"

### Image Without Caption
```mdx
![Just an image](/path/to/image.png)
```

## What's Available

### Components
- `Figure` - Wraps images with captions
- `FigureProvider` - Already wrapping MDX in blog posts

### Import
```typescript
import { Figure } from "@/components/common";
```

### MDX Direct Usage
No import needed! Use `<Figure>` directly in MDX:
```mdx
<Figure caption="My caption">
  ![alt text](url)
</Figure>
```

## Styling Details

- **Caption text**: Small, italic, gray (muted-foreground)
- **Figure label**: Bold "Fig. N:"
- **Alignment**: Center-aligned
- **Spacing**: Consistent with design tokens

## Why This Works

1. **Context Provider**: `FigureProvider` wraps all blog post content
2. **Auto-increment**: Each `<Figure>` calls `increment()` to get its number
3. **Sequential**: Numbers are assigned in order of appearance
4. **Semantic HTML**: Uses proper `<figure>` and `<figcaption>` elements
5. **Accessible**: Screen readers understand the structure

## Common Questions

**Q: Do I need to import anything?**
A: No! `Figure` is available directly in MDX.

**Q: What if I don't provide a caption?**
A: The image renders without the `<figure>` wrapper - just a regular image.

**Q: Do figure numbers reset between posts?**
A: Yes! Each post has its own numbering sequence (starts at Fig. 1).

**Q: Can I reference figures? (e.g., "see Figure 1")**
A: Not yet, but this is a possible future enhancement.

**Q: What about responsive images?**
A: Figures work with Next.js Image component via the ZoomableImage wrapper.

## Examples in the Codebase

See `docs/templates/FIGURE_CAPTIONS_EXAMPLE.mdx` for complete working examples.

## Troubleshooting

**Captions not showing?**
- Make sure you're using `<Figure caption="text">` syntax
- Check that MDX content is wrapped in `<FigureProvider>`

**Numbers not sequential?**
- This is expected if using multiple providers
- Each provider has independent numbering

**Styling looks wrong?**
- Check that design tokens are imported
- Verify no custom CSS is overriding the styles
