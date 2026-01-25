{/* TLP:CLEAR */}

# MCP Servers - dcyfr-labs

**Custom Model Context Protocol servers providing AI assistants with direct access to project-specific data and capabilities.**

---

## 🎯 Overview

dcyfr-labs has three custom MCP servers built with [fastmcp](https://www.npmjs.com/package/fastmcp):

| MCP Server | Purpose | Status |
|------------|---------|--------|
| **Analytics** | Redis analytics data access | ✅ Ready |
| **Design Tokens** | Token validation & compliance | 🚧 In Progress |
| **Content Manager** | MDX content querying & analysis | 📋 Planned |

---

## 🚀 Quick Start

### Testing a Server

```bash
# Test with MCP CLI (interactive terminal)
npm run mcp:dev:analytics

# Inspect with MCP Inspector (web UI)
npm run mcp:inspect:analytics

# Run as stdio server (for AI assistants)
npm run mcp:analytics
```

### Using with AI Assistants

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "Analytics": {
      "type": "stdio",
      "command": "npm",
      "args": ["run", "mcp:analytics"],
      "env": {
        "REDIS_URL": "${env:REDIS_URL}"
      }
    }
  }
}
```

---

## 📊 Analytics MCP

**Status:** ✅ Ready  
**File:** `src/mcp/analytics-server.ts`

### Tools (5 total)

#### `analytics:getPageViews`
Get page view data for specific paths or all pages.

**Parameters:**
- `path` (optional): Page path (e.g., `/blog`, `/work`)
- `timeRange` (optional): `"1h" | "24h" | "7d" | "30d" | "all"` (default: `"7d"`)

**Example:**
```
analytics:getPageViews path="/blog/engineering-psychology" timeRange="7d"
```

#### `analytics:getTrending`
Get trending content based on page views.

**Parameters:**
- `limit` (optional): Max results (default: 10)
- `timeRange` (optional): `"1h" | "24h" | "7d" | "30d" | "all"` (default: `"7d"`)

**Example:**
```
analytics:getTrending limit=5 timeRange="30d"
```

#### `analytics:getEngagement`
Get engagement metrics (clicks, shares, interactions).

**Parameters:**
- `contentType` (optional): Filter by content type (`blog`, `project`, `all`)
- `timeRange` (optional): `"1h" | "24h" | "7d" | "30d" | "all"` (default: `"7d"`)

**Example:**
```
analytics:getEngagement contentType="blog" timeRange="7d"
```

**Returns:**
```json
{
  "totalClicks": 245,
  "totalShares": 18,
  "totalInteractions": 312,
  "timeRange": "7d",
  "contentType": "blog"
}
```

#### `analytics:searchActivity`
Search activity logs by keyword, type, or date range.

**Parameters:**
- `query` (optional): Search keyword
- `activityType` (optional): Filter by activity type (`pageview`, `click`, `share`)
- `timeRange` (optional): `"1h" | "24h" | "7d" | "30d" | "all"` (default: `"24h"`)
- `limit` (optional): Max results (default: 50)

**Example:**
```
analytics:searchActivity query="TypeScript" activityType="pageview" timeRange="7d" limit=20
```

**Returns:**
```json
[
  {
    "id": "act_123",
    "type": "pageview",
    "timestamp": 1735423200000,
    "data": {
      "path": "/blog/typescript-patterns",
      "referrer": "google.com"
    }
  }
]
```

#### `analytics:getMilestones`
Get achievement milestones (production-aware).

**Parameters:**
- `includeTest` (optional): Include test milestones (ignored in production, default: false)

**Example:**
```
analytics:getMilestones includeTest=false
```

### Resources (3 total)

#### `analytics://recent`
Last 24h analytics summary (cached 1 minute)

**Returns:**
```json
{
  "totalViews": 1234,
  "topPages": [],
  "recentActivity": [],
  "milestones": [],
  "generatedAt": 1735423200000
}
```

#### `analytics://top-pages`
Most viewed pages sorted by traffic (cached 5 minutes)

**Returns:**
```json
{
  "topPages": [
    { "path": "/blog", "views": 523 },
    { "path": "/work", "views": 312 }
  ],
  "totalPages": 45,
  "generatedAt": 1735423200000
}
```

#### `analytics://engagement/summary`
Overall engagement statistics and trends (cached 5 minutes)

**Returns:**
```json
{
  "totalClicks": 245,
  "totalShares": 18,
  "totalInteractions": 312,
  "averageEngagementRate": 2.5,
  "generatedAt": 1735423200000
}
```

### Prompts (2 total)

#### `analytics-summary`
Generate comprehensive analytics summary with insights and trends.

**Arguments:**
- `timeRange` (optional): Time range for analysis (`24h`, `7d`, `30d`, `all`)

**Usage:**
```
Analyze dcyfr-labs analytics for the past 7d and provide insights
```

**What it does:**
- Guides AI to analyze traffic, engagement, and trends
- Suggests which tools to use for data gathering
- Prompts for actionable content strategy recommendations

#### `content-performance`
Analyze content performance to identify top and underperforming pieces.

**Arguments:**
- `contentType` (optional): Type of content (`blog`, `projects`, `all`)

**Usage:**
```
Analyze blog content performance and suggest optimizations
```

**What it does:**
- Identifies top performers and explains success factors
- Finds underperforming content with improvement suggestions
- Analyzes engagement patterns and content gaps
- Provides data-driven optimization recommendations

#### `analytics://top-pages`
Most viewed pages (cached 1 minute)

#### `analytics://milestones/production`
Production milestones only

---

## 🎨 Design Tokens MCP

**Status:** 🚧 In Progress  
**File:** `src/mcp/design-token-server.ts`

### Planned Tools

- `tokens:validate` - Validate code for token usage
- `tokens:suggest` - Get token recommendations for hardcoded values
- `tokens:getCompliance` - Check current compliance percentage
- `tokens:findUsages` - Find where a token is used
- `tokens:analyzeFile` - Analyze file for token compliance

---

## 📝 Content Manager MCP

**Status:** 📋 Planned  
**File:** `src/mcp/content-server.ts`

### Planned Tools

- `content:query` - Search blog posts/projects
- `content:analyze` - Analyze MDX content
- `content:findRelated` - Discover related content
- `content:getTopics` - Get topic taxonomy
- `content:search` - Full-text search

---

## 🧪 Testing

### Run All MCP Tests

```bash
npm run mcp:test
```

### Test Individual Components

```bash
# Unit tests
npm run test src/mcp/__tests__/analytics-server.test.ts

# Manual testing with CLI
npm run mcp:dev:analytics
# > analytics:getPageViews path=/blog timeRange=7d

# Integration testing with MCP Inspector
npm run mcp:inspect:analytics
```

---

## 🏗️ Architecture

```
AI Assistants (Copilot / DCYFR / Claude)
              ↓
       MCP Protocol (stdio)
              ↓
   Custom MCP Servers (Tools)
    ┌─────────┬──────────┬───────────┐
    │Analytics│  Design  │  Content  │
    │   MCP   │Token MCP │Manager MCP│
    └────┬────┴─────┬────┴─────┬─────┘
         │          │          │
    ┌────┴──────────┴──────────┴─────┐
    │         Data Layer              │
    │  Redis  │ design-  │ MDX Files │
    │         │tokens.ts │           │
    └─────────┴──────────┴───────────┘
```

---

## 📚 Documentation

- [Implementation Plan](../architecture/MCP_IMPLEMENTATION_PLAN.md) - Complete 30-day roadmap
- [Analytics MCP Docs](./ANALYTICS_MCP.md) - Detailed Analytics MCP reference
- [Design Token MCP Docs](./DESIGN_TOKEN_MCP.md) - Token validation patterns
- [Content Manager MCP Docs](./CONTENT_MANAGER_MCP.md) - Content querying guide

---

## 🔧 Development

### File Structure

```
src/mcp/
├── analytics-server.ts       # Analytics MCP (✅ Ready)
├── design-token-server.ts    # Design Token MCP (🚧 In Progress)
├── content-server.ts         # Content Manager MCP (📋 Planned)
├── shared/
│   ├── types.ts             # Shared TypeScript types
│   ├── utils.ts             # Common utilities
│   └── cache.ts             # Caching helpers
└── __tests__/
    ├── analytics-server.test.ts
    ├── design-token-server.test.ts
    └── content-server.test.ts
```

### Adding a New Tool

```typescript
server.addTool({
  name: "category:toolName",
  description: "What the tool does",
  parameters: z.object({
    param1: z.string().describe("Parameter description"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args, { log }) => {
    // Implementation
    return JSON.stringify(result, null, 2);
  },
});
```

### Adding a New Resource

```typescript
server.addResource({
  uri: "category://resource-name",
  name: "Human-readable name",
  mimeType: "application/json",
  description: "What the resource provides",
  async load() {
    const data = await fetchData();
    return { text: JSON.stringify(data, null, 2) };
  },
});
```

---

## 🎯 Success Metrics

### Performance Targets

- **Analytics MCP:** <500ms response time
- **Design Token MCP:** <200ms validation time
- **Content Manager MCP:** <300ms query time

### Quality Targets

- **Token suggestions:** >95% accuracy
- **Search relevance:** >90% accuracy
- **Cache hit rate:** >80%
- **AI assistant adoption:** >80%

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if Redis is accessible
echo $REDIS_URL

# Test Redis connection
npm run dev:health

# Verify TypeScript compiles
npm run typecheck
```

### Tools Not Responding

```bash
# Check server logs
npm run mcp:dev:analytics

# Verify tool is registered
# (should list all available tools)
```

### Performance Issues

```bash
# Clear cache
# Cache automatically expires, but can be manually cleared on restart

# Check Redis latency
# Ensure Redis is local or low-latency connection
```

---

## 📖 Resources

- **fastmcp Documentation:** https://www.npmjs.com/package/fastmcp
- **MCP Specification:** https://modelcontextprotocol.io/
- **MCP Inspector:** https://github.com/modelcontextprotocol/inspector

---

**Status:** Phase 1 (Analytics MCP) Complete ✅  
**Next:** Phase 2 (Design Token MCP) 🚧  
**Updated:** December 28, 2025
