#!/usr/bin/env bash
# generate-diagrams.sh
#
# Render all (or a specific) diagram source files from content/diagrams/*.md
# into self-contained HTML files at public/diagrams/<name>-v<version>.html
#
# Usage:
#   ./scripts/generate-diagrams.sh              # render all diagrams
#   ./scripts/generate-diagrams.sh auth-flow    # render one by name (no .md)
#
# Called by:
#   - npm run diagrams:generate
#   - .github/workflows/regenerate-diagrams.yml

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$REPO_ROOT/.." && pwd)"

SOURCES_DIR="$REPO_ROOT/content/diagrams"
OUTPUT_DIR="$REPO_ROOT/public/diagrams"
GENERATOR="$WORKSPACE_ROOT/.claude/skills/visual-explainer/lib/generate.js"

if [ ! -f "$GENERATOR" ]; then
  echo "ERROR: Generator not found at $GENERATOR" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Collect sources
if [ "${1:-}" != "" ]; then
  # Single named diagram
  SOURCES=("$SOURCES_DIR/${1}.md")
  if [ ! -f "${SOURCES[0]}" ]; then
    echo "ERROR: Source not found: ${SOURCES[0]}" >&2
    exit 1
  fi
else
  # All sources (exclude .gitkeep)
  mapfile -t SOURCES < <(find "$SOURCES_DIR" -maxdepth 1 -name "*.md" | sort)
fi

if [ ${#SOURCES[@]} -eq 0 ]; then
  echo "No diagram sources found in $SOURCES_DIR"
  exit 0
fi

ERRORS=0
for SOURCE in "${SOURCES[@]}"; do
  BASENAME="$(basename "$SOURCE" .md)"

  # Extract version from metadata
  VERSION=$(grep -E '^- Version:' "$SOURCE" | head -1 | sed 's/.*Version:[[:space:]]*//' | tr -d '[:space:]')
  if [ -z "$VERSION" ]; then
    VERSION="1"
  fi

  OUTPUT="$OUTPUT_DIR/${BASENAME}-v${VERSION}.html"

  if node "$GENERATOR" "$SOURCE" "$OUTPUT"; then
    : # success logged by generator
  else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 2 ]; then
      echo "  SKIP  $BASENAME (non-CLEAR TLP)"
    else
      echo "  FAIL  $BASENAME (generator exited $EXIT_CODE)" >&2
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "ERROR: $ERRORS diagram(s) failed to generate" >&2
  exit 1
fi

echo ""
echo "Done. Output: $OUTPUT_DIR"
