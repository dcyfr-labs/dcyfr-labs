#!/bin/bash
# Auto-Checkpoint System (v1.0)
# Creates timestamped checkpoints every 30 minutes to prevent data loss
# Usage: Run in background during development session
#   ./scripts/auto-checkpoint.sh <agent> &
#   Example: ./scripts/auto-checkpoint.sh claude &

set -e

AGENT=$1
INTERVAL=${2:-1800}  # Default: 30 minutes (1800 seconds)

# Validate agent
if [ -z "$AGENT" ]; then
    echo "Usage: $0 <agent> [interval-seconds]"
    echo ""
    echo "Arguments:"
    echo "  agent            : opencode|claude|copilot"
    echo "  interval-seconds : Time between checkpoints (default: 1800 = 30min)"
    echo ""
    echo "Example:"
    echo "  $0 claude 1800    # Checkpoint every 30 minutes"
    echo "  $0 opencode 900   # Checkpoint every 15 minutes"
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

# Ensure checkpoint directory exists
CHECKPOINT_DIR=".git/agent-checkpoints"
mkdir -p "$CHECKPOINT_DIR"

# Create PID file to track background process
PID_FILE="$CHECKPOINT_DIR/.auto-checkpoint-${AGENT}.pid"
echo $$ > "$PID_FILE"

echo "🔄 Auto-checkpoint started for $AGENT"
echo "📂 Checkpoints: $CHECKPOINT_DIR"
echo "⏱️  Interval: ${INTERVAL}s ($(($INTERVAL / 60))min)"
echo "🆔 PID: $$ (saved to $PID_FILE)"
echo ""
echo "💡 To stop: npm run checkpoint:stop $AGENT"
echo "💡 To recover: npm run session:recover $AGENT"
echo ""

# Cleanup on exit
trap "rm -f $PID_FILE; echo '⏹️  Auto-checkpoint stopped for $AGENT'" EXIT

# Checkpoint loop
CHECKPOINT_COUNT=0
while true; do
    sleep $INTERVAL

    TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
    CHECKPOINT_FILE="$CHECKPOINT_DIR/${TIMESTAMP}-${AGENT}.json"

    # Determine source state file
    case "$AGENT" in
        opencode)
            SOURCE_FILE=".opencode/.session-state.json"
            ;;
        claude)
            SOURCE_FILE=".claude/.session-state.json"
            ;;
        copilot)
            SOURCE_FILE=".github/copilot-session-state.json"
            ;;
    esac

    # Create checkpoint if source exists
    if [ -f "$SOURCE_FILE" ]; then
        # Copy and enhance with checkpoint metadata
        cat "$SOURCE_FILE" | jq ". + {
            checkpoint: {
                timestamp: \"$TIMESTAMP\",
                agent: \"$AGENT\",
                checkpointNumber: $CHECKPOINT_COUNT,
                autoSaved: true
            }
        }" > "$CHECKPOINT_FILE"

        CHECKPOINT_COUNT=$((CHECKPOINT_COUNT + 1))
        echo "✅ Checkpoint #$CHECKPOINT_COUNT created: $CHECKPOINT_FILE"

        # Cleanup old checkpoints (keep last 10 per agent)
        ls -t "$CHECKPOINT_DIR"/*-${AGENT}.json 2>/dev/null | tail -n +11 | xargs -r rm

    else
        echo "⚠️  No active session found at $SOURCE_FILE"
    fi
done
