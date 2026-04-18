# chrome/

**Reference implementation** for site-wide shell components across all `dcyfr-labs/*` and `dcyfr/dcyfr-*` apps. Source of truth for `<SiteNav />`, `<SiteFooter />`, `<PageShell />`, and `<ThemeSwitcher />`.

Per [`openspec/changes/dcyfr-skeleton-sites-scaffolding/`](../../../../../openspec/changes/dcyfr-skeleton-sites-scaffolding/) Phase 3.1, this directory holds the blessed composition of `@dcyfr-labs/*` primitives. Other sites copy from here in Phase 3.2 and swap identity-specific props.

## Scope

| Component           | Purpose                                                                                              | Primitives                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `<SiteNav />`       | Top-level navigation with logo slot, links, theme switcher, optional CTA. Mobile → `<Sheet>` drawer. | dcyfr-button, sheet, separator, (optional) dcyfr-dropdown-menu |
| `<SiteFooter />`    | 3-column grid with brand, navigation, legal/social                                                   | dcyfr-button (link variant), separator                         |
| `<PageShell />`     | Container + padding tokens. Wraps nav + children + footer.                                           | none — layout only                                             |
| `<ThemeSwitcher />` | Light / Dark / System dropdown via `next-themes`                                                     | dropdown-menu, dcyfr-button                                    |

## Migration posture

This directory currently imports from `@/components/ui/*` (local shadcn primitives) plus `@/components/ui/dcyfr-button`. As `@dcyfr-labs/*` primitives install on the consumer side via `npx shadcn@latest add @dcyfr-labs/<name>`, migrate imports opportunistically:

- `@/components/ui/dropdown-menu` → `@/components/ui/dcyfr-dropdown-menu` (once installed)
- `@/components/ui/sheet` → `@/components/ui/dcyfr-sheet`
- `@/components/ui/separator` → `@/components/ui/dcyfr-separator`
- `@/components/ui/button` → `@/components/ui/dcyfr-button` ✓ already available
- (add `@/components/ui/dcyfr-navigation-menu` if/when mega-menu becomes needed)

The chrome API (props) does not change during these swaps. Downstream site imports stay stable.

## Porting to another site

1. Copy `src/components/chrome/` verbatim into the target site.
2. Ensure the site has: `@/components/ui/button` (or `dcyfr-button`), `@/components/ui/sheet`, `@/components/ui/separator`, `@/components/ui/dropdown-menu`, plus `next-themes` installed and `<ThemeProvider>` wrapping the app.
3. In `app/layout.tsx`, wrap body with:
   ```tsx
   <PageShell
     nav={<SiteNav logo={<SiteLogo />} links={NAV_LINKS} />}
     footer={<SiteFooter brand={BRAND} columns={FOOTER_COLUMNS} />}
   >
     {children}
   </PageShell>
   ```
4. Site-specific: supply `<SiteLogo />`, `NAV_LINKS`, `FOOTER_COLUMNS` per the site's identity doc at `docs/dcyfr-workspace/sites/<site>.md`.

## Non-goals

- Not a replacement for the canonical dcyfr-labs app's existing `navigation/` + `layouts/` directories. Those stay. This is the **new** blessed pattern for **other** sites.
- No routing logic — chrome is presentational. Active-link state via `usePathname()` in consumer apps.
- No analytics wiring — sites attach their own click handlers to the link nodes via props.

## Related

- [`openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#4-shared-chrome-composition-rules`](../../../../../openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md)
- [`docs/dcyfr-workspace/sites/`](../../../../../docs/dcyfr-workspace/sites/) — per-site identity docs drive `links`, `brand`, theme overrides
