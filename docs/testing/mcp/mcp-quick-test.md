<!-- TLP:CLEAR -->

# MCP Quick Test Script

Copy-paste this into **Claude Chat** (claude.ai) to test all MCP servers at once:

---

## Full MCP Test Suite

Please run these tests sequentially and report which MCPs work:

**1. Perplexity Test**
Search for "Next.js 16 App Router features 2025" using Perplexity

**2. Context7 Test**
Using Context7, look up the React useTransition hook documentation

**3. Playwright Test**
Using Playwright, navigate to https://example.com and tell me the page title

**4. Axiom Test**
Using Axiom, query my logs from the last 24 hours (show first 5 entries)

**5. Filesystem Test**
Using the Filesystem MCP, list all MDX files in src/content/blog

**6. GitHub Test**
Using GitHub MCP, show the last 3 commits on the dcyfr-labs repository

**7. Vercel Test**
Using Vercel MCP, show my recent deployments for dcyfr-labs

**8. Sentry Test**
Using Sentry MCP, check for errors in the dcyfr-labs project from the last 7 days

For each test, clearly indicate:
- ✅ Success + what data you retrieved
- ❌ Failed + error message
- ⚠️ Partial success + what worked/didn't work

---

## Expected Output Format

The response should look like:

```
Testing MCP Servers...

✅ Perplexity: Successfully searched, found 5 articles about Next.js 16
✅ Context7: Retrieved React useTransition documentation
⚠️ Playwright: Connected but timeout on page load
❌ Axiom: Authentication error - check API key
✅ Filesystem: Found 8 MDX files in blog directory
✅ GitHub: Retrieved last 3 commits
✅ Vercel: Found 10 recent deployments
✅ Sentry: No errors in last 7 days (0 events)

Summary: 6/8 servers working correctly
```

---

## Individual Quick Tests

If you want to test just one server:

### Test Perplexity Only
```
Using Perplexity, search for "Tailwind CSS v4 new features"
```

### Test Context7 Only
```
Using Context7, find the Next.js metadata API documentation
```

### Test Playwright Only
```
Using Playwright, visit https://github.com/dcyfr and extract the bio
```

### Test Axiom Only
```
Using Axiom, show me error logs from today
```

### Test Filesystem Only
```
Using Filesystem MCP, read the file src/content/blog/red-team-results-2025.mdx
```

### Test GitHub Only
```
Using GitHub MCP, list open issues in dcyfr-labs repository
```

### Test Vercel Only
```
Using Vercel MCP, show production deployment status
```

### Test Sentry Only
```
Using Sentry MCP, show recent error events with stack traces
```

---

## After Testing

Once you know which MCPs work:

1. **Document failures** in your setup notes
2. **Check API keys** for failed auth errors
3. **Verify permissions** for access denied errors
4. **Update `.mcp.json`** if needed
5. **Set up monitoring** for working MCPs

See [./mcp-test-guide.md](mcp-test-guide) for detailed troubleshooting.
