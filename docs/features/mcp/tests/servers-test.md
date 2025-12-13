# MCP Server Validation Test

## Overview

The MCP Server Validation Test (`test-mcp-servers.mjs`) ensures that all Model Context Protocol (MCP) servers are properly configured and accessible as project dependencies.

**MCP servers are critical for AI-assisted development** and this test treats them with the same rigor as application dependencies.

## What the Test Validates

### 1. Configuration File Validation
- ✅ `mcp.json` exists in the correct location
- ✅ File is valid JSON
- ✅ Contains proper `servers` object structure

### 2. MCP Server Configuration
For each MCP server (Context7, Sequential Thinking, Memory):
- ✅ Server is configured in `mcp.json`
- ✅ Has required `command` property
- ✅ Has required `args` array
- ✅ Has required `type` property set to `"stdio"`
- ✅ Package name is correctly specified in args

### 3. NPM/NPX Availability
- ✅ npm is installed and accessible
- ✅ npx is installed and accessible
- ✅ Both have compatible versions

### 4. Package Accessibility
- ✅ Each MCP server package can be accessed via npm
- ✅ Packages are downloadable and installable
- ✅ All dependencies are available

### 5. Project Dependencies
- ✅ MCP servers declared as project dependency in `mcp.json`
- ✅ Documentation exists (`docs/mcp/servers.md`)
- ✅ Agent instructions are updated
- ✅ Configuration is referenced in project docs

### 6. Documentation
- ✅ MCP Servers Guide exists and references MCP concepts
- ✅ Copilot Instructions document exists
- ✅ Agents configuration is documented

### 7. Project Scripts
- ✅ `test:mcp-servers` script is available in `package.json`
- ✅ Test can be run with `npm run test:mcp-servers`

## Running the Test

```bash
# Run the MCP server validation test
npm run test:mcp-servers
```

### Output Example

```
============================================================
1. Configuration File Validation
============================================================

✅ mcp.json exists
✅ mcp.json is valid JSON

============================================================
2. MCP Server Configuration Validation
============================================================

✅ mcp.json has 'servers' object
✅ Sequential Thinking server configured
   Package: @modelcontextprotocol/server-sequential-thinking
✅  → Has 'command' property
✅  → Has 'args' array
✅  → Has 'type' property
✅  → Type is 'stdio'
✅  → Package in args
✅ Memory server configured
   Package: @modelcontextprotocol/server-memory
✅  → Has 'command' property
✅  → Has 'args' array
✅  → Has 'type' property
✅  → Type is 'stdio'
✅  → Package in args
✅ Context7 server configured
   Package: @upstash/context7-mcp@latest
✅  → Has 'command' property
✅  → Has 'args' array
✅  → Has 'type' property
✅  → Type is 'stdio'
✅  → Package in args

[... more output ...]

============================================================
Test Summary
============================================================

Total Tests: 25
✅ Passed: 25
❌ Failed: 0
⚠️  Warnings: 0

Success Rate: 100%
```

## Test Results Interpretation

### ✅ All Tests Passed (100%)
Your MCP servers are properly configured and ready to use.

### ⚠️ Warnings
Some packages could not be fully validated, but this is often normal if packages don't support `--version`. Review the specific warning for details.

### ❌ Failed Tests
Review the failed tests and follow the recommendations provided. Common issues:

| Issue | Solution |
|-------|----------|
| `mcp.json not found` | Configure MCP servers in VS Code (see `docs/mcp/servers.md`) |
| `npm/npx not available` | Ensure Node.js is installed and in your PATH |
| `Package accessibility` | Check network connectivity or try `npm install` |
| `Missing documentation` | Run `git pull` to ensure docs are up to date |
| `Script not found` | Run `npm install` to update package.json |

## CI/CD Integration

### GitHub Actions Example

Add to `.github/workflows/validate.yml`:

```yaml
name: Validate MCP Servers

on: [push, pull_request]

jobs:
  mcp-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Validate MCP Servers
        run: npm run test:mcp-servers
```

**Note**: The test assumes VS Code is configured locally. In CI environments, you may need to mock or skip certain checks.

## Maintenance

### When to Run the Test

- **Before development**: Ensure your MCP setup is valid
- **Before commits**: Validate nothing has changed unexpectedly
- **In CI/CD pipelines**: Catch configuration issues early
- **After pulling changes**: Verify documentation updates
- **When adding MCP servers**: Validate new configurations

### Updating the Test

When adding new MCP servers:

1. Update `expectedServers` object in `test-mcp-servers.mjs`
2. Add server configuration to `~/.config/Code/User/mcp.json`
3. Run test to validate: `npm run test:mcp-servers`
4. Update documentation if needed

## Troubleshooting

### Test Fails with "mcp.json not found"

```bash
# Check if VS Code user config exists
ls -la ~/.config/Code/User/mcp.json

# If not found, create it with proper configuration
# See docs/mcp/servers.md for setup instructions
```

### Test Fails with "npm/npx not available"

```bash
# Verify Node.js installation
node --version
npm --version
npx --version

# Install Node.js if needed
# Visit: https://nodejs.org/
```

### Test Fails with "Package accessibility"

```bash
# Check network connectivity
ping npm.js.org

# Clear npm cache
npm cache clean --force

# Try installing packages manually
npx -y @modelcontextprotocol/server-sequential-thinking --help
```

### Timeout Errors

The test includes a 5-second timeout for package validation. If you're on a slow network:

```bash
# Run with increased timeout by modifying the test temporarily
# Or ensure network is stable before running test
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Configuration Tests | 100% Pass |
| Package Accessibility | 100% Pass |
| Documentation Coverage | 100% Complete |
| Test Execution | < 30 seconds |
| Failed Tests | 0 |

## Related Documentation

- [MCP Servers Guide](../servers) — Comprehensive MCP setup and usage
- [Copilot Instructions](./../.github/copilot-instructions) — AI contributor guidelines
- [Agents Configuration](./../agents) — Agent configuration reference

## Implementation Details

### Test Coverage Matrix

| Component | Coverage | Method |
|-----------|----------|--------|
| Configuration | ✅ High | File validation, JSON parsing |
| Packages | ✅ Medium | npm search, timeout-based check |
| Documentation | ✅ High | File existence, content search |
| Scripts | ✅ High | package.json validation |
| Integration | ✅ High | Cross-file reference checks |

### Known Limitations

1. **CI/CD Environments**: Test assumes local VS Code setup
   - Workaround: Mock `mcp.json` location or skip in CI

2. **Firewall/Network Restricted**: npm packages may not be accessible
   - Workaround: Run test on unrestricted network first

3. **Package Version Compatibility**: Versions in `mcp.json` may differ from installed
   - Workaround: Version conflicts are acceptable as long as packages are accessible

## Contributing

To improve the test suite:

1. Add new test cases to `test-mcp-servers.mjs`
2. Update documentation accordingly
3. Ensure test maintains < 30 second execution time
4. Run full test suite before committing

## Support

For issues or questions:

1. Check [MCP Servers Guide](../servers)
2. Review [Copilot Instructions](./../.github/copilot-instructions)
3. See troubleshooting section above
4. Create an issue with test output attached
