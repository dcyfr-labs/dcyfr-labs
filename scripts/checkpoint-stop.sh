#!/bin/bash
# Stop Auto-Checkpoint (v1.0)
# Stops background auto-checkpoint process for specified agent
# Usage: ./scripts/checkpoint-stop.sh <agent>

set -e

AGENT=$1
CHECKPOINT_DIR=".git/agent-checkpoints"

# Validate agent
if [ -z "$AGENT" ]; then
    echo "Usage: $0 <agent>"
    echo ""
    echo "Arguments:"
    echo "  agent : opencode|claude|copilot"
    echo ""
    echo "Example:"
    echo "  $0 claude"
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

PID_FILE="$CHECKPOINT_DIR/.auto-checkpoint-${AGENT}.pid"

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  No running auto-checkpoint process found for $AGENT"
    exit 0
fi

# Read PID and kill process
PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm "$PID_FILE"
    echo "✅ Auto-checkpoint stopped for $AGENT (PID: $PID)"
else
    echo "⚠️  Process $PID not found (already stopped)"
    rm "$PID_FILE"
fi
