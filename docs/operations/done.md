---
title: Operations Done
description: Archive of completed operations work
---

# Completed Operations (Recent)

## 2025-12-14 — Build time optimization: Parallel builds enabled ✅

- Implemented `experimental.cpus` in `next.config.ts` to enable parallel page processing during builds.
- Implementation details: `cpus: Math.max(1, require('os').cpus().length - 1)` — reserves 1 core for system tasks.
- Verification: Local production build completed in ~52.3s wall time (Dec 14, 2025). Further tuning and cache-sharing planned to reach target <30s.

## 2025-12-14 — CI Build Cache Improvement ✅

- Updated `bundle` job in `.github/workflows/test.yml` to cache both `.next/cache` and `.next` and use a reusable cache key (`-build-v1`) with restore-keys to increase hit rates.
- Added a script test to validate the workflow cache configuration (`scripts/__tests__/ci-cache.test.mjs`).
- Impact: Better cache reuse across CI runs should reduce build times and improve cache-hit rates.

See also: `docs/operations/todo.md` (Phase 1 remaining items)
