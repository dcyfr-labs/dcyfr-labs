<!-- TLP:CLEAR -->

# Animation Decision Matrix

**Purpose**: Guide AI agents and developers on when to use CSS animations vs Framer Motion (or future graphics engines).

**Last Updated**: January 15, 2026  
**Status**: Production Standard

---

## Quick Decision Tree

```
Need animation?
  │
  ├─ Can CSS achieve 90% of the desired effect?
  │  └─ YES → Use CSS Animations ✅ (0 KB bundle cost)
  │
  ├─ Need 3D transforms with multiple axes (rotateX + rotateY)?
  │  └─ YES → Use Framer Motion ⚠️ (+60-80 KB)
  │
  ├─ Need spring physics (momentum, bounce, inertia)?
  │  └─ YES → Use Framer Motion ⚠️
  │
  ├─ Need gesture interactions (drag, swipe, pinch)?
  │  └─ YES → Use Framer Motion ⚠️
  │
  ├─ Need scroll-linked animations (parallax, scroll progress)?
  │  └─ YES → Use Framer Motion ⚠️
  │
  └─ Complex choreography with dependencies?
     └─ YES → Use Framer Motion ⚠️
```

---

## CSS Animations (Default Choice - 95% of Cases)

### When to Use

**✅ Use CSS for:**
- Fade in/out
- Slide up/down/left/right
- Scale (single axis or uniform)
- Rotate (single axis, any angle)
- Opacity changes
- Color transitions
- Hover effects
- Focus states
- Loading states
- Skeleton shimmer
- Progress bars
- Simple stagger effects (fixed delays)

### Benefits

- **0 KB bundle cost** (CSS only)
- **GPU-accelerated** by default (transform + opacity)
- **Respects prefers-reduced-motion** automatically via CSS media query
- **Better performance** (no JavaScript execution)
- **Simpler code** (declarative CSS classes)
- **Easier to maintain** (no JavaScript complexity)

### Implementation Patterns

#### 1. Using Design Tokens (Preferred)

```tsx
import { ANIMATION, HOVER_EFFECTS } from '@/lib/design-tokens';

// Hover effect on card
<div className={cn(
  ANIMATION.transition.base,    // opacity + transform
  HOVER_EFFECTS.card            // lift on hover
)}>
  {content}
</div>

// Button press feedback
<button className={cn(
  ANIMATION.transition.movement, // transform only
  ANIMATION.interactive.press    // scale on active
)}>
  Click me
</button>

// Theme color transition
<div className={cn(
  ANIMATION.transition.theme,    // colors only
  "hover:bg-accent"
)}>
  {content}
</div>
```

#### 2. Using Animation Utilities

```tsx
import { ScrollReveal } from '@/components/features';

// Scroll-triggered reveal
<ScrollReveal animation="fade-up" delay={1}>
  <PostCard post={post} />
</ScrollReveal>

// Custom CSS animation
<div className="reveal-hidden reveal-up transition-appearance">
  {content}
</div>
```

#### 3. Custom CSS Animations

```css
/* Define custom animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-in {
    animation: none;
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Performance Tips

1. **Only animate transform and opacity** (GPU-accelerated)
   ```tsx
   // ✅ Good - GPU accelerated
   className="transition-opacity transition-transform"
   
   // ❌ Bad - CPU-bound, causes reflow
   className="transition-all" // Avoid this!
   ```

2. **Use appropriate transition durations**
   ```tsx
   import { ANIMATION } from '@/lib/design-tokens';
   
   ANIMATION.duration.fast    // 150ms - UI responses
   ANIMATION.duration.normal  // 300ms - Standard transitions
   ANIMATION.duration.slow    // 500ms - Dramatic effects
   ```

3. **Prefer transition utilities over transition-all**
   ```tsx
   // ✅ Good - specific properties
   ANIMATION.transition.movement   // transform only
   ANIMATION.transition.theme      // colors only
   ANIMATION.transition.appearance // opacity + transform
   
   // ❌ Bad - animates everything
   className="transition-all"
   ```

---

## Framer Motion (Advanced Choice - 5% of Cases)

### When to Use

**⚠️ Use Framer Motion ONLY for:**
- 3D transforms with multiple axes (rotateX + rotateY + perspective)
- Spring physics (momentum, bounce, inertia)
- Gesture interactions (drag, swipe, pinch)
- Scroll-linked animations (parallax, scroll progress with dynamic values)
- Complex choreography with dependencies (sequential, conditional animations)
- AnimatePresence for enter/exit animations with layout changes

### Bundle Cost

- **+60-80 KB** minified (gzipped)
- Adds complexity to reduced motion handling
- Requires manual accessibility considerations

### Implementation Patterns

#### 1. Legitimate Use: 3D Transforms

```tsx
import { motion } from 'framer-motion';

/**
 * Uses Framer Motion for 3D coin-flip animation.
 * 
 * Justification: CSS cannot achieve multi-axis 3D transforms with spring physics.
 * Alternative CSS: Simple 2D flip (rotateY only, no spring).
 * Decision: Framer Motion justified for enhanced UX.
 */
export function FlippableAvatar({ isFlipped }: { isFlipped: boolean }) {
  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="front">{/* Front face */}</div>
      <div className="back">{/* Back face */}</div>
    </motion.div>
  );
}
```

#### 2. Legitimate Use: Spring Physics

```tsx
import { motion } from 'framer-motion';

/**
 * Uses Framer Motion for spring-based toggle.
 * 
 * Justification: CSS easing cannot replicate spring physics (overshoot, bounce).
 * Alternative CSS: ease-in-out (less engaging).
 * Decision: Framer Motion justified for polished interaction.
 */
export function ContentTypeToggle({ selected }: { selected: string }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-primary"
        layoutId="activeTab"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      {/* Tab buttons */}
    </div>
  );
}
```

#### 3. Legitimate Use: Gesture Interactions

```tsx
import { motion } from 'framer-motion';

/**
 * Uses Framer Motion for draggable nodes.
 * 
 * Justification: CSS cannot detect drag gestures or provide drag constraints.
 * Alternative CSS: None (not possible).
 * Decision: Framer Motion required.
 */
export function InteractiveDiagram() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      dragElastic={0.2}
      onDragEnd={(event, info) => {
        console.log('Dragged:', info.offset);
      }}
    >
      Draggable node
    </motion.div>
  );
}
```

#### 4. Legitimate Use: Scroll-Linked Animations

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Uses Framer Motion for scroll progress indicator.
 * 
 * Justification: CSS cannot link animations to scroll position dynamically.
 * Alternative CSS: Static position indicator (less engaging).
 * Decision: Framer Motion justified for dynamic feedback.
 */
export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  
  return (
    <motion.div
      className="h-1 bg-primary"
      style={{ width }}
    />
  );
}
```

### Reduced Motion Handling

**Critical**: Framer Motion does NOT automatically respect `prefers-reduced-motion`. You must handle it manually:

```tsx
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      {content}
    </motion.div>
  );
}
```

### Documentation Requirements

**Every Framer Motion usage MUST include JSDoc justification:**

```tsx
/**
 * Component description
 * 
 * **Animation Engine**: Framer Motion
 * 
 * **Justification**: [Explain why CSS is insufficient]
 * - Specific feature needed (3D, spring, gestures, scroll-linked)
 * - Alternative CSS approach considered
 * - Why Framer Motion provides better UX
 * 
 * **Bundle Cost**: +60-80 KB (already included globally)
 * 
 * **Accessibility**: Manual reduced motion handling via useReducedMotion hook
 */
```

---

## Future Graphics Engine Alternatives

When planning enhanced web graphics, consider these alternatives to Framer Motion:

### 1. GSAP (GreenSock Animation Platform)

**Best for**: Complex timelines, professional animations, performance-critical work

**Pros**:
- Smaller bundle than Framer Motion (~30-40 KB for core)
- Better performance for complex sequences
- Extensive easing library
- ScrollTrigger plugin (scroll-linked animations)
- Industry standard for web animations

**Cons**:
- Commercial license required for some features
- Steeper learning curve
- No React-specific API (though compatible)

**Use when**:
- Need complex animation timelines
- Require professional-grade easing
- Performance is critical
- Working with SVG animations

### 2. Three.js / React Three Fiber (Already in Use)

**Best for**: 3D graphics, WebGL rendering, immersive experiences

**Pros**:
- Full 3D rendering capabilities
- React Three Fiber provides React integration
- Extensive ecosystem (drei, postprocessing)
- Industry standard for 3D web

**Cons**:
- Large bundle size (~600 KB for Three.js + React Three Fiber)
- GPU-intensive
- Complex learning curve
- Accessibility challenges

**Use when**:
- Need 3D graphics (models, scenes, cameras)
- Creating immersive experiences
- WebGL rendering required
- Interactive 3D visualizations

### 3. Lottie

**Best for**: Designer-created animations from After Effects

**Pros**:
- JSON-based animations
- Smaller file size than video/GIF
- Vector-based (scales perfectly)
- Easy designer handoff

**Cons**:
- Requires After Effects workflow
- Limited interactivity
- ~20-30 KB runtime

**Use when**:
- Designer creates animations in After Effects
- Need scalable vector animations
- Replacing animated GIFs/videos
- Onboarding flows, empty states, loading animations

### 4. Canvas API

**Best for**: Custom graphics, performance-critical rendering

**Pros**:
- Native browser API (0 KB bundle)
- Full control over rendering
- High performance for many elements
- Pixel-level manipulation

**Cons**:
- Low-level API (more code)
- No built-in accessibility
- Requires manual DOM synchronization

**Use when**:
- Need custom graphics not achievable with CSS/SVG
- Rendering thousands of elements (charts, particles)
- Pixel-level manipulation required

### 5. WebGL / WebGPU

**Best for**: High-performance graphics, compute shaders

**Pros**:
- Native browser API (0 KB bundle)
- GPU-accelerated
- Highest performance
- Future-proof (WebGPU)

**Cons**:
- Very low-level
- Requires shader programming
- Browser support varies (WebGPU)
- Complex learning curve

**Use when**:
- Maximum performance required
- Custom GPU shaders needed
- Advanced rendering techniques
- Compute operations on GPU

---

## Migration Strategy

### Converting Framer Motion to CSS

**Before: Framer Motion**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

**After: CSS Animation**
```tsx
import { ScrollReveal } from '@/components/features';

<ScrollReveal animation="fade-up" delay={1}>
  {content}
</ScrollReveal>
```

**Savings**: -60-80 KB per component (if Framer Motion can be removed entirely)

### Conversion Candidates (Priority Order)

Based on audit, these 10 components are candidates for CSS conversion:

1. **homepage-heatmap-mini.tsx** - Simple fade/scale animations
2. **trending-topics-panel.tsx** - List stagger effects
3. **explore-section.tsx** - Scroll reveals (use Intersection Observer)
4. **topic-cloud.tsx** - Stagger animations with fixed delays
5. **featured-content-carousel.tsx** - Slide transitions (can use CSS)
6. **project-showcase.tsx** - Grid reveal animations
7. **testimonial-slider.tsx** - Slide animations
8. **stats-counter.tsx** - Count-up animations (use JavaScript + CSS)
9. **newsletter-signup.tsx** - Form animations
10. **modern-post-card.tsx** - Card hover (keep 3D tilt, convert others)

**Keep Framer Motion in:**
- FlippableAvatar (3D coin flip)
- FeaturedPostHero (3D tilt with perspective)
- ContentTypeToggle (spring physics)
- InteractiveDiagram (drag gestures)
- ScrollProgressIndicator (scroll-linked width)
- ActivityHeatmapCalendar (complex choreography)

---

## Testing Animations

### Performance Testing

```tsx
// Use React Profiler to measure render cost
import { Profiler } from 'react';

<Profiler id="Animation" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}}>
  <AnimatedComponent />
</Profiler>
```

### Accessibility Testing

```tsx
// Test reduced motion preference
import { useReducedMotion } from '@/hooks/use-reduced-motion';

it('should respect reduced motion preference', () => {
  // Mock prefers-reduced-motion: reduce
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
  
  const { container } = render(<AnimatedComponent />);
  
  // Verify animations are disabled
  expect(container.querySelector('.animate-in')).not.toBeInTheDocument();
});
```

### Visual Regression Testing

Use Storybook + Chromatic/Percy to capture animation states:

```tsx
// AnimatedComponent.stories.tsx
export const InitialState = () => <AnimatedComponent />;
export const AnimatedState = () => <AnimatedComponent animated={true} />;
export const ReducedMotion = () => <AnimatedComponent reducedMotion={true} />;
```

---

## Summary Checklist

Before implementing any animation, verify:

### CSS Animation Checklist
- [ ] Only animates transform and/or opacity (GPU-accelerated)
- [ ] Uses design tokens (ANIMATION.*, HOVER_EFFECTS.*)
- [ ] Respects prefers-reduced-motion (automatic via CSS media query)
- [ ] Has appropriate duration (fast: 150ms, normal: 300ms, slow: 500ms)
- [ ] Uses semantic transition utility (movement, appearance, theme)

### Framer Motion Checklist
- [ ] CSS alternative considered and documented (why insufficient)
- [ ] JSDoc includes justification (3D, spring, gestures, scroll-linked)
- [ ] Manual reduced motion handling via useReducedMotion hook
- [ ] Bundle cost justified (+60-80 KB)
- [ ] Performance tested with React Profiler
- [ ] Accessibility tested (keyboard, screen reader, reduced motion)

---

## Resources

### Internal
- [Design Tokens](../../src/lib/design-tokens.ts) - ANIMATION, HOVER_EFFECTS constants
- [Animation CSS](../../src/styles/animations.css) - CSS animation utilities
- [useReducedMotion Hook](../../src/hooks/use-reduced-motion.ts) - Accessibility hook

### External
- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [GSAP Documentation](https://greensock.com/docs/)
- [Three.js Documentation](https://threejs.org/docs/)

---

**Last Updated**: January 15, 2026  
**Next Review**: Q2 2026 (after graphics engine evaluation)
