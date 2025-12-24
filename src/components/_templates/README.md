# Component Templates

**Purpose**: Pre-built, fully-compliant component templates for AI code generation and developer scaffolding.

## Usage

These templates demonstrate correct usage of design tokens and follow all design system patterns. Use them as:

1. **Starting points** for new components
2. **Reference examples** when implementing similar patterns
3. **Copy-paste templates** for AI-assisted development

## Available Templates

### 1. `hero-section.tsx`
Standardized hero sections for page headers with title, description, and optional actions.

**Use for**: Landing pages, about pages, archive headers

### 2. `card-grid.tsx`
Responsive card grids with hover effects and consistent spacing.

**Use for**: Project showcases, blog post listings, feature grids

### 3. `contact-form.tsx`
Form layouts with proper label/input associations and validation states.

**Use for**: Contact forms, newsletter signups, search inputs

### 4. `content-section.tsx`
Content sections with proper container widths and vertical rhythm.

**Use for**: About pages, documentation, long-form content

### 5. `cta-section.tsx`
Call-to-action sections with buttons and compelling copy.

**Use for**: Homepage CTAs, conversion sections, action prompts

## Design Token Compliance

All templates use:
- ✅ `SPACING.*` for vertical spacing
- ✅ `TYPOGRAPHY.*` for text styles
- ✅ `CONTAINER_WIDTHS.*` for max-widths
- ✅ Semantic colors (`bg-card`, `text-foreground`, etc.)
- ✅ Existing layout components (`PageLayout`, `PageHero`, etc.)

## Customization

Feel free to customize these templates for your needs, but maintain:
1. Design token usage (never hardcode)
2. Semantic color system
3. Responsive breakpoints
4. Accessibility patterns

## Testing

After creating components from these templates:
1. Run `npm run typecheck` - Ensure TypeScript compiles
2. Run `npm run lint` - Check for design token violations
3. Run `npm run test` - Verify functionality

## Contributing

When adding new templates:
1. Ensure 100% design token compliance
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Test across breakpoints
5. Update this README
