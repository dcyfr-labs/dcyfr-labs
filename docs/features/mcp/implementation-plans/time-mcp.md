# Time MCP Implementation Plan

## Overview

**Package**: `@modelcontextprotocol/server-time` (or similar)  
**Type**: stdio  
**Priority**: Medium (Tier 2)  
**Complexity**: ⭐ Easy

The Time MCP provides timezone handling, date calculations, and scheduling utilities - essential for managing blog post publishing schedules, handling international audiences, and automating time-based content workflows.

**Note**: As of writing, an official Time MCP may not exist. This plan covers either using an existing time utility MCP or creating a custom one.

---

## Installation & Configuration

### Option 1: Official Time MCP (if available)

```jsonc
{
  "servers": {
    // ... existing servers ...
    "Time": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-time"
      ],
      "type": "stdio",
      "disabled": false
    }
  }
}
```

### Option 2: Custom Time MCP (Recommended)

If no official MCP exists, create a simple custom one:

**Location**: `scripts/mcp-time-server.mjs`

```javascript
#!/usr/bin/env node

// Simple Time MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'time-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Get current time in timezone
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_time') {
    const { timezone = 'UTC' } = request.params.arguments || {};
    const date = new Date();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          utc: date.toISOString(),
          timezone: timezone,
          local: date.toLocaleString('en-US', { timeZone: timezone }),
          unix: Math.floor(date.getTime() / 1000)
        })
      }]
    };
  }
  
  // Add more time tools as needed...
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Then configure**:
```jsonc
"Time": {
  "command": "node",
  "args": [
    "/absolute/path/to/scripts/mcp-time-server.mjs"
  ],
  "type": "stdio",
  "disabled": false
}
```

### Option 3: Use Existing Tools

Leverage built-in AI capabilities for basic time operations without a dedicated MCP.

---

## Use Cases for This Project

### 1. Blog Post Scheduling

**Calculate Publication Time**
```
Prompt: "What time is it now in PST? I want to schedule a post for 9 AM PST tomorrow"
```

**Expected Result**:
- Current PST time
- Target publication time in UTC (for storage)
- Countdown to publication

**Timezone Conversion**
```
Prompt: "Convert 9 AM Pacific to Eastern, Central, and UTC"
```

**Expected Result**:
- 9:00 AM PST
- 12:00 PM EST
- 11:00 AM CST
- 5:00 PM UTC

### 2. Content Calendar Management

**Calculate Days Until Deadline**
```
Prompt: "How many days until December 31, 2025?"
```

**Expected Result**:
- Days remaining
- Business days remaining
- Percentage of year complete

**Generate Publishing Schedule**
```
Prompt: "Generate a bi-weekly publishing schedule for the next 3 months, posting every Tuesday at 9 AM PST"
```

**Expected Result**:
- List of publication dates
- Times in multiple timezones
- ISO 8601 timestamps for frontmatter

### 3. International Audience Handling

**Best Time to Publish**
```
Prompt: "What time should I publish to reach both US East Coast (9 AM) and Europe (6 PM) audiences?"
```

**Expected Result**:
- Optimal UTC time
- Local times for key regions
- Audience reach analysis

**Timezone Reference**
```
Prompt: "Create a table showing 9 AM in major developer cities worldwide"
```

**Expected Result**:
| City | Timezone | 9 AM Local | UTC |
|------|----------|------------|-----|
| San Francisco | PST | 9:00 AM | 5:00 PM |
| New York | EST | 9:00 AM | 2:00 PM |
| London | GMT | 9:00 AM | 9:00 AM |
| Berlin | CET | 9:00 AM | 8:00 AM |
| Tokyo | JST | 9:00 AM | 12:00 AM |

### 4. Frontmatter Date Management

**Generate Timestamps**
```
Prompt: "Generate publishedAt and updatedAt timestamps for a post I'm publishing now"
```

**Expected Result**:
```yaml
publishedAt: '2025-11-11T17:00:00.000Z'
updatedAt: '2025-11-11T17:00:00.000Z'
```

**Update Timestamps**
```
Prompt: "Update the updatedAt timestamp for this post to now"
```

**Expected Result**:
- Current ISO 8601 timestamp
- Formatted for YAML frontmatter
- Ready to paste into MDX file

### 5. Analytics Time Windows

**Define Report Periods**
```
Prompt: "Give me the start and end timestamps for last month"
```

**Expected Result**:
```javascript
{
  start: '2025-10-01T00:00:00.000Z',
  end: '2025-10-31T23:59:59.999Z',
  label: 'October 2025'
}
```

**Calculate Time Ranges**
```
Prompt: "Calculate the last 24 hours, 7 days, and 30 days from now in Unix timestamps"
```

**Expected Result**:
```javascript
{
  last24h: 1699660800,
  last7d: 1699056000,
  last30d: 1696464000,
  now: 1699747200
}
```

---

## Integration with Existing Workflow

### With Blog System

**Post Scheduling**:
```
Workflow:
1. "Generate publication timestamp for Tuesday 9 AM PST"
2. "Add to post frontmatter as publishedAt"
3. "Set reminder to publish"
```

**Content Calendar**:
```
Workflow:
1. "Generate next 12 Tuesday dates"
2. "Create content calendar in /docs/operations/content-calendar.md"
3. "Add ISO timestamps for each date"
```

### With Inngest (Background Jobs)

**Schedule Delayed Jobs**:
```
Prompt: "Calculate Unix timestamp for 7 days from now for Inngest job scheduling"
```

**Cron Expression Helper**:
```
Prompt: "Convert 'every Tuesday at 9 AM PST' to a cron expression in UTC"
```

**Expected Result**: `0 17 * * 2` (Tuesdays at 5 PM UTC = 9 AM PST)

### With Analytics

**Report Time Windows**:
```
Workflow:
1. "Get start/end timestamps for this month"
2. "Query Redis for view counts in this range"
3. "Generate monthly analytics report"
```

---

## Example Commands for This Project

### Publishing
- "What time is 9 AM Pacific in UTC?"
- "Generate publication timestamp for next Monday"
- "Convert this ISO timestamp to human-readable format"

### Scheduling
- "Create a bi-weekly schedule for the next quarter"
- "What's the best time to publish for US and European audiences?"
- "Calculate days remaining until end of year"

### Frontmatter
- "Generate current ISO 8601 timestamp"
- "Update this post's updatedAt to now"
- "Format this date for YAML frontmatter"

### Analytics
- "Give me Unix timestamps for last 30 days"
- "Calculate start/end of last month"
- "What was the date 90 days ago?"

### Timezones
- "Show me 2 PM EST in all US timezones"
- "What time is it now in Tokyo, London, and San Francisco?"
- "Create timezone reference table for developers"

---

## Advanced Use Cases

### 1. Automated Post Scheduling

Create a scheduling workflow:
```
Prompt: "For each draft post:
1. Calculate next available Tuesday at 9 AM PST
2. Generate publishedAt timestamp
3. Update frontmatter
4. Add to content calendar"
```

### 2. Time-based Content Triggers

Inngest job scheduling:
```
Prompt: "Calculate timestamps for:
- Publishing this post (9 AM PST tomorrow)
- Social media promotion (1 hour after publish)
- Follow-up email (3 days after publish)"
```

### 3. Analytics Automation

Monthly reporting:
```
Prompt: "On the 1st of each month:
1. Calculate previous month date range
2. Generate analytics for that period
3. Format report with human-readable dates"
```

### 4. Content Freshness Tracking

Update reminders:
```
Prompt: "Find all posts with updatedAt > 6 months ago"
Result: List of posts that need review
```

---

## Best Practices

### ✅ Do's

- ✅ **Always store times in UTC**: Convert to local for display only
- ✅ **Use ISO 8601 format**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- ✅ **Include timezone in displays**: "9 AM PST" not just "9 AM"
- ✅ **Calculate server time for scheduled jobs**: Inngest runs in UTC
- ✅ **Document timezone decisions**: In content strategy docs

### ❌ Don'ts

- ❌ **Don't store local times**: Always UTC internally
- ❌ **Don't assume reader timezone**: Provide multiple timezones
- ❌ **Don't hard-code offsets**: Use proper timezone names
- ❌ **Don't forget DST**: Timezone libraries handle automatically
- ❌ **Don't mix formats**: Stick to ISO 8601

---

## Time Utilities Reference

### Common Conversions

**PST/PDT to UTC** (Pacific):
- PST (winter): UTC - 8 hours
- PDT (summer): UTC - 7 hours

**EST/EDT to UTC** (Eastern):
- EST (winter): UTC - 5 hours
- EDT (summer): UTC - 4 hours

**Best Practice**: Use timezone names, not offsets

### ISO 8601 Format

**Full timestamp**: `2025-11-11T17:30:00.000Z`
**Date only**: `2025-11-11`
**Time only**: `17:30:00`

### Unix Timestamp

**Current time**: `Math.floor(Date.now() / 1000)`
**From ISO**: `Math.floor(new Date('2025-11-11T17:30:00Z').getTime() / 1000)`
**To Date**: `new Date(timestamp * 1000)`

---

## Implementation Without MCP

### Using AI Directly

If no Time MCP is available, you can still use AI for time operations:

```
Prompt: "Convert 9 AM PST on November 11, 2025 to ISO 8601 UTC"
```

AI can handle:
- Timezone conversions
- Date calculations
- Format conversions
- Schedule generation

### Using Node.js Scripts

Create utility scripts for common operations:

**`scripts/generate-timestamp.mjs`**:
```javascript
#!/usr/bin/env node
const date = new Date();
console.log(date.toISOString());
```

**`scripts/timezone-convert.mjs`**:
```javascript
#!/usr/bin/env node
const date = new Date(process.argv[2]);
console.log({
  utc: date.toISOString(),
  pst: date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
  est: date.toLocaleString('en-US', { timeZone: 'America/New_York' })
});
```

---

## Testing

### Test 1: Current Time
```
Prompt: "What time is it now in UTC and PST?"
Expected: Current times in both timezones
```

### Test 2: Timezone Conversion
```
Prompt: "Convert 9 AM PST to UTC on December 25, 2025"
Expected: 5:00 PM UTC (winter, PST = UTC-8)
```

### Test 3: Timestamp Generation
```
Prompt: "Generate ISO 8601 timestamp for right now"
Expected: Current time in format 2025-11-11T17:30:00.000Z
```

### Test 4: Date Calculation
```
Prompt: "How many days until January 1, 2026?"
Expected: Number of days + date
```

---

## Integration with Content Strategy

### Publishing Schedule

Define in content management system:
```markdown
## Publishing Schedule
- **Frequency**: Bi-weekly (every other Tuesday)
- **Time**: 9:00 AM PST / 12:00 PM EST / 5:00 PM UTC
- **Target Audience**: US developers (East & West Coast)
- **Rationale**: Morning coffee reading on US East Coast, early afternoon on West Coast
```

### Content Calendar

Example structure:
```markdown
## Q1 2026 Content Calendar

| Date | Day | Time (PST) | Time (UTC) | Topic | Status |
|------|-----|------------|------------|-------|--------|
| Jan 7 | Tue | 9:00 AM | 5:00 PM | Next.js 16 | Planned |
| Jan 21 | Tue | 9:00 AM | 5:00 PM | React 19 | Draft |
| Feb 4 | Tue | 9:00 AM | 5:00 PM | TypeScript | Idea |
```

---

## Maintenance

### Regular Tasks

**Weekly**:
- Verify scheduled posts have correct timestamps
- Check timezone conversions for upcoming posts

**Monthly**:
- Review and update content calendar
- Generate next month's publishing schedule

**Quarterly**:
- Audit post timestamps for consistency
- Update publishing strategy if audience shifts

---

## Next Steps After Implementation

1. **Define publishing schedule** with specific times and timezones
2. **Create content calendar template** with timestamps
3. **Document timezone strategy** for international audience
4. **Integrate with Inngest** for automated scheduling
5. **Add timezone helpers** to blog workflow documentation

---

## Related Documentation

- [Inngest Integration](../../features/inngest-integration)
- [Blog System Architecture](../../blog/architecture)
- [Frontmatter Schema](../../blog/frontmatter-schema)

---

**Status**: Ready to implement (using AI directly or custom MCP)  
**Estimated Setup Time**: 15 minutes (custom MCP) or 0 (use AI directly)  
**Monthly Cost**: $0  
**Estimated ROI**: Medium - useful for scheduling and international audiences
