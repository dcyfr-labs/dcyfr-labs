{/* TLP:CLEAR */}

# Versioning Scheme

## Overview

This project uses **Calendar Versioning (CalVer)** with the `YYYY.MM.DD[.MICRO]` format.

**Why CalVer?**
- Perfect alignment with continuous deployment workflow (every merge to main = new production version)
- Instant clarity on when a version was released
- No subjective "is this breaking?" decisions
- Simplified changelog maintenance
- Follows industry precedent (Ubuntu, Grafana, many SaaS products)

## Format

### Standard Format: `YYYY.MM.DD`

```
2026.01.02  → January 2, 2026
2025.12.07  → December 7, 2025
2025.11.26  → November 26, 2025
```

### Multiple Deploys Same Day: `YYYY.MM.DD.MICRO`

```
2026.01.02.1  → First deploy on January 2, 2026
2026.01.02.2  → Second deploy on January 2, 2026
2026.01.02.3  → Third deploy on January 2, 2026
```

## Breaking Changes

While CalVer doesn't encode semantic meaning in version numbers, we still track breaking changes:

### In CHANGELOG.md

Mark breaking changes with `⚠️ BREAKING` in the version header:

```markdown
## [2026.01.15] - Major Refactor ⚠️ BREAKING

### Changed
- Migrated to new component architecture (breaking: old imports removed)
- Updated design system tokens (breaking: legacy spacing values removed)

### Migration Guide
1. Update imports from `@/components/old/*` to `@/components/new/*`
2. Replace hardcoded spacing with design tokens from `@/lib/design-tokens`
```

### Breaking Change Indicators

Use these conventions to signal breaking changes:

1. **Version Header**: Add `⚠️ BREAKING` suffix
2. **Change Description**: Prefix with "(breaking: ...)" to explain impact
3. **Migration Guide**: Include step-by-step upgrade instructions
4. **Git Tags**: Tag releases with `breaking-change` label

## Version Updates

### Automatic (Recommended)

Version updates happen automatically on deployment:

```bash
# Triggered by GitHub Actions on merge to main
npm version $(date +%Y.%m.%d) --no-git-tag-version
```

### Manual

For local testing or hotfixes:

```bash
# Single deploy today
npm version 2026.01.02 --no-git-tag-version

# Multiple deploys today
npm version 2026.01.02.1 --no-git-tag-version
npm version 2026.01.02.2 --no-git-tag-version
```

## Changelog Maintenance

### Adding New Entries

```markdown
## [2026.01.15]

### Added
- New feature description

### Changed
- Updated functionality

### Fixed
- Bug fix description

### Security
- Security patch details
```

### For Breaking Changes

```markdown
## [2026.01.15] - API Redesign ⚠️ BREAKING

### Changed
- Redesigned API routes (breaking: old endpoints removed)

### Migration Guide
**Before:**
```typescript
fetch('/api/old-endpoint')
```

**After:**
```typescript
fetch('/api/v2/new-endpoint')
```
```

## Git Tags

Tag releases for easy reference:

```bash
# Standard release
git tag 2026.01.02
git push origin 2026.01.02

# Breaking change release
git tag -a 2026.01.15 -m "API Redesign - BREAKING"
git push origin 2026.01.15
```

## FAQ

### Q: How do I know if I can safely upgrade?

**A:** Check the changelog for `⚠️ BREAKING` markers. If none present, the upgrade is backward compatible.

### Q: What about npm version ranges?

**A:** This project is marked `"private": true` in package.json, so it's not published to npm. CalVer is used for deployment tracking, not dependency management.

### Q: Can I still use SemVer concepts?

**A:** Yes! Breaking changes are still documented. CalVer just removes the version number debate while keeping the important migration guidance.

### Q: How do I compare versions?

**A:** Lexicographic comparison works: `2026.01.15 > 2026.01.02 > 2025.12.07`

```javascript
// Version comparison
const isNewer = (v1, v2) => v1 > v2;
isNewer('2026.01.15', '2026.01.02'); // true
```

## References

- [CalVer.org](https://calver.org/) - Calendar Versioning specification
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format
- [CHANGELOG.md](../../CHANGELOG.md) - Project changelog

## Related Documentation

- [Production Deployment](./production-deployment.md) - Deployment process
- [MAINTENANCE_PLAYBOOK.md](./MAINTENANCE_PLAYBOOK.md) - Maintenance processes
- [todo.md](./todo.md) - Current priorities
