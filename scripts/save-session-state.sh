#!/bin/bash
# Universal Session State Saver (v2.0)
# Saves session state with enhanced tracking for agent handoffs
# Usage: ./scripts/save-session-state.sh <agent> <task-description> [phase] [time-remaining]

set -e

AGENT=$1
TASK_DESCRIPTION=$2
PHASE=${3:-"in-progress"}
TIME_REMAINING=${4:-"unknown"}

# Validate arguments
if [ -z "$AGENT" ] || [ -z "$TASK_DESCRIPTION" ]; then
    echo "Usage: $0 <agent> <task-description> [phase] [time-remaining]"
    echo ""
    echo "Arguments:"
    echo "  agent           : opencode|claude|copilot"
    echo "  task-description: Description of current task"
    echo "  phase          : planning|implementation|validation|complete (default: in-progress)"
    echo "  time-remaining : Estimated time to completion (default: unknown)"
    echo ""
    echo "Example:"
    echo "  $0 claude \"Implementing blog category filter\" implementation \"30min\""
    exit 1
fi

# Determine state file location
case "$AGENT" in
    opencode)
        STATE_FILE=".opencode/.session-state.json"
        ;;
    claude)
        STATE_FILE=".claude/.session-state.json"
        mkdir -p .claude
        ;;
    copilot)
        STATE_FILE=".github/copilot-session-state.json"
        ;;
    *)
        echo "❌ Unknown agent: $AGENT"
        echo "Valid agents: opencode, claude, copilot"
        exit 1
        ;;
esac

# Gather git information
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
UNCOMMITTED_FILES=$(git status --short --porcelain 2>/dev/null | wc -l | xargs)
LAST_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get files in progress (escape for JSON)
FILES_IN_PROGRESS=$(git status --short --porcelain 2>/dev/null | awk '{print $2}' | jq -R -s -c 'split("\n") | map(select(length > 0))' || echo '[]')

# Look for issue/PR references in recent commits
RELATED_ISSUE=$(git log -1 --pretty=%B 2>/dev/null | grep -o "#[0-9]\+" | head -1 || echo "")
RELATED_PR=$(git log -1 --pretty=%B 2>/dev/null | grep -o "PR #[0-9]\+" | sed 's/PR //' || echo "")

# Get current milestone from branch name (if following convention)
MILESTONE=""
if [[ "$CURRENT_BRANCH" =~ ^feature/phase-([0-9.]+) ]]; then
    MILESTONE="Phase ${BASH_REMATCH[1]}"
fi

# Create enhanced session state (v2.0 schema)
cat > "$STATE_FILE" <<EOF
{
  "version": "2.0.0",
  "agent": "$AGENT",
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "session": {
    "taskDescription": "$TASK_DESCRIPTION",
    "currentPhase": "$PHASE",
    "estimatedTimeRemaining": "$TIME_REMAINING",
    "git": {
      "branch": "$CURRENT_BRANCH",
      "uncommittedFiles": $UNCOMMITTED_FILES,
      "lastCommit": "$LAST_COMMIT"
    },
    "tracking": {
      "relatedIssue": "$RELATED_ISSUE",
      "relatedPR": "$RELATED_PR",
      "milestone": "$MILESTONE"
    },
    "filesInProgress": $FILES_IN_PROGRESS,
    "provider": "${OPENCODE_PROVIDER:-unknown}",
    "validationStatus": {
      "typescript": "pending",
      "eslint": "pending",
      "tests": "pending",
      "designTokens": "pending",
      "manualReview": "pending"
    },
    "handoffNotes": [],
    "context": {
      "relatedFiles": [],
      "referencePatterns": [],
      "dependencies": []
    }
  },
  "history": [
    {
      "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "action": "session-saved",
      "summary": "Session state created for $AGENT",
      "validationsPassed": []
    }
  ]
}
EOF

echo "✅ Session state saved: $STATE_FILE"
echo ""
echo "📋 Task: $TASK_DESCRIPTION"
echo "🌿 Branch: $CURRENT_BRANCH"
echo "📊 Phase: $PHASE"
echo "⏱️  Estimated time: $TIME_REMAINING"
echo "📝 Uncommitted files: $UNCOMMITTED_FILES"
[ -n "$RELATED_ISSUE" ] && echo "🔗 Issue: $RELATED_ISSUE"
[ -n "$RELATED_PR" ] && echo "🔗 PR: $RELATED_PR"
[ -n "$MILESTONE" ] && echo "🎯 Milestone: $MILESTONE"
echo ""
echo "💡 Next steps:"
echo "   - Continue work in $AGENT"
echo "   - Handoff to another agent: npm run session:restore $AGENT <target-agent>"
echo "   - Update notes: Edit $STATE_FILE (handoffNotes array)"
