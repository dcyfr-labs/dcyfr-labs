<!-- TLP:CLEAR -->

# Figure Captions in Blog Posts

Image captions are now fully supported in blog posts with automatic figure numbering.

## Usage

Wrap images with the `Figure` component and provide a `caption` prop. Figures are automatically numbered in order of appearance as "Fig. 1", "Fig. 2", etc.

### Basic Usage in MDX

```mdx
<Figure caption="This is my figure caption">
  !alt text
</Figure>
```

### Direct Image Tag

```mdx
<Figure caption="Architecture diagram showing the MCP flow">
  <img src="/path/to/image.png" alt="MCP Architecture" />
</Figure>
```

## Features

- **Automatic numbering**: Figures are numbered sequentially (Fig. 1, Fig. 2, Fig. 3, etc.)
- **Figure semantics**: Uses proper `<figure>` and `<figcaption>` HTML elements
- **Styling**: Captions appear in a smaller, italicized font below the image
- **Responsive**: Works across all screen sizes
- **Accessibility**: Proper semantic HTML for screen readers

## Styling

The `Figure` component:
- Centers the image and caption
- Adds appropriate spacing between image and caption
- Styles the caption with:
  - Body text font size (base)
  - Reduced text size (text-sm) for the caption
  - Italic formatting for the caption text
  - Bold "Fig. N:" label
  - Muted foreground color
  - Centered text alignment

## Complete Example

```mdx
## MCP Architecture

To understand how MCP works, let's look at the client-server model:

<Figure caption="Model Context Protocol follows a client-server architecture pattern">
  !MCP Architecture Diagram
</Figure>

The diagram shows how:
- AI assistants (clients) connect to MCP servers
- Credentials are kept secure on the server side
- Communication is standardized through the protocol
```

This would render as:

```
## MCP Architecture

To understand how MCP works, let's look at the client-server model:

[Image centered and zoomed-able]

Fig. 1: Model Context Protocol follows a client-server architecture pattern

The diagram shows how:
...
```

## Technical Details

### FigureProvider

The `FigureProvider` component must wrap the MDX content to enable automatic figure numbering. This is already configured in blog post pages at `/src/app/blog/[slug]/page.tsx`.

### Figure Context

The `Figure` component uses React Context to track figure count:
- Each figure is automatically assigned a unique number based on render order
- The context is managed by `FigureProvider`
- Figure numbers persist during re-renders

### When to Skip Captions

If you just want to display an image without a caption, simply don't use the `Figure` component:

```mdx
!alt text
```

## Existing Images

The blog post system already supports zooming on images. Figure captions work alongside this feature - clicking on an image will open it in fullscreen while the caption remains accessible.
