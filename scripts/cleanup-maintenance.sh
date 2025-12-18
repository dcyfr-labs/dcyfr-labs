#!/bin/bash
# Periodic Maintenance Script for dcyfr-labs
# Run monthly to clean build artifacts and old test reports

set -e

echo "=== DCYFR Labs Periodic Maintenance ==="
echo "Date: $(date)"
echo ""

# ============================================================================
# Clean Next.js Cache
# ============================================================================
echo "[1/4] Cleaning Next.js build cache..."
if [ -d ".next/cache" ]; then
  CACHE_SIZE=$(du -sh .next/cache | cut -f1)
  echo "  Current cache size: $CACHE_SIZE"
  rm -rf .next/cache
  echo "  ✓ Cleaned .next/cache"
else
  echo "  ⊘ No cache directory found"
fi
echo ""

# ============================================================================
# Clean Old Test Reports (>30 days)
# ============================================================================
echo "[2/4] Cleaning old test reports (>30 days)..."

if [ -d "coverage" ]; then
  OLD_COVERAGE=$(find coverage -type f -mtime +30 2>/dev/null | wc -l | tr -d ' ')
  if [ "$OLD_COVERAGE" -gt 0 ]; then
    find coverage -type f -mtime +30 -delete 2>/dev/null
    echo "  ✓ Removed $OLD_COVERAGE old coverage files"
  else
    echo "  ⊘ No old coverage files to clean"
  fi
fi

if [ -d "playwright-report" ]; then
  OLD_PLAYWRIGHT=$(find playwright-report -type f -mtime +30 2>/dev/null | wc -l | tr -d ' ')
  if [ "$OLD_PLAYWRIGHT" -gt 0 ]; then
    find playwright-report -type f -mtime +30 -delete 2>/dev/null
    echo "  ✓ Removed $OLD_PLAYWRIGHT old Playwright report files"
  else
    echo "  ⊘ No old Playwright files to clean"
  fi
fi
echo ""

# ============================================================================
# Git Garbage Collection
# ============================================================================
echo "[3/4] Running git garbage collection..."
GIT_SIZE_BEFORE=$(du -sh .git | cut -f1)
echo "  .git size before: $GIT_SIZE_BEFORE"

git gc --auto --quiet

GIT_SIZE_AFTER=$(du -sh .git | cut -f1)
echo "  .git size after: $GIT_SIZE_AFTER"
echo ""

# ============================================================================
# Scan for New Backup Files
# ============================================================================
echo "[4/4] Scanning for new backup files..."
NEW_BACKUPS=$(find . -type f \( -name "*.bak" -o -name "*.backup" -o -name "*.old" \) ! -path "*/node_modules/*" ! -path "*/.next/*" 2>/dev/null)

if [ -n "$NEW_BACKUPS" ]; then
  echo "  ⚠ Found backup files:"
  echo "$NEW_BACKUPS" | sed 's/^/    /'
  echo ""
  echo "  Review and remove manually if safe"
else
  echo "  ✓ No backup files found"
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "=== Maintenance Complete ==="
echo ""
echo "Project Statistics:"
echo "  Total size: $(du -sh . | cut -f1)"
echo "  node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
echo "  .next: $(du -sh .next 2>/dev/null | cut -f1 || echo 'N/A')"
echo "  .git: $GIT_SIZE_AFTER"
echo "  docs: $(du -sh docs | cut -f1)"
echo ""
echo "Recommended next steps:"
echo "  • npm audit fix (check for security updates)"
echo "  • Review docs/archive/ for files to permanently delete"
echo "  • Run 'npm run test' to regenerate fresh coverage reports"
echo ""
