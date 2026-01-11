#!/bin/bash
# Session Recovery System (v1.0)
# Restores agent session from timestamped checkpoints
# Usage: ./scripts/session-recovery.sh <agent> [checkpoint-timestamp]

set -e

AGENT=$1
CHECKPOINT_TIMESTAMP=$2

CHECKPOINT_DIR=".git/agent-checkpoints"

# Validate agent
if [ -z "$AGENT" ]; then
    echo "Usage: $0 <agent> [checkpoint-timestamp]"
    echo ""
    echo "Arguments:"
    echo "  agent                : opencode|claude|copilot"
    echo "  checkpoint-timestamp : Specific checkpoint to restore (optional)"
    echo ""
    echo "If checkpoint-timestamp is not provided, shows available checkpoints."
    echo ""
    echo "Examples:"
    echo "  $0 claude                        # List available checkpoints"
    echo "  $0 claude 2026-01-06-14-30-00   # Restore specific checkpoint"
    echo "  $0 claude latest                 # Restore latest checkpoint"
    exit 1
fi

# Validate agent name
case "$AGENT" in
    opencode|claude|copilot)
        ;;
    *)
        echo "❌ Unknown agent: $AGENT"
        echo "Valid agents: opencode, claude, copilot"
        exit 1
        ;;
esac

# Determine target state file
case "$AGENT" in
    opencode)
        TARGET_FILE=".opencode/.session-state.json"
        ;;
    claude)
        TARGET_FILE=".claude/.session-state.json"
        mkdir -p .claude
        ;;
    copilot)
        TARGET_FILE=".github/copilot-session-state.json"
        ;;
esac

# Check if checkpoints exist
if [ ! -d "$CHECKPOINT_DIR" ] || [ -z "$(ls -A $CHECKPOINT_DIR/*-${AGENT}.json 2>/dev/null)" ]; then
    echo "❌ No checkpoints found for $AGENT"
    echo "💡 Start auto-checkpoint: npm run checkpoint:start $AGENT"
    exit 1
fi

# If no timestamp provided, list available checkpoints
if [ -z "$CHECKPOINT_TIMESTAMP" ]; then
    echo "📂 Available checkpoints for $AGENT:"
    echo ""

    ls -t "$CHECKPOINT_DIR"/*-${AGENT}.json | while read checkpoint; do
        FILENAME=$(basename "$checkpoint")
        TIMESTAMP=$(echo "$FILENAME" | sed "s/-${AGENT}.json//")

        # Extract checkpoint info
        TASK=$(jq -r '.session.taskDescription // "Unknown task"' "$checkpoint")
        PHASE=$(jq -r '.session.currentPhase // "unknown"' "$checkpoint")
        BRANCH=$(jq -r '.session.git.branch // "unknown"' "$checkpoint")
        UNCOMMITTED=$(jq -r '.session.git.uncommittedFiles // 0' "$checkpoint")

        echo "🕐 $TIMESTAMP"
        echo "   Task: $TASK"
        echo "   Phase: $PHASE | Branch: $BRANCH | Uncommitted files: $UNCOMMITTED"
        echo ""
    done

    echo "💡 To restore: npm run session:recover $AGENT <timestamp>"
    echo "💡 To restore latest: npm run session:recover $AGENT latest"
    exit 0
fi

# Handle "latest" keyword
if [ "$CHECKPOINT_TIMESTAMP" = "latest" ]; then
    CHECKPOINT_FILE=$(ls -t "$CHECKPOINT_DIR"/*-${AGENT}.json | head -1)
    CHECKPOINT_TIMESTAMP=$(basename "$CHECKPOINT_FILE" | sed "s/-${AGENT}.json//")
else
    CHECKPOINT_FILE="$CHECKPOINT_DIR/${CHECKPOINT_TIMESTAMP}-${AGENT}.json"
fi

# Validate checkpoint exists
if [ ! -f "$CHECKPOINT_FILE" ]; then
    echo "❌ Checkpoint not found: $CHECKPOINT_FILE"
    echo "💡 List available: npm run session:recover $AGENT"
    exit 1
fi

# Backup current state if exists
if [ -f "$TARGET_FILE" ]; then
    BACKUP_FILE="${TARGET_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
    cp "$TARGET_FILE" "$BACKUP_FILE"
    echo "📦 Current state backed up to: $BACKUP_FILE"
fi

# Restore checkpoint
cp "$CHECKPOINT_FILE" "$TARGET_FILE"

# Extract and display recovery info
TASK=$(jq -r '.session.taskDescription // "Unknown task"' "$TARGET_FILE")
PHASE=$(jq -r '.session.currentPhase // "unknown"' "$TARGET_FILE")
BRANCH=$(jq -r '.session.git.branch // "unknown"' "$TARGET_FILE")
UNCOMMITTED=$(jq -r '.session.git.uncommittedFiles // 0' "$TARGET_FILE")
FILES_IN_PROGRESS=$(jq -r '.session.filesInProgress | length' "$TARGET_FILE")

echo ""
echo "✅ Session recovered from checkpoint: $CHECKPOINT_TIMESTAMP"
echo ""
echo "📋 Recovered Session:"
echo "   Agent: $AGENT"
echo "   Task: $TASK"
echo "   Phase: $PHASE"
echo "   Branch: $BRANCH"
echo "   Uncommitted files: $UNCOMMITTED"
echo "   Files in progress: $FILES_IN_PROGRESS"
echo ""
echo "💡 Next steps:"
echo "   1. Review uncommitted changes: git status"
echo "   2. Resume work in $AGENT"
echo "   3. Validate state: cat $TARGET_FILE"
echo ""

# Offer to show file diff if git status shows changes
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "⚠️  Warning: $UNCOMMITTED uncommitted files detected"
    echo "💡 Review changes: git status && git diff"
fi
