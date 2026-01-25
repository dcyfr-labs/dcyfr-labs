{/* TLP:CLEAR */}

# PageHero Quick Reference

## Basic Usage

```tsx
import { PageHero } from "@/components/layouts/page-hero";

<PageHero 
  title="Page Title"
  description="Page description"
/>
```

## Common Patterns

### Standard Page
```tsx
<PageHero 
  title="Contact"
  description="Get in touch for inquiries"
/>
```

### With Image
```tsx
<PageHero 
  title="About"
  description="Learn more"
  image={<Avatar />}
/>
```

### With Actions
```tsx
<PageHero 
  title="Welcome"
  description="Explore my work"
  actions={<Button>Get Started</Button>}
/>
```

### Centered (Homepage/404)
```tsx
<PageHero 
  align="center"
  title="Hi, I'm Drew"
  description="Developer and designer"
/>
```

### Custom Title
```tsx
<PageHero 
  title={
    <span className="flex items-center gap-2">
      Team <Logo />
    </span>
  }
/>
```

### Archive with Count
```tsx
<PageHero 
  title="Blog"
  description="My writing"
  itemCount={42}
/>
```

## Props Reference

| Prop | Type | Default | Required |
|------|------|---------|----------|
| title | string \| ReactNode | - | ✅ |
| description | string \| ReactNode | - | ❌ |
| variant | 'standard' \| 'homepage' \| 'article' | 'standard' | ❌ |
| align | 'left' \| 'center' | 'left' | ❌ |
| image | ReactNode | - | ❌ |
| actions | ReactNode | - | ❌ |
| itemCount | number | - | ❌ |

## Variants

- **standard** - Default (about, contact, resume, projects, blog)
- **homepage** - Larger text (homepage only)
- **article** - Largest text (blog posts only)

## When to Use

✅ **Use PageHero for:**
- All page introductions
- Archive page headers (via ArchiveLayout)
- Landing pages
- Error pages

❌ **Don't use PageHero for:**
- Section headers within pages
- Card headers
- Modal titles
- Navigation elements

## See Full Documentation

`docs/components/page-hero.md`
