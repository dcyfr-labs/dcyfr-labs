{/* TLP:CLEAR */}

# Session Recovery System

**Version:** 1.0
**Status:** Production Ready
**Last Updated:** January 6, 2026

## Overview

The Session Recovery System provides **automated checkpointing** and **recovery capabilities** for AI agent sessions across Claude Code, GitHub Copilot, and OpenCode. It prevents data loss during:

- Rate limit interruptions
- IDE crashes
- Network failures
- Accidental session termination
- System reboots

## Architecture

### Components

```
Session Recovery System
├── Auto-Checkpoint (Background process)
│   ├── Creates timestamped checkpoints every 30 minutes
│   ├── Stores in .git/agent-checkpoints/
│   └── Auto-cleanup (keeps last 10 per agent)
│
├── Recovery Interface (Manual restore)
│   ├── List available checkpoints
│   ├── Restore from specific timestamp
│   └── Restore latest checkpoint
│
└── Process Management
    ├── PID tracking
    ├── Graceful shutdown
    └── Background execution
```

### Storage Structure

```
.git/agent-checkpoints/
├── .gitkeep                                    # Track directory structure
├── 2026-01-06-14-00-00-claude.json            # Auto-checkpoint
├── 2026-01-06-14-30-00-claude.json            # Auto-checkpoint
├── 2026-01-06-15-00-00-groq.json              # Auto-checkpoint
└── .auto-checkpoint-claude.pid                 # Process tracker
```

**Note:** Checkpoint files are `.gitignore`d but directory structure is tracked.

## Usage

### Start Auto-Checkpoint

Start background checkpointing for active agent session:

```bash
# Start with default interval (30 minutes)
npm run checkpoint:start claude &

# Start with custom interval (15 minutes)
./scripts/auto-checkpoint.sh opencode 900 &
```

**Output:**
```
🔄 Auto-checkpoint started for claude
📂 Checkpoints: .git/agent-checkpoints
⏱️  Interval: 1800s (30min)
🆔 PID: 12345 (saved to .git/agent-checkpoints/.auto-checkpoint-claude.pid)

💡 To stop: npm run checkpoint:stop claude
💡 To recover: npm run session:recover claude
```

### Stop Auto-Checkpoint

Stop background checkpointing process:

```bash
npm run checkpoint:stop claude
```

**Output:**
```
✅ Auto-checkpoint stopped for claude (PID: 12345)
```

### List Available Checkpoints

View all available checkpoints for an agent:

```bash
npm run session:recover claude
```

**Output:**
```
📂 Available checkpoints for claude:

🕐 2026-01-06-15-00-00
   Task: Implement automated provider fallback
   Phase: implementation | Branch: feat/auto-fallback | Uncommitted files: 3

🕐 2026-01-06-14-30-00
   Task: Implement automated provider fallback
   Phase: planning | Branch: feat/auto-fallback | Uncommitted files: 0

💡 To restore: npm run session:recover claude <timestamp>
💡 To restore latest: npm run session:recover claude latest
```

### Recover from Checkpoint

Restore session from specific or latest checkpoint:

```bash
# Restore specific checkpoint
npm run session:recover claude 2026-01-06-14-30-00

# Restore latest checkpoint
npm run session:recover claude latest
```

**Output:**
```
📦 Current state backed up to: .claude/.session-state.json.backup-20260106-150500

✅ Session recovered from checkpoint: 2026-01-06-14-30-00

📋 Recovered Session:
   Agent: claude
   Task: Implement automated provider fallback
   Phase: implementation
   Branch: feat/auto-fallback
   Uncommitted files: 3
   Files in progress: 2

💡 Next steps:
   1. Review uncommitted changes: git status
   2. Resume work in claude
   3. Validate state: cat .claude/.session-state.json

⚠️  Warning: 3 uncommitted files detected
💡 Review changes: git status && git diff
```

## Workflow Integration

### Typical Development Session

```bash
# 1. Start development session
npm run dev &

# 2. Start auto-checkpoint
npm run checkpoint:start claude &

# 3. Work normally (checkpoints happen automatically every 30 minutes)
# ... develop features, fix bugs, etc ...

# 4. If interruption occurs (crash, rate limit, etc.)
npm run session:recover claude latest

# 5. Resume work with full context restored
# ... continue development ...

# 6. When done, stop checkpoint
npm run checkpoint:stop claude
```

### Cross-Agent Handoff with Recovery

```bash
# 1. Working in Claude Code, hit rate limit
npm run checkpoint:stop claude

# 2. Handoff to OpenCode (Groq)
npm run session:handoff claude opencode

# 3. Start checkpointing in new agent
npm run checkpoint:start opencode &

# 4. Continue work in OpenCode
# ... work continues ...

# 5. Later: Recover specific checkpoint if needed
npm run session:recover opencode 2026-01-06-16-00-00
```

## Technical Details

### Checkpoint Schema

Checkpoints extend the Session State v2.0 schema with additional metadata:

```json
{
  "version": "2.0.0",
  "agent": "claude",
  "lastUpdated": "2026-01-06T14:30:00Z",
  "session": {
    "taskDescription": "Implement automated provider fallback",
    "currentPhase": "implementation",
    "estimatedTimeRemaining": "2 hours",
    "git": {
      "branch": "feat/auto-fallback",
      "uncommittedFiles": 3,
      "lastCommit": "a1b2c3d"
    },
    "filesInProgress": ["src/lib/provider-fallback.ts", "tests/fallback.test.ts"]
  },
  "checkpoint": {
    "timestamp": "2026-01-06-14-30-00",
    "agent": "claude",
    "checkpointNumber": 5,
    "autoSaved": true
  }
}
```

### Auto-Cleanup Policy

- **Retention:** Last 10 checkpoints per agent
- **Cleanup:** Automatic on each new checkpoint
- **Storage:** Typically 50-100KB per checkpoint
- **Total:** ~500KB-1MB per agent

### Process Management

**PID Files:** `.git/agent-checkpoints/.auto-checkpoint-<agent>.pid`

- Tracks background process ID
- Enables graceful shutdown
- Cleaned up on process exit

**Signal Handling:**

- `SIGTERM` → Graceful shutdown + cleanup
- `SIGINT` → Immediate stop + cleanup
- `EXIT` → Remove PID file

## Safety Features

### Backup on Restore

When restoring a checkpoint, the current session state is automatically backed up:

```
.claude/.session-state.json → .claude/.session-state.json.backup-20260106-150500
```

This prevents accidental data loss if you restore the wrong checkpoint.

### Validation on Recovery

Recovery process validates:

1. **Checkpoint integrity** - JSON parsing succeeds
2. **Agent match** - Checkpoint agent matches target agent
3. **Git state** - Warns if uncommitted files detected
4. **File existence** - Verifies files in progress still exist

### Error Handling

**Scenario: No checkpoints available**

```
❌ No checkpoints found for claude
💡 Start auto-checkpoint: npm run checkpoint:start claude
```

**Scenario: Invalid checkpoint timestamp**

```
❌ Checkpoint not found: .git/agent-checkpoints/2026-01-06-99-99-99-claude.json
💡 List available: npm run session:recover claude
```

**Scenario: Process already running**

```
⚠️  Auto-checkpoint already running for claude (PID: 12345)
💡 Stop existing: npm run checkpoint:stop claude
```

## Best Practices

### ✅ Do

1. **Start checkpoint at beginning of session** - Don't wait for problems
2. **Use latest recovery for quick restore** - Most common use case
3. **Review git status after recovery** - Verify uncommitted changes
4. **Stop checkpoint when ending session** - Clean process management
5. **Commit work before long breaks** - Checkpoints complement, don't replace git

### ❌ Don't

1. **Don't rely solely on checkpoints** - Commit important work to git
2. **Don't manually edit checkpoint files** - Use recovery script only
3. **Don't commit checkpoint files** - They're local only (git-ignored)
4. **Don't run multiple checkpoint processes per agent** - Use single instance
5. **Don't ignore recovery warnings** - Uncommitted files need attention

## Troubleshooting

### Checkpoint Not Creating

**Symptoms:** No new checkpoint files appear after 30 minutes

**Diagnosis:**

```bash
# Check if process is running
ps aux | grep auto-checkpoint

# Check PID file
cat .git/agent-checkpoints/.auto-checkpoint-claude.pid

# Check session state exists
ls -la .claude/.session-state.json
```

**Solutions:**

1. Verify session state file exists
2. Restart checkpoint process
3. Check disk space (unlikely)

### Recovery Shows No Checkpoints

**Symptoms:** `npm run session:recover claude` shows no checkpoints

**Diagnosis:**

```bash
# Check directory exists
ls -la .git/agent-checkpoints/

# Check for any checkpoint files
ls -la .git/agent-checkpoints/*.json
```

**Solutions:**

1. Start auto-checkpoint process
2. Wait for first checkpoint (30 minutes by default)
3. Manually create checkpoint: `npm run session:save claude "Manual checkpoint"`

### Recovery Fails with JSON Error

**Symptoms:** `jq` parsing error during recovery

**Diagnosis:**

```bash
# Validate checkpoint JSON
cat .git/agent-checkpoints/2026-01-06-14-30-00-claude.json | jq .
```

**Solutions:**

1. Try different checkpoint
2. Use latest checkpoint
3. Manually restore from backup

## Performance Impact

**CPU:** Negligible (sleep loop with 30min interval)
**Memory:** <5MB per process
**Disk I/O:** ~50-100KB every 30 minutes
**Network:** None

**Recommendation:** Safe to run continuously during development sessions.

## Security Considerations

### Local Only

- Checkpoints stored in `.git/` (never pushed)
- Git-ignored by default
- No cloud sync

### Sensitive Data

- May contain file paths, branch names, task descriptions
- Does NOT contain file contents or code
- Review checkpoint before sharing (if needed)

### Cleanup

```bash
# Remove all checkpoints for an agent
rm .git/agent-checkpoints/*-claude.json

# Remove all checkpoints
rm -rf .git/agent-checkpoints/*.json

# Directory structure is preserved (.gitkeep)
```

## Integration with Existing Systems

### Session State v2.0

Checkpoints are 100% compatible with existing session state system:

- Same schema (with extra `checkpoint` field)
- Compatible with `session:save` / `session:restore`
- Works with `session:handoff`

### Agent Handoff

Checkpoints integrate seamlessly with agent handoff workflow:

```bash
# Standard handoff creates checkpoint automatically
npm run session:handoff claude opencode

# Can recover from pre-handoff state if needed
npm run session:recover claude <timestamp-before-handoff>
```

### Git Workflow

Checkpoints complement git workflow:

- **Git commits:** Permanent milestone snapshots
- **Checkpoints:** Temporary recovery points

Use both: Commit completed work, checkpoints handle interruptions.

## Roadmap

### Completed (v1.0)

- ✅ Auto-checkpoint background process
- ✅ Recovery interface with timestamp selection
- ✅ Process management (start/stop)
- ✅ Auto-cleanup (last 10 checkpoints)
- ✅ Backup on restore
- ✅ NPM script integration

### Planned (v1.1)

- 🔄 Smart interval adjustment (more frequent during active work)
- 🔄 Checkpoint compression (reduce disk usage)
- 🔄 Recovery validation (verify files still exist)

### Future (v2.0)

- 🔮 Checkpoint comparison (diff between checkpoints)
- 🔮 Merge checkpoints (combine context from multiple checkpoints)
- 🔮 Cloud backup option (optional S3/Dropbox sync)

## Related Documentation

- [Session State v2.0](/.opencode/SESSION_STATE_V2.md) - Base schema
- [Agent Handoff Workflow](/.opencode/scripts/session-handoff.sh) - Cross-agent transitions
- [Provider Fallback](/.opencode/workflows/COST_OPTIMIZATION.md) - When to switch agents

## Support

**Issues:**

- GitHub: [dcyfr-labs/issues](https://github.com/dcyfr-labs/dcyfr-labs/issues)
- Tag: `agent-recovery`

**Questions:**

- Discussion: Use in-IDE chat with Claude Code
- Reference: This document

---

**Last Updated:** January 6, 2026
**Maintainer:** DCYFR Labs Development Team
**Version:** 1.0.0
