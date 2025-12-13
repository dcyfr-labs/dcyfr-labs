# Filesystem MCP Implementation Plan

## Overview

**Package**: `@modelcontextprotocol/server-filesystem`  
**Type**: stdio  
**Priority**: High (Tier 1)  
**Complexity**: ⭐ Easy

The Filesystem MCP provides secure, sandboxed file system operations within VS Code, perfect for managing MDX content, organizing blog posts, and automating content workflows.

---

## Installation & Configuration

### Step 1: Add to mcp.json

```jsonc
{
  "servers": {
    // ... existing servers ...
    "Filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "src/content/blog",
        "public"
      ],
      "type": "stdio",
      "disabled": false
    }
  }
}
```

**Note**: Update paths to absolute paths for your system. The server only has access to explicitly allowed directories for security.

### Step 2: Restart VS Code

After adding the configuration, restart VS Code to load the new MCP server.

### Step 3: Verify Installation

Ask Copilot: "List all MDX files in the blog directory"

---

## Security Configuration

### Allowed Directories

Filesystem MCP uses **allowlist-only access**. Only specify directories you want the AI to access:

**Recommended for this project**:
```jsonc
"args": [
  "-y",
  "@modelcontextprotocol/server-filesystem",
  "src/content/blog",      // Blog posts
  "public/blog/images",    // Blog images
  "docs",                  // Documentation
  "src/data"               // Data files
]
```

**DO NOT include**:
- `.env` files or directories with secrets
- `node_modules`
- `.git` directory
- System directories

---

## Use Cases for This Project

### 1. MDX Content Management

**Create Post from Template**
```
Prompt: "Create a new blog post about Next.js 16 features using our standard template"
```

**Expected Result**:
- New file: `src/content/blog/nextjs-15-features.mdx`
- Includes proper frontmatter structure
- Pre-filled with sections and placeholders

**Bulk Update Frontmatter**
```
Prompt: "Add 'updatedAt' field to all blog posts that don't have it"
```

**Expected Result**:
- Scans all MDX files
- Adds `updatedAt: YYYY-MM-DD` to frontmatter
- Reports which files were updated

### 2. Content Organization

**Organize by Date**
```
Prompt: "Move all 2024 blog posts into a 2024 subdirectory"
```

**Expected Result**:
- Creates `src/content/blog/2024/` if needed
- Moves posts based on frontmatter date
- Updates any internal references

**Clean Up Unused Images**
```
Prompt: "List all images in public/blog/images that aren't referenced in any blog post"
```

**Expected Result**:
- Scans all MDX files for image references
- Lists orphaned images
- Optionally moves them to `public/blog/images/unused/`

### 3. Content Analysis

**Reading Time Analysis**
```
Prompt: "Show me all posts with reading time over 15 minutes"
```

**Tag Distribution**
```
Prompt: "Create a report of tag usage across all blog posts"
```

**Content Audit**
```
Prompt: "Find all draft posts that are older than 6 months"
```

### 4. Batch Operations

**Update Tags**
```
Prompt: "Rename tag 'javascript' to 'JavaScript' across all posts"
```

**Add Featured Images**
```
Prompt: "List all posts without a featuredImage field"
```

**Archive Old Posts**
```
Prompt: "Mark all posts from 2023 as archived in their frontmatter"
```

### 5. Documentation Maintenance

**Generate Index**
```
Prompt: "Create an index of all documentation files in /docs with descriptions"
```

**Link Validation**
```
Prompt: "Find all internal links in documentation that point to non-existent files"
```

**Cross-Reference Check**
```
Prompt: "List documentation files that aren't referenced in INDEX.md"
```

---

## Integration with Existing Workflow

### With Blog System (`src/lib/blog.ts`)

Filesystem MCP complements the blog system by:
- **Pre-publication checks**: Validate frontmatter before posts go live
- **Content migration**: Safely move/rename posts
- **Metadata updates**: Bulk update post metadata

### With Data Files (`src/data/`)

- Update `projects.ts` by scanning project directories
- Sync resume data from external sources
- Generate data files from templates

### With Documentation (`/docs`)

- Maintain documentation structure
- Generate table of contents
- Cross-reference validation

---

## Example Commands for This Project

### Content Creation
- "Create a new blog post template about [topic]"
- "Generate a draft post with frontmatter for [topic]"
- "Copy the structure from [post-name] to create a new post"

### Content Management
- "Show me all draft posts"
- "List posts without featured images"
- "Find posts with the tag 'react' that don't have 'React' in the title"

### Content Migration
- "Move all archived posts to an archive subdirectory"
- "Rename all .md files to .mdx"
- "Update image paths from old structure to new structure"

### Quality Assurance
- "Check all posts have required frontmatter fields"
- "Find posts with TODO or FIXME comments"
- "List posts with broken internal links"

### Reporting
- "Generate a monthly content report (posts created by month)"
- "Show tag distribution across all posts"
- "List the 10 longest blog posts"

---

## Best Practices

### ✅ Do's
- ✅ **Always verify changes**: Ask for a preview before bulk operations
- ✅ **Use git**: Commit before bulk operations so you can revert
- ✅ **Be specific**: Provide clear criteria for file operations
- ✅ **Test on one file first**: Before bulk operations, test on a single file

### ❌ Don'ts
- ❌ **Don't give access to sensitive directories**: No `.env`, `node_modules`, `.git`
- ❌ **Don't skip backups**: Always commit or backup before bulk changes
- ❌ **Don't assume file formats**: Specify if you want MDX, JSON, etc.
- ❌ **Don't delete without verification**: Always list files to be deleted first

---

## Troubleshooting

### "Permission denied" Errors

**Cause**: Directory not in allowed list

**Solution**: Add the directory to the `args` array in `mcp.json`

### "File not found" Errors

**Cause**: Using relative paths instead of absolute paths

**Solution**: Ensure all paths in `mcp.json` are absolute

### Files Not Visible to MCP

**Cause**: Directory not in allowlist or MCP not restarted

**Solution**:
1. Add directory to `mcp.json`
2. Restart VS Code
3. Verify with "List files in [directory]"

---

## Testing the Implementation

### Test 1: Basic File Listing
```
Prompt: "List all MDX files in the blog content directory"
Expected: List of all .mdx files with paths
```

### Test 2: Read File Content
```
Prompt: "Show me the frontmatter of the most recent blog post"
Expected: Display of frontmatter fields
```

### Test 3: File Analysis
```
Prompt: "Count how many blog posts have 'featured: true' in their frontmatter"
Expected: Numeric count with list of matching posts
```

### Test 4: Safe Write Operation
```
Prompt: "Create a test.txt file in the blog directory with the text 'test'"
Expected: File created successfully (then manually verify and delete)
```

---

## Advanced Use Cases

### 1. Automated Content Workflow

Create a workflow for new posts:
```
1. "Create new post template for [topic]"
2. "Add it to the editorial calendar in content management system"
3. "Generate a matching featured image placeholder"
```

### 2. Content Quality Gates

Before publishing:
```
1. "Check this post has all required frontmatter fields"
2. "Verify all internal links work"
3. "Ensure reading time is under 15 minutes"
```

### 3. Scheduled Content Maintenance

Monthly tasks:
```
1. "Archive posts older than 2 years"
2. "Generate monthly content report"
3. "Update 'updatedAt' for modified posts"
```

---

## Performance Considerations

- **Fast**: File operations are local, no network latency
- **Safe**: Sandboxed to specified directories only
- **Efficient**: Can handle hundreds of files quickly
- **Atomic**: Operations complete or fail, no partial states

---

## Maintenance

### Regular Checks
- Verify allowed directories are still correct
- Update paths if project structure changes
- Review file operation logs periodically

### Updates
```bash
# Update to latest version
npx -y @modelcontextprotocol/server-filesystem --version

# MCP will auto-update on next use with -y flag
```

---

## Next Steps After Implementation

1. **Test basic operations** (list, read, analyze)
2. **Create content templates** for common post types
3. **Set up quality checks** for frontmatter validation
4. **Document custom workflows** specific to your needs

---

## Related Documentation

- [MCP Servers Overview](../servers)
- [Blog System Architecture](../../blog/architecture)
- [Content Creation Guide](../../blog/content-creation)
- [Frontmatter Schema](../../blog/frontmatter-schema)

---

**Status**: Ready to implement  
**Estimated Setup Time**: 10 minutes  
**Estimated ROI**: High - immediate productivity gains for content management
