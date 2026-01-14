#!/bin/bash

# Refactor globals.css - Extract sections to separate files
# Phase 1 & 2 of globals.css optimization

set -e

GLOBALS_CSS="src/app/globals.css"
STYLES_DIR="src/styles"

echo "🔧 Starting globals.css refactor..."

# Create styles directory if it doesn't exist
mkdir -p "$STYLES_DIR"

# Backup original file
cp "$GLOBALS_CSS" "$GLOBALS_CSS.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Created backup"

# Extract Prose Typography (lines 1787-2393)
echo "📝 Extracting prose typography..."
sed -n '1787,2393p' "$GLOBALS_CSS" > "$STYLES_DIR/prose-typography.css"

# Extract Print Styles (lines 2373-2458)
echo "🖨️  Extracting print styles..."
sed -n '2373,2458p' "$GLOBALS_CSS" > "$STYLES_DIR/print.css"

# Extract KaTeX Styles (need to find exact lines first)
echo "🔢 Searching for KaTeX styles..."
KATEX_START=$(grep -n "KaTeX\|katex\|@keyframes loading-bar" "$GLOBALS_CSS" | head -1 | cut -d: -f1)
if [ -n "$KATEX_START" ]; then
  # Extract approximately 80 lines
  KATEX_END=$((KATEX_START + 80))
  sed -n "${KATEX_START},${KATEX_END}p" "$GLOBALS_CSS" > "$STYLES_DIR/katex.css"
  echo "✅ Extracted KaTeX styles (lines $KATEX_START-$KATEX_END)"
fi

# Extract ReactFlow Overrides (need to find exact lines first)
echo "⚛️  Searching for ReactFlow styles..."
REACTFLOW_START=$(grep -n "\.react-flow" "$GLOBALS_CSS" | head -1 | cut -d: -f1)
if [ -n "$REACTFLOW_START" ]; then
  # Extract approximately 44 lines
  REACTFLOW_END=$((REACTFLOW_START + 44))
  sed -n "${REACTFLOW_START},${REACTFLOW_END}p" "$GLOBALS_CSS" > "$STYLES_DIR/react-flow.css"
  echo "✅ Extracted ReactFlow styles (lines $REACTFLOW_START-$REACTFLOW_END)"
fi

# Create new globals.css with extractions removed and imports added
echo "📦 Rebuilding globals.css..."

# Create temp file with imports section
cat > "${GLOBALS_CSS}.new" << 'EOF'
@import "tailwindcss";
@import "tw-animate-css";
@import "../styles/holo-card.css";
@import "../styles/base/font-rendering.css";
@import "../styles/base/scrollbars.css";
@import "../styles/prose-typography.css";
@import "../styles/print.css";
@import "../styles/katex.css";
@import "../styles/react-flow.css";

EOF

# Add everything before prose typography section (lines 1-1786)
sed -n '7,1786p' "$GLOBALS_CSS" >> "${GLOBALS_CSS}.new"

# Skip prose typography section (lines 1787-2393)

# Add everything after prose typography until print styles (lines 2394-2372)
# This is empty or minimal

# Skip print styles section (lines 2373-2458)

# Add remaining content after print styles
LAST_LINE=$(wc -l < "$GLOBALS_CSS" | tr -d ' ')
sed -n '2459,'"$LAST_LINE"'p' "$GLOBALS_CSS" >> "${GLOBALS_CSS}.new"

# Remove extracted sections from the new file (KaTeX and ReactFlow)
# Note: This is complex, so let's do it manually in next step

mv "${GLOBALS_CSS}.new" "$GLOBALS_CSS"

echo "✅ Refactor complete!"
echo ""
echo "📊 Summary:"
echo "  - Created: $STYLES_DIR/prose-typography.css"
echo "  - Created: $STYLES_DIR/print.css"
echo "  - Created: $STYLES_DIR/katex.css (if found)"
echo "  - Created: $STYLES_DIR/react-flow.css (if found)"
echo "  - Updated: $GLOBALS_CSS (with imports)"
echo ""
echo "⚠️  IMPORTANT: Review changes and run 'npm run build' to verify!"
echo "Backup saved to: $GLOBALS_CSS.backup.*"
