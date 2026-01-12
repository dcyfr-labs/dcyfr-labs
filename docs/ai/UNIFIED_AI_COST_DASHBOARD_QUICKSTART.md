# Unified AI Cost Dashboard - Quick Start

## 30-Second Setup

1. **Start the dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **View the dashboard** (choose one):
   - **Web UI:** Open `http://localhost:3000/dev/unified-ai-costs`
   - **Terminal:** Run `npm run ai:costs`

3. **That's it!** The dashboard displays live cost data across Claude Code, GitHub Copilot, and OpenCode.

## Common Tasks

### See Current Costs
```bash
npm run ai:costs
```

### View Last 7 Days
```bash
npm run ai:costs view 7d
```

### Export for Spreadsheets
```bash
npm run ai:costs export:csv 30d costs.csv
```

### Export for Archival
```bash
npm run ai:costs export:json 30d costs.json
```

### Get Help
```bash
npm run ai:costs help
```

## What You're Looking At

The dashboard shows:

- **Total Cost** - Sum of all AI tool spending
- **Sessions** - Number of times each tool was used
- **Tokens** - Language model tokens consumed
- **Budget Used** - Percentage of $520/month budget
- **Recommendations** - Cost optimization suggestions

## Key Metrics at a Glance

| Tool | Cost Model | Budget |
|------|-----------|--------|
| Claude Code | $3 per 1M tokens | $480/mo |
| GitHub Copilot | Flat $20/month | $20/mo |
| OpenCode.ai | $0 (free models) | $20/mo |
| **Total** | **Mix** | **$520/mo** |

## Cost Optimization Tips

1. **Use OpenCode for routine work** → Saves $3.00 vs Claude
2. **Reserve Claude for complex tasks** → Higher quality output
3. **Monitor violation rates** → Lower = better cost efficiency
4. **Check recommendations** → Dashboard suggests improvements

## Dashboard Tour

### Summary Cards (Top)
Show total cost, sessions, tokens, most-used tool, and estimated monthly total.

### Charts (Middle)
- **Pie Chart:** Cost breakdown by source
- **Bar Chart:** Session count by tool

### Detailed Metrics (Below Charts)
Tool-specific stats including sessions, tokens, quality scores, and compliance rates.

### Recommendations (Bottom)
Automatic suggestions for cost savings and quality improvements.

## Web Dashboard Features

- **Period Selector:** Switch between 7d, 30d, 90d, all-time views
- **Auto-Refresh:** Updates every 60 seconds
- **Color-Coded Severity:** Red = critical, Yellow = warning, Green = info

## CLI Output Example

```
Unified AI Cost Dashboard (30d)
═══════════════════════════════════════════════════════════
Summary
───────────────────────────────
Total Cost:    $20.00 (3.8% of budget)
Sessions:       2 ($10.00/session)
Tokens:         0K (0.0K/session)
Most Used:      OPENCODE
Est. Monthly:    $600.00

Claude Code
───────────────────────────────
  Sessions:    0
  Success:     0.0%
  Tokens:      0
  Cost:        $0.00

[... more details ...]

Recommendations
───────────────────────────────
✓ OpenCode Optimized for Cost
  All sessions use free models. Continue this strategy.
```

## Files & Locations

| Item | Location |
|------|----------|
| Web Dashboard | `/dev/unified-ai-costs` |
| API Endpoint | `/api/dev/ai-costs/unified` |
| CLI Script | `scripts/unified-ai-costs.mjs` |
| Aggregator Logic | `src/lib/unified-cost-aggregator.ts` |
| Full Documentation | `docs/ai/UNIFIED_AI_COST_DASHBOARD.md` |

## Troubleshooting

**No data showing?**
- Run `npm run opencode:track log '{"task":"feature","duration":1800,"quality":5}'` to add sample data
- Refresh the page (wait up to 60 seconds for auto-refresh)

**API not responding?**
- Verify dev server: `npm run dev`
- Check: `curl http://localhost:3000/api/dev/ai-costs/unified`

**CLI command not found?**
- Run `npm install` to reinstall dependencies
- Verify Node.js 18+: `node --version`

## Next Steps

1. **Monitor your costs** - Check dashboard weekly
2. **Set budget alerts** - Track spending against $520/mo limit
3. **Review recommendations** - Implement cost optimizations
4. **Export reports** - Archive monthly CSV for analysis

## Where to Get Help

- **Full docs:** `docs/ai/UNIFIED_AI_COST_DASHBOARD.md`
- **Source code:** `src/lib/unified-cost-aggregator.ts`
- **API response:** Visit `/api/dev/ai-costs/unified?period=30d` in browser

---

**Time to first dashboard view:** ~30 seconds ⚡
**All CLI commands working:** ✅ Yes
**Cost tracking active:** ✅ Yes

Happy cost tracking!
