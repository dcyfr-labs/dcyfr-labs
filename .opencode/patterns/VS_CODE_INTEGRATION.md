# VS Code Integration Guide

**File:** `.opencode/patterns/VS_CODE_INTEGRATION.md`  
**Last Updated:** January 5, 2026  
**Scope:** OpenCode VS Code extension setup, keyboard shortcuts, file reference workflows

---

## Extension Installation

### **Official Extension: `sst-dev.opencode`**

**Marketplace:** [sst-dev.opencode](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode)

**Installation Methods:**

#### Method 1: VS Code Extension Marketplace

```
1. Open VS Code
2. Press Cmd+Shift+X (Mac) or Ctrl+Shift+X (Win/Linux)
3. Search for "OpenCode"
4. Click "Install" on "opencode" by sst-dev
5. Reload VS Code
```

#### Method 2: Command Line

```bash
code --install-extension sst-dev.opencode
```

#### Method 3: Project Recommendations

The `.vscode/extensions.json` file includes OpenCode as a recommended extension. VS Code will prompt to install when opening the project.

---

## Keyboard Shortcuts

### **Quick Launch**

- **Mac:** `Cmd+Esc`
- **Windows/Linux:** `Ctrl+Esc`

**Action:** Opens OpenCode in a split terminal window with current selection as context

**Example:**
```
1. Select code in editor
2. Press Cmd+Esc
3. OpenCode terminal opens with file reference
4. Type command and press Enter
```

### **New Session**

- **Mac:** `Cmd+Shift+Esc`
- **Windows/Linux:** `Ctrl+Shift+Esc`

**Action:** Starts a fresh OpenCode session (clears previous context)

**Use when:**
- Switching to a different task
- Previous session completed
- Need isolated context for new feature

### **Add File References**

- **Mac:** `Cmd+Option+K`
- **Windows/Linux:** `Alt+Ctrl+K`

**Action:** Insert current file or selection as reference in OpenCode

**Example:**
```
1. Open file: src/app/blog/page.tsx
2. Select lines 10-20
3. Press Cmd+Option+K
4. OpenCode inserts: @src/app/blog/page.tsx#L10-20
```

---

## File Reference Syntax

OpenCode supports rich file reference patterns:

### **Entire File**

```
@src/components/blog/index.ts
```

**Result:** OpenCode reads full file content

### **Specific Line Range**

```
@src/app/blog/page.tsx#L10-20
```

**Result:** OpenCode reads lines 10-20 only

### **Function or Symbol**

```
@src/lib/metadata.ts#createPageMetadata
```

**Result:** OpenCode reads the `createPageMetadata` function definition

### **Multiple Files**

```
@src/components/blog/filter.tsx
@src/app/blog/page.tsx
@src/lib/blog-utils.ts

Update filter component to use new utility function
```

**Result:** OpenCode has context from all three files

---

## Context Sharing Workflows

### **Workflow 1: Code Selection Context**

```
Problem: Need to refactor selected code

Steps:
1. Select code to refactor (e.g., 20 lines in a component)
2. Press Cmd+Esc (opens OpenCode with selection)
3. OpenCode prompt shows:
   > @src/components/blog/PostCard.tsx#L45-65
   
4. Type command:
   > Extract this logic into a separate utility function
   
5. OpenCode generates refactored code with context
```

### **Workflow 2: Multi-File Operation**

```
Problem: Update imports across multiple files

Steps:
1. Open first file: src/components/blog/index.ts
2. Press Cmd+Option+K (adds to OpenCode)
3. Open second file: src/app/blog/page.tsx
4. Press Cmd+Option+K (adds to OpenCode)
5. Type command in OpenCode:
   > Update barrel export in index.ts and import in page.tsx
   
6. OpenCode has context from both files
```

### **Workflow 3: Pattern Reference**

```
Problem: Implement similar pattern to existing code

Steps:
1. Find reference file: src/app/work/page.tsx (has filter pattern)
2. Press Cmd+Option+K
3. Open new file: src/app/blog/page.tsx
4. Press Cmd+Option+K
5. Type command:
   > Implement category filter in blog page similar to work page
   
6. OpenCode uses work page as reference pattern
```

---

## Terminal Integration

### **Split Terminal Behavior**

OpenCode opens in a **split terminal** by default:

```
┌─────────────────────────────────────┐
│  Editor (your code)                 │
├─────────────────────────────────────┤
│  OpenCode Terminal                  │
│  > Type commands here               │
└─────────────────────────────────────┘
```

**Benefits:**
- See code and AI responses side-by-side
- Easy copy-paste between editor and terminal
- Quick switching with `Cmd+J` (toggle terminal)

### **Independent Sessions**

Each OpenCode terminal is an **isolated session**:

```bash
# Terminal 1: Feature implementation
opencode --preset dcyfr-feature

# Terminal 2: Planning (separate session)
opencode --preset dcyfr-plan

# Terminal 3: Quick fixes (separate session)
opencode --preset dcyfr-quick
```

**Use case:** Multiple parallel tasks without context mixing

---

## Editor Title Bar Button

OpenCode adds a button to the editor title bar:

```
┌─────────────────────────────────────┐
│ file.tsx  [OpenCode] ×              │
│                                      │
│  // Your code here                  │
└─────────────────────────────────────┘
```

**Click [OpenCode] button** → Same as `Cmd+Esc` (quick launch)

---

## DCYFR-Specific Workflows

### **Workflow 1: Design Token Validation**

```
Problem: Check if file uses design tokens correctly

Steps:
1. Open file: src/components/blog/PostCard.tsx
2. Press Cmd+Esc
3. Type command:
   > Check this file for design token compliance
   > Flag any hardcoded gap-*, text-*, or spacing values
   
4. OpenCode analyzes and reports violations
5. Fix violations, re-check with same command
```

### **Workflow 2: Layout Pattern Check**

```
Problem: Verify page uses correct layout

Steps:
1. Open file: src/app/bookmarks/page.tsx
2. Press Cmd+Esc
3. Type command:
   > Does this page use PageLayout correctly?
   > Should it use PageLayout, ArticleLayout, or ArchiveLayout?
   
4. OpenCode validates layout choice
```

### **Workflow 3: Session Handoff from Claude**

```
Scenario: Claude Code rate limited, need to continue work

Steps:
1. In terminal: npm run session:save claude "Implement blog filter" implementation "1h"
2. In VS Code: Press Cmd+Esc (opens OpenCode)
3. In terminal: npm run session:restore claude opencode
4. Review session state (task, files, notes)
5. In OpenCode: Continue implementation
   > Continue implementing blog category filter
   > Files in progress: src/app/blog/page.tsx, src/components/blog/filter.tsx
```

---

## Tips & Tricks

### **Tip 1: Use Presets for DCYFR Compliance**

Instead of plain `opencode`, use DCYFR presets:

```bash
# ✅ GOOD: Uses DCYFR preset with pattern enforcement
opencode --preset dcyfr-feature

# ⚠️ OK: Plain opencode (no DCYFR patterns in system prompt)
opencode
```

### **Tip 2: Reference Shared Pattern Docs**

Include pattern docs in file references:

```
@.github/agents/patterns/COMPONENT_PATTERNS.md
@src/app/work/page.tsx

Implement blog filter following COMPONENT_PATTERNS guidelines,
using work page as reference implementation
```

### **Tip 3: Combine with npm Scripts**

```bash
# In OpenCode terminal
> npm run check:opencode  # Run enhanced validation
> npm run session:save opencode "task" complete
> npm run opencode:health  # Check provider status
```

### **Tip 4: Quick Context with Cmd+K**

Build context incrementally:

```
1. Cmd+Option+K on pattern file
2. Cmd+Option+K on reference implementation
3. Cmd+Option+K on target file
4. Cmd+Esc (launch OpenCode with all context)
5. Type command
```

---

## Compatibility

OpenCode VS Code extension works with:

- ✅ **VS Code** (official)
- ✅ **Cursor** (VS Code fork)
- ✅ **Windsurf** (AI-first editor)
- ✅ **VSCodium** (open-source VS Code)

**Not compatible:**
- ❌ JetBrains IDEs (IntelliJ, PyCharm, etc.)
- ❌ Vim/Neovim (use CLI directly)
- ❌ Emacs (use CLI directly)

---

## Troubleshooting

### **Issue: Keyboard shortcuts don't work**

**Solution:**
```
1. Open VS Code settings: Cmd+,
2. Search for "keyboard shortcuts"
3. Click "Open Keyboard Shortcuts (JSON)"
4. Add manual bindings:

{
  "key": "cmd+escape",
  "command": "opencode.quickLaunch"
},
{
  "key": "cmd+shift+escape",
  "command": "opencode.newSession"
},
{
  "key": "cmd+alt+k",
  "command": "opencode.addFileReference"
}
```

### **Issue: Extension not appearing**

**Solution:**
```
1. Reload VS Code: Cmd+Shift+P → "Reload Window"
2. Check installed: code --list-extensions | grep opencode
3. Reinstall: code --uninstall-extension sst-dev.opencode && code --install-extension sst-dev.opencode
```

### **Issue: File references not working**

**Solution:**
```
1. Ensure file paths are relative to project root
2. Use @src/... not @./src/...
3. Check file exists: ls -la <path>
```

---

## Related Documentation

- [**PROVIDER_SELECTION.md**](PROVIDER_SELECTION.md) - Provider decision tree
- [**TROUBLESHOOTING.md**](../workflows/TROUBLESHOOTING.md) - Common issues and fixes
- [**SESSION_HANDOFF.md**](../workflows/SESSION_HANDOFF.md) - Agent transition workflows
- [**DCYFR.opencode.md**](../DCYFR.opencode.md) - Main hub file
