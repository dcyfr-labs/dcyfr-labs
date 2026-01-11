#!/bin/bash
# Universal Session State Restorer (v2.0)
# Restores session state for agent handoffs with enhanced display
# Usage: ./scripts/restore-session-state.sh <from-agent> <to-agent>

set -e

FROM_AGENT=$1
TO_AGENT=$2

# Validate arguments
if [ -z "$FROM_AGENT" ] || [ -z "$TO_AGENT" ]; then
    echo "Usage: $0 <from-agent> <to-agent>"
    echo ""
    echo "Arguments:"
    echo "  from-agent: opencode|claude|copilot (source of session state)"
    echo "  to-agent  : opencode|claude|copilot (target agent to continue work)"
    echo ""
    echo "Example:"
    echo "  $0 claude opencode  # Handoff from Claude to OpenCode"
    echo "  $0 opencode claude  # Handoff from OpenCode to Claude"
    exit 1
fi

# Determine source file
case "$FROM_AGENT" in
    opencode) FROM_FILE=".opencode/.session-state.json" ;;
    claude) FROM_FILE=".claude/.session-state.json" ;;
    copilot) FROM_FILE=".github/copilot-session-state.json" ;;
    *)
        echo "❌ Unknown source agent: $FROM_AGENT"
        echo "Valid agents: opencode, claude, copilot"
        exit 1
        ;;
esac

# Check if session state exists
if [ ! -f "$FROM_FILE" ]; then
    echo "❌ No session state found for $FROM_AGENT"
    echo ""
    echo "💡 Create a session state first:"
    echo "   npm run session:save $FROM_AGENT \"task description\" [phase] [time]"
    echo ""
    echo "Example:"
    echo "   npm run session:save claude \"Implementing blog filter\" implementation \"30min\""
    exit 1
fi

# Display enhanced session state
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          SESSION STATE RESTORATION                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📤 Restoring session from: $FROM_AGENT"
echo "📥 Target agent: $TO_AGENT"
echo ""
echo "────────────────────────────────────────────────────────────────"

# Extract session information
TASK=$(jq -r '.session.taskDescription' "$FROM_FILE")
PHASE=$(jq -r '.session.currentPhase' "$FROM_FILE")
TIME=$(jq -r '.session.estimatedTimeRemaining' "$FROM_FILE")
BRANCH=$(jq -r '.session.git.branch' "$FROM_FILE")
UNCOMMITTED=$(jq -r '.session.git.uncommittedFiles' "$FROM_FILE")
LAST_COMMIT=$(jq -r '.session.git.lastCommit' "$FROM_FILE")
ISSUE=$(jq -r '.session.tracking.relatedIssue' "$FROM_FILE")
PR=$(jq -r '.session.tracking.relatedPR' "$FROM_FILE")
MILESTONE=$(jq -r '.session.tracking.milestone' "$FROM_FILE")
PROVIDER=$(jq -r '.session.provider' "$FROM_FILE")

echo ""
echo "📋 Task Description:"
echo "   $TASK"
echo ""
echo "📊 Current Phase: $PHASE"
echo "⏱️  Time Remaining: $TIME"
echo ""
echo "🌿 Git Information:"
echo "   Branch: $BRANCH"
echo "   Uncommitted files: $UNCOMMITTED"
echo "   Last commit: $LAST_COMMIT"
echo ""

if [ "$ISSUE" != "" ] || [ "$PR" != "" ] || [ "$MILESTONE" != "" ]; then
    echo "🔗 Tracking:"
    [ "$ISSUE" != "" ] && echo "   Issue: $ISSUE"
    [ "$PR" != "" ] && echo "   PR: $PR"
    [ "$MILESTONE" != "" ] && echo "   Milestone: $MILESTONE"
    echo ""
fi

echo "📄 Files in Progress:"
jq -r '.session.filesInProgress[]' "$FROM_FILE" 2>/dev/null | while read file; do
    echo "   • $file"
done || echo "   (none)"
echo ""

echo "📝 Handoff Notes:"
jq -r '.session.handoffNotes[]' "$FROM_FILE" 2>/dev/null | while read note; do
    echo "   • $note"
done || echo "   (none)"
echo ""

echo "✅ Validation Status:"
jq -r '.session.validationStatus | to_entries | .[] | "   \(.key): \(.value)"' "$FROM_FILE"
echo ""

# Reference patterns
PATTERNS=$(jq -r '.session.context.referencePatterns[]' "$FROM_FILE" 2>/dev/null)
if [ -n "$PATTERNS" ]; then
    echo "📖 Reference Patterns:"
    echo "$PATTERNS" | while read pattern; do
        echo "   • $pattern"
    done
    echo ""
fi

# Provider-specific warnings
if [ "$FROM_AGENT" == "opencode" ]; then
    echo "────────────────────────────────────────────────────────────────"
    echo "⚠️  ENHANCED VALIDATION REQUIRED"
    echo ""
    echo "   Previous agent: $FROM_AGENT (Provider: $PROVIDER)"
    echo "   Free/offline providers require additional validation"
    echo ""
    echo "   Run: npm run check:opencode"
    echo ""
    echo "   Manual review checklist:"
    echo "   [ ] Design tokens used (no hardcoded values)"
    echo "   [ ] Barrel imports used (no direct file imports)"
    echo "   [ ] PageLayout used (unless justified exception)"
    echo "   [ ] Test data has environment checks"
    echo "   [ ] No emojis in public content"
    echo "────────────────────────────────────────────────────────────────"
    echo ""
fi

echo "✅ Session state restored successfully"
echo ""
echo "💡 Next steps:"
echo "   1. Review files in progress and handoff notes above"
echo "   2. Continue work in $TO_AGENT with context from $FROM_AGENT"
echo "   3. Update session state: npm run session:save $TO_AGENT \"task\" [phase] [time]"
if [ "$FROM_AGENT" == "opencode" ]; then
    echo "   4. Run enhanced validation: npm run check:opencode"
fi
echo ""
