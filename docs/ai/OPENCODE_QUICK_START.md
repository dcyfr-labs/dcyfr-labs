<!-- TLP:CLEAR -->

# OpenCode.ai Quick Start (5 Minutes)

## One-Time Setup

```bash
# Step 1: Create global config directory (1 min)
mkdir -p ~/.config/opencode

# Step 2: Copy team configuration template (1 min)
cp docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc ~/.config/opencode/opencode.jsonc

# Step 3: Set up local environment file (1 min)
cp .env.opencode.example ~/.env.opencode.local

# Step 4: Add your API credentials (2 min)
# Open ~/.env.opencode.local and add your credentials:
nano ~/.env.opencode.local

# Add these lines (get keys from your accounts):
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
# PERPLEXITY_API_KEY=ppl-xxxxxxxxxxxxxxxx

# Step 5: Verify setup (1 min)
opencode --show-config
# You should see: ✅ Configuration loaded successfully
```

**Total setup time: 5 minutes**

---

## Daily Usage

### Start a coding session

```bash
# Use default agent (balanced, recommended)
opencode

# Use quick-fix agent (faster, fewer tokens)
opencode --agent dcyfr-quick

# Use feature agent (most capable, more tokens)
opencode --agent dcyfr-feature

# Use content agent (for MDX/blog posts)
opencode --agent dcyfr-content
```

### During your session

```bash
# Show your current metrics
/metrics

# Check token budget status
/budget

# Save and exit
Ctrl+D or /exit

# Get help on commands
/help
```

### Monitor your usage

```bash
# Check token spending
./scripts/check-token-budget.sh

# View your today's metrics
cat ~/.opencode/metrics/tokens.jsonl | tail -20

# View daily report
cat ~/.opencode/reports/daily-tokens-$(date +%Y-%m-%d).json | jq .
```

---

## Essential Commands

| Command                           | Purpose                   |
| --------------------------------- | ------------------------- |
| `opencode`                        | Start with default agent  |
| `opencode --agent dcyfr-quick`    | Fast fixes (fewer tokens) |
| `opencode --agent dcyfr-feature`  | Full capabilities         |
| `opencode --show-config`          | View your configuration   |
| `opencode --check-mcp-health`     | Check server connections  |
| `./scripts/check-token-budget.sh` | Check token usage         |
| `opencode --help`                 | List all commands         |

---

## Keyboard Shortcuts (Available in Phase 3+)

| Key           | Action                |
| ------------- | --------------------- |
| `j/k`         | Next/previous message |
| `h/l`         | Previous/next section |
| `e`           | Edit message          |
| `c`           | Copy to clipboard     |
| `?`           | Show help             |
| `Ctrl+L`      | Clear screen          |
| `Enter`       | Send message          |
| `Shift+Enter` | New line              |
| `q`           | Quit                  |

---

## Troubleshooting

### "Command not found: opencode"

```bash
# Install globally
npm install -g opencode

# Or use with npx
npx opencode
```

### "Configuration not found"

```bash
# Check if global config exists
ls -la ~/.config/opencode/opencode.jsonc

# Check if project config exists
ls -la ./opencode.jsonc

# Both should exist
```

### "API key invalid"

```bash
# Check your environment file
cat ~/.env.opencode.local

# Verify the key is correct
grep ANTHROPIC_API_KEY ~/.env.opencode.local

# Update if needed
nano ~/.env.opencode.local
```

### "MCP server not responding"

```bash
# Check all servers
opencode --check-mcp-health

# It's OK if some remote servers are offline
# Local servers should be running
```

### "Token budget exceeded"

```bash
# Solution 1: Start a new session
exit

# Solution 2: Clear context in current session
/clear-context

# Check your budget
./scripts/check-token-budget.sh
```

---

## Next Steps

### Learn More

- [Full Team Training Guide](./OPENCODE_TEAM_TRAINING.md) - 30 min comprehensive guide
- [Configuration Hierarchy](./OPENCODE_CONFIG_HIERARCHY.md) - Understand how config layers work
- [Optimization Metrics](./OPENCODE_OPTIMIZATION_METRICS.md) - Monitor performance improvements

### Team Resources

- **Team Lead?** See [OPENCODE_TEAM_TRAINING.md](./OPENCODE_TEAM_TRAINING.md#for-team-leads-team-setup--monitoring)
- **DevOps?** See [OPENCODE_TEAM_TRAINING.md](./OPENCODE_TEAM_TRAINING.md#for-devops--cicd)
- **Support Needed?** See [OPENCODE_TEAM_TRAINING.md](./OPENCODE_TEAM_TRAINING.md#troubleshooting--support)

---

## Success Indicators

You'll know it's working when:

✅ `opencode --show-config` displays your merged configuration
✅ `opencode --check-mcp-health` shows green checkmarks
✅ `./scripts/check-token-budget.sh` shows "within budget"
✅ You can start a session with `opencode` and chat successfully
✅ Your daily metrics appear in `~/.opencode/reports/`

---

**Ready?** Start with step 1 above!

Questions? Check the [Full Training Guide](./OPENCODE_TEAM_TRAINING.md) or ask your team lead.
