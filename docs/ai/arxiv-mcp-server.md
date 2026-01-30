<!-- TLP:CLEAR -->

# arXiv MCP Server Integration

**Repository:** https://github.com/blazickjp/arxiv-mcp-server  
**Status:** ✅ **Working** (uses `uvx` instead of npm)  
**Last Updated:** December 28, 2025

---

## Overview

The arXiv MCP server provides AI assistants access to arXiv's research repository for searching and analyzing academic papers.

## Configuration

Added to `.vscode/mcp.json`:

```json
"arXiv": {
  "type": "stdio",
  "command": "uvx",
  "args": ["arxiv-mcp-server"]
}
```

**Note:** This server uses Python/uv tooling (`uvx`), not npm packages.

---

## Available Tools

### 1. **search_papers**
Search for papers with optional filters:

```javascript
{
  "query": "transformer architecture",
  "max_results": 10,
  "date_from": "2023-01-01",
  "categories": ["cs.AI", "cs.LG"]
}
```

### 2. **download_paper**
Download a paper by arXiv ID:

```javascript
{
  "paper_id": "2401.12345"
}
```

### 3. **list_papers**
View all downloaded papers (no arguments required)

### 4. **read_paper**
Access downloaded paper content:

```javascript
{
  "paper_id": "2401.12345"
}
```

---

## Prompts

### deep-paper-analysis
Comprehensive workflow for analyzing academic papers:

```javascript
{
  "paper_id": "2401.12345"
}
```

Includes:
- Executive summary
- Research context
- Methodology analysis
- Results evaluation
- Practical & theoretical implications
- Future research directions

---

## Key Features

- ✅ **Paper Search** - Query with date ranges and category filters
- ✅ **Local Storage** - Papers cached at `~/.arxiv-mcp-server/papers`
- ✅ **PDF to Markdown** - Automatic conversion for reading
- ✅ **Category Filtering** - Focus on specific domains (cs.AI, cs.LG, etc.)

---

## Common Categories

| Category | Description |
|----------|-------------|
| cs.AI | Artificial Intelligence |
| cs.LG | Machine Learning |
| cs.CL | Computation and Language (NLP) |
| cs.CV | Computer Vision |
| cs.RO | Robotics |
| cs.CR | Cryptography and Security |

---

## Usage Example

```
User: "Find recent papers on diffusion models"

AI uses: search_papers({
  "query": "diffusion models",
  "categories": ["cs.LG", "cs.CV"],
  "date_from": "2024-01-01",
  "max_results": 10
})

Then: download_paper({ "paper_id": "..." })
Then: read_paper({ "paper_id": "..." })
```

---

## Cost Savings Strategy

**Use arXiv Before Perplexity:**

1. ✅ **Academic papers** → arXiv (FREE)
2. ✅ **AI/ML research** → arXiv (FREE)
3. ⚠️ **Complex synthesis** → Perplexity (PAID - only when needed)

**Estimated Savings:** ~70% reduction in Perplexity API calls for research queries

---

## Environment Configuration

```bash
# Optional: Change storage location
export ARXIV_STORAGE_PATH="/custom/path/to/papers"

# Default storage: ~/.arxiv-mcp-server/papers
```

---

## Troubleshooting

**Server won't start:**
```bash
# Check uvx is available
uvx --version

# Test server manually
uvx arxiv-mcp-server
```

**Papers won't download:**
- Check internet connection
- Verify paper ID format (e.g., "2401.12345")
- Storage path must be writable

---

## Related Documentation

- [MCP Health Checks](mcp-checks.md)
- [Sync AI Validation Report](sync-ai-validation-report.md)
- [GitHub Repository](https://github.com/blazickjp/arxiv-mcp-server)

---

**Status:** Production Ready  
**Maintainer:** blazickjp (GitHub)  
**License:** Apache 2.0
