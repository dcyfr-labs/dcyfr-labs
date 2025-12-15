---
title: Operations TODO
description: Public operations task list and near-term priorities
---

# Operations TODO (Public)

This file tracks active operations work and near-term priorities for contributors and maintainers.

Last updated: 2025-12-14

## Phase 1: Performance Optimization (public summary)

### Priority 1: Build Time Reduction — Completed ✅
- Task: Enable parallel builds in `next.config.ts` using `experimental.cpus`.
- Implementation: `experimental.cpus` set to `Math.max(1, require('os').cpus().length - 1)` in `next.config.ts` (reserves 1 core for OS).
- Verification: Local production build completed in ~52.3s wall time on developer machine (Dec 14, 2025). Next step is further tuning and cache-sharing to reach <30s target.

### Priority 2: Bundle analysis & caching — In progress
- ✅ `npm run perf:check` present in CI pipeline
- ✅ Initial build cache sharing implemented (caching both `.next/cache` and `.next`, cache key uses suffix `-build-v1`)
- Next: Monitor cache hit rates and refine restore-keys for cross-branch reuse; run scheduled `perf-monitor` workflow to collect metrics (cache hit, build duration); consider artifact-based caching if needed
- Goal: CI pipeline time reduction by ~30%.

### Priority 3: Test performance
- Task: Configure Vitest parallel workers and test-specific mocks to reduce test setup and execution time.

### Priority 4: Dependency updates
- Task: Safe minor updates + Dependabot schedule + auto-merge for patch versions.

For details and internal notes see `docs/private/todo.md`.
