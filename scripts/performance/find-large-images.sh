#!/bin/bash
# Find Large Images Script
# Purpose: Identify images >100KB that could benefit from optimization
# Usage: bash scripts/performance/find-large-images.sh

set -e

echo "======================================"
echo "Large Image Finder"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/../.."

echo "Searching for images >100KB in public/ directory..."
echo ""

# Find large images
LARGE_IMAGES=$(find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) -size +100k 2>/dev/null || true)

if [ -z "$LARGE_IMAGES" ]; then
  echo -e "${GREEN}✅ No images >100KB found!${NC}"
  echo ""
else
  echo -e "${YELLOW}Found images >100KB:${NC}"
  echo ""
  
  # Count and display
  COUNT=0
  TOTAL_SIZE=0
  
  while IFS= read -r file; do
    if [ -n "$file" ]; then
      SIZE=$(du -h "$file" | cut -f1)
      SIZE_KB=$(du -k "$file" | cut -f1)
      TOTAL_SIZE=$((TOTAL_SIZE + SIZE_KB))
      COUNT=$((COUNT + 1))
      
      if [ $SIZE_KB -gt 500 ]; then
        echo -e "${RED}  ❌ $file ($SIZE)${NC}"
      elif [ $SIZE_KB -gt 200 ]; then
        echo -e "${YELLOW}  ⚠️  $file ($SIZE)${NC}"
      else
        echo -e "  📷 $file ($SIZE)"
      fi
    fi
  done <<< "$LARGE_IMAGES"
  
  echo ""
  echo "======================================"
  echo -e "${YELLOW}Summary:${NC}"
  echo "  Total large images: $COUNT"
  echo "  Total size: $((TOTAL_SIZE / 1024)) MB"
  echo ""
  
  # Recommendations
  echo "======================================"
  echo -e "${GREEN}Recommendations:${NC}"
  echo ""
  echo "1. Compress images with Squoosh (manual):"
  echo "   https://squoosh.app/"
  echo ""
  echo "2. Bulk optimize with Sharp (automated):"
  echo "   npm install sharp"
  echo "   npx sharp compress public/images/*.jpg"
  echo ""
  echo "3. Use ImageOptim (macOS):"
  echo "   https://imageoptim.com/"
  echo ""
  echo "4. Target sizes:"
  echo "   - Hero images: <200KB (compressed WebP)"
  echo "   - Card images: <100KB"
  echo "   - Thumbnails: <50KB"
  echo "   - Icons: <10KB"
  echo ""
fi

# Check total public directory size
echo "======================================"
echo "Public Directory Stats:"
echo ""
TOTAL_PUBLIC=$(du -sh public 2>/dev/null | cut -f1 || echo "0")
echo "  Total size: $TOTAL_PUBLIC"
echo ""

# Check if images directory exists
if [ -d "public/images" ]; then
  TOTAL_IMAGES=$(du -sh public/images 2>/dev/null | cut -f1 || echo "0")
  IMAGE_COUNT=$(find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) 2>/dev/null | wc -l || echo "0")
  echo "  Images directory: $TOTAL_IMAGES ($IMAGE_COUNT files)"
fi

echo ""
echo "======================================"
echo "Next Steps:"
echo ""
echo "1. Run bundle analysis:"
echo "   npm run analyze"
echo ""
echo "2. Run Lighthouse audit:"
echo "   npm run lighthouse:baseline"
echo ""
echo "3. View detailed results:"
echo "   cat docs/performance/week-1-image-audit-results.md"
echo ""
