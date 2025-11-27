# Filesystem & Git MCP Quick Reference

**Status**: ✅ Ready  
**Integrated**: October 18, 2025

---

## 🚀 Quick Start

### Filesystem MCP Commands

| Task | Prompt |
|------|--------|
| Browse directory | "What files are in `src/components`?" |
| View file | "Show me `src/lib/rate-limit.ts`" |
| Find files | "Find all TypeScript files in src/app/api" |
| Create file | "Create a new file at `src/data/skills.ts`" |
| Edit file | "Update the description in `src/data/resume.ts`" |
| Delete file | "Remove the old component at `src/components/old-button.tsx`" |
| Move file | "Rename `src/lib/utils.ts` to `src/lib/helpers.ts`" |
| List structure | "Show me the entire src directory structure" |

### Git MCP Commands

| Task | Prompt |
|------|--------|
| View history | "Show recent commits" |
| See changes | "What changed in the last commit?" |
| Compare branches | "Show diff between main and preview" |
| Branch status | "What branches exist?" |
| File history | "When was `rate-limit.ts` last modified?" |
| Specific commit | "Show me the CSP implementation commit" |
| Who changed | "Who last modified `middleware.ts` and when?" |
| Recent changes | "What's been changed in the last 5 commits?" |

---

## 🔄 Common Workflows

### Workflow 1: Understanding Recent Changes
```
You: "What changed recently in security-related files?"
  ↓
Git MCP: Shows recent commits
  ↓
You: "Show me the CSP implementation changes"
  ↓
Git MCP: Shows full diff
Filesystem MCP: Displays current file
```

### Workflow 2: Adding a New Feature
```
You: "Navigate to the API routes"
  ↓
Filesystem MCP: Shows src/app/api structure
  ↓
You: "Create a new route for analytics"
  ↓
Filesystem MCP: Creates the file
  ↓
You: "Show me the new file"
  ↓
Filesystem MCP: Displays the created file
```

### Workflow 3: Code Review
```
You: "Show me what's in the preview branch"
  ↓
Git MCP: Lists commits since main
  ↓
You: "What's the diff for the contact form changes?"
  ↓
Git MCP: Shows changes to contact form
Filesystem MCP: Shows current implementation
```

### Workflow 4: Debugging
```
You: "Find all rate limiting code"
  ↓
Filesystem MCP: Searches and finds files
  ↓
You: "Show me rate-limit.ts"
  ↓
Filesystem MCP: Displays file
  ↓
You: "When was this last changed?"
  ↓
Git MCP: Shows commit history for that file
```

---

## 💡 Pro Tips

### Filesystem MCP
- **Combine with Sequential Thinking**: "Find all Button usages and plan a refactoring"
- **Search first**: Always ask to find files before editing
- **Use patterns**: "Find all .tsx files in components/"
- **Verify before delete**: Always review before removing files
- **Keep diffs**: Use Git MCP to track changes

### Git MCP
- **Check status first**: Always ask "What branch am I on?"
- **Understand context**: Check recent commits before making changes
- **Compare carefully**: Use diff to understand what changed
- **Document changes**: Reference related commits in commit messages
- **Use for learning**: Review commits to understand code evolution

### Combined Power
- **Filesystem + Git**: "Show me all changes to components since last Thursday"
- **Filesystem + Sequential**: "Find all API routes and document them"
- **Git + Sequential**: "Analyze the commits related to CSP and explain the changes"

---

## ⚠️ Common Gotchas

| Problem | Solution |
|---------|----------|
| "Can't find file" | Use Filesystem to list directory first |
| "Git shows nothing" | Make sure you're in the repo; check git status |
| "Permission denied" | Check file permissions; git handles its own |
| "Too many results" | Use more specific search patterns |
| "File doesn't exist" | Use Filesystem to verify path first |

---

## 🔒 Security Reminders

✅ **Safe to use**:
- Both MCPs work locally
- No credentials exposed
- No external API calls
- All tracked by git

❌ **Avoid**:
- Don't try to access files outside the project
- Don't commit sensitive data
- Don't use git/filesystem to handle secrets
- Use environment variables instead

---

## 📊 Quick Reference

### Project Structure (Filesystem)
```
dcyfr-labs/
├── src/
│   ├── app/           ← Page routes
│   ├── components/    ← React components  
│   ├── content/       ← MDX blog posts
│   ├── data/          ← Static data
│   └── lib/           ← Utilities
├── docs/              ← Documentation
├── scripts/           ← Build scripts
└── public/            ← Static assets
```

### Recent Activity (Git)
```
Latest commits typically include:
- Content updates (blog, resume)
- Security improvements (CSP, rate limiting)
- Feature additions (blog search, view counts)
- Performance optimizations
```

---

## 🎯 Use Case Examples

### Content Updates
**Question**: "What markdown files exist in content/blog?"  
**Workflow**: Filesystem MCP → Browse structure → Edit file → Git MCP → Review changes

### Code Improvements
**Question**: "Show me all TypeScript errors from the last commit"  
**Workflow**: Git MCP → Show commit → Filesystem MCP → View affected files → Sequential Thinking → Plan fixes

### Feature Development
**Question**: "I want to add a new page. What's the pattern in src/app?"  
**Workflow**: Filesystem MCP → Show structure → View example page → Create new page → Git MCP → Verify

### Security Review
**Question**: "What security changes were made recently?"  
**Workflow**: Git MCP → Show commits with "security" in message → Filesystem MCP → View implementation → Sequential Thinking → Analyze

---

## 🚦 Next Steps

1. **Try basic commands**:
   - Filesystem: "What's in src/components?"
   - Git: "Show recent commits"

2. **Combine MCPs**:
   - "Find all blog posts and when they were modified"
   - "Show me all changes to the rate limiting since Tuesday"

3. **Use in workflows**:
   - Next feature development
   - Code reviews
   - Debugging issues

4. **Advanced usage**:
   - Automation scripts
   - Bulk refactoring
   - Release planning

---

## 📚 Full Documentation

For detailed guides, see:
- **Complete Guide**: `docs/mcp/filesystem-git/integration.md`
- **Setup Guide**: `docs/mcp/servers.md`
- **Project Guide**: `agents.md`

---

## 🆘 Troubleshooting

### Filesystem MCP Not Working
```bash
# Check if directory is correct
ls /project-folder  # replace with your project path

# Verify in mcp.json
cat ~/Library/Application\ Support/Code/User/mcp.json | grep filesystem
```

### Git MCP Not Working
```bash
# Check if we're in a git repo
cd /project-folder  # replace with your project path
git status

# Verify git is installed
which git
git --version
```

### Still Having Issues?
- Restart VS Code
- Check the full integration guide
- Review console for error messages

---

**Last Updated**: October 18, 2025  
**Status**: ✅ Ready for Use  
**Next MCPs to Add**: GitHub, Discord
