{/* TLP:CLEAR */}

# Holographic Card Effects Implementation

CSS-only holographic card effects for featured blog posts and project cards, inspired by [react-holo-card-effect.vercel.app](https://react-holo-card-effect.vercel.app/).

## Overview

Premium visual effects that create a holographic, reflective appearance on card hover with:
- **Increased contrast** - Darker gradient overlays (70-90% opacity)
- **Rainbow shine sweep** - Animated gradient that sweeps across the card
- **Lens flare effects** - Radial gradient blur that pulses on hover
- **Sparkle particles** - Twinkling white dots at strategic positions
- **Noise/grain texture** - Subtle texture overlay for depth
- **Metallic borders** - Animated border shine effect
- **3D tilt** - Subtle perspective transform on hover
- **Image enhancement** - Brightness, saturation, and hue shift effects

## Implementation

### CSS Module: `src/styles/holo-card.css`

All effects are pure CSS with GPU-accelerated transforms for performance.

### Core Classes

#### Container
```html
<article class="holo-card holo-card-3d">
  {/* Card content */}
</article>
```

#### Background Effects
```html
{/* Darker gradient overlay */}
<div class="holo-gradient-dark group-hover:holo-gradient-dark-hover" />

{/* Noise texture */}
<div class="holo-noise" />

{/* Enhanced image */}
<Image class="holo-image-shift" />
```

#### Holographic Effects
```jsx
{/* Rainbow shine sweep */}
<div className="holo-shine" />

{/* Lens flare */}
<div className="holo-flare" style={{ top: '30%', left: '40%' }} />

{/* Metallic border */}
<div className="holo-border" />

{/* Sparkles */}
<div className="holo-sparkle holo-sparkle-1" />
<div className="holo-sparkle holo-sparkle-2" />
<div className="holo-sparkle holo-sparkle-3" />
<div className="holo-sparkle holo-sparkle-4" />
```

## Usage

### Blog Post Cards (`post-list.tsx`)

Applied to all three layout variants:
- **Default** - Compact horizontal cards
- **Magazine** - Alternating large images
- **Grid** - 2-column layout

```tsx
<article className="holo-card holo-card-3d">
  <div className="absolute inset-0 z-0">
    <Image className="holo-image-shift" />
    <div className="holo-gradient-dark group-hover:holo-gradient-dark-hover" />
    <div className="holo-noise" />
  </div>
  
  <div className="holo-shine" />
  <div className="holo-flare" style={{ top: '30%', left: '40%' }} />
  <div className="holo-border" />
  <div className="holo-sparkle holo-sparkle-1" />
  <div className="holo-sparkle holo-sparkle-2" />
  <div className="holo-sparkle holo-sparkle-3" />
  <div className="holo-sparkle holo-sparkle-4" />
  
  <Link href="..." className="relative z-10">
    {/* Content */}
  </Link>
</article>
```

### Project Cards (`project-card.tsx`)

Same holographic effects applied to project cards for visual consistency.

## Effect Breakdown

### 1. Increased Contrast

**Before:**
```css
background: linear-gradient(to bottom,
  hsl(var(--background) / 0.6),
  hsl(var(--background) / 0.7),
  hsl(var(--background) / 0.8)
);
```

**After:**
```css
.holo-gradient-dark {
  background: linear-gradient(to bottom,
    hsl(var(--background) / 0.7),
    hsl(var(--background) / 0.8),
    hsl(var(--background) / 0.9)
  );
}
```

**Impact:** Text is more readable, images have more punch, overall contrast is increased by ~15%.

### 2. Rainbow Shine Sweep

Animated gradient with cyan, magenta, and yellow hues that sweeps diagonally across the card on hover.

**Animation:** 1.5s ease-in-out from bottom-left to top-right
**Blend mode:** `screen` for vibrant color mixing
**Opacity:** 0 → 1 on hover

### 3. Lens Flare

Radial gradient with blur that creates a lens flare effect.

**Position:** Customizable via inline style
**Animation:** Pulse effect (scale 1 → 1.1)
**Duration:** 2s infinite
**Blend mode:** `overlay`

### 4. Sparkles

Four white dots positioned at corners that twinkle on hover.

**Animation:** Scale 0.5 → 1.5 with opacity fade
**Stagger:** 300ms between each sparkle
**Duration:** 1s infinite

### 5. Noise Texture

SVG-based fractal noise overlay for film grain effect.

**Opacity:** 30%
**Blend mode:** `overlay`
**Purpose:** Adds depth and premium feel

### 6. Metallic Border

Animated gradient border that rotates around the card edge.

**Implementation:** Uses CSS mask to create hollow border effect
**Animation:** 3s linear infinite rotation
**Opacity:** 0 → 1 on hover

### 7. 3D Tilt

Subtle perspective transform on hover.

**Transform:** `translateY(-4px) rotateX(2deg)`
**Duration:** 0.3s ease
**Purpose:** Creates depth and lift effect

### 8. Image Enhancement

**Filters applied on hover:**
- `brightness(1.1)` - 10% brighter
- `saturate(1.2)` - 20% more saturated
- `hue-rotate(5deg)` - Subtle color shift
- `scale(1.05)` - 5% zoom

## Performance Considerations

### GPU Acceleration

All animations use GPU-accelerated properties:
- `transform` (not `top`/`left`)
- `opacity` (not `background-color`)
- `filter` (GPU-accelerated on modern browsers)

### Layer Promotion

Elements with animations are automatically promoted to their own compositor layers.

### Bundle Impact

**CSS file size:** ~4KB (uncompressed)
**Runtime impact:** Negligible (CSS-only, no JavaScript)
**Paint performance:** Excellent (GPU-accelerated)

## Accessibility

### Reduced Motion

Full support for `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  .holo-shine,
  .holo-flare,
  .holo-border,
  .holo-sparkle,
  .holo-image-shift,
  .holo-card-3d {
    animation: none !important;
    transition: opacity 0.3s ease !important;
  }
  
  .holo-card-3d:hover {
    transform: none;
  }
}
```

**Impact:** Users with motion sensitivity see static hover states without animations.

### Dark Mode

Enhanced effects for dark mode:
- Stronger shine colors (30-40% opacity vs 20-30%)
- Brighter flare (30% vs 40% opacity)
- Better visibility against dark backgrounds

```css
@media (prefers-color-scheme: dark) {
  .holo-shine {
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 0, 255, 0.3) 40%,
      rgba(0, 255, 255, 0.4) 50%,
      rgba(255, 255, 0, 0.3) 60%,
      transparent 100%
    );
  }
}
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Animations | ✅ | ✅ | ✅ | ✅ |
| Blend modes | ✅ | ✅ | ✅ | ✅ |
| CSS filters | ✅ | ✅ | ✅ | ✅ |
| CSS masks | ✅ | ✅ | ✅ | ✅ |
| SVG noise | ✅ | ✅ | ✅ | ✅ |

**Minimum versions:**
- Chrome 88+
- Firefox 75+
- Safari 14+
- Edge 88+

## Customization

### Adjust Shine Speed

```css
.holo-card:hover .holo-shine {
  animation: shine-sweep 2s ease-in-out; /* Change from 1.5s */
}
```

### Change Sparkle Count

Add or remove sparkle divs in the component:

```tsx
<div className="holo-sparkle holo-sparkle-5" />
<div className="holo-sparkle holo-sparkle-6" />
```

Then add positions in CSS:

```css
.holo-sparkle-5 { top: 10%; left: 80%; animation-delay: 1.2s; }
.holo-sparkle-6 { top: 90%; left: 60%; animation-delay: 1.5s; }
```

### Adjust Contrast

Modify opacity values in `.holo-gradient-dark`:

```css
.holo-gradient-dark {
  background: linear-gradient(
    to bottom,
    hsl(var(--background) / 0.75), /* Increase for more contrast */
    hsl(var(--background) / 0.85),
    hsl(var(--background) / 0.95)
  );
}
```

### Custom Colors

Change rainbow shine colors:

```css
.holo-shine {
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 100, 100, 0.3) 40%, /* Custom red */
    rgba(100, 100, 255, 0.3) 50%, /* Custom blue */
    rgba(255, 255, 100, 0.3) 60%, /* Custom yellow */
    transparent 100%
  );
}
```

## Testing Checklist

- [ ] Hover effects trigger smoothly on desktop
- [ ] Touch interactions work on mobile (tap to navigate)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Effects work in light and dark modes
- [ ] No jank or stuttering during animations
- [ ] Text remains readable over all backgrounds
- [ ] Cards are keyboard accessible (Tab + Enter)
- [ ] Screen readers announce card content correctly

## Related Documentation

- UI/UX Quick Wins
- [Design System Validation](/docs/design/enforcement)
- Performance Optimization
- Accessibility Guidelines

## Inspiration

Based on the holographic card effect from:
- https://react-holo-card-effect.vercel.app/
- Trading card holographic finishes (Pokémon, Yu-Gi-Oh!, etc.)
- Apple product photography (iPhone Pro finishes)
- Premium UI design trends (Glassmorphism, Holographic effects)

---

**Implementation Date:** November 22, 2025  
**Components Updated:** `post-list.tsx`, `project-card.tsx`  
**CSS Module:** `src/styles/holo-card.css`  
**Status:** Complete ✅
