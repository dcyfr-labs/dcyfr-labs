# Visual Regression Testing Setup Guide

**Last updated**: 2025-12-21
**Status**: Optional Enhancement

This guide covers setting up visual regression testing for the dcyfr-labs project using Chromatic and Storybook.

---

## Overview

Visual regression testing automatically detects unintended UI changes by capturing component snapshots and comparing them across commits.

**Benefits:**
- Catch visual bugs before production
- Review UI changes with confidence
- Document component variations
- Maintain design consistency

---

## Setup Options

### Option A: Chromatic + Storybook (Recommended)

Full component library with visual regression testing.

**Pros:**
- Comprehensive component documentation
- Visual diff approval workflow
- Cross-browser testing
- Parallel snapshot capture

**Cons:**
- Requires Storybook setup
- Additional build step
- Chromatic account needed (free for open source)

### Option B: Playwright Visual Testing (Basic)

Screenshot-based visual comparison using Playwright.

**Pros:**
- No additional dependencies
- Uses existing E2E infrastructure
- Simple to set up

**Cons:**
- Less granular (page-level vs component-level)
- Manual baseline management
- No approval workflow UI

---

## Option A: Chromatic + Storybook Setup

### Step 1: Install Storybook

```bash
# Install Storybook for Next.js
npx storybook@latest init

# Follow prompts:
# - Framework: Next.js
# - Builder: Webpack (or Vite)
# - Install ESLint plugin: Yes
```

### Step 2: Configure Storybook for Next.js App Router

Create `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
}

export default config
```

Create `.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/react'
import '../src/app/globals.css' // Import global styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
}

export default preview
```

### Step 3: Create Example Stories

Create `src/components/ui/button/button.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}
```

### Step 4: Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

### Step 5: Sign Up for Chromatic

1. Visit [chromatic.com](https://www.chromatic.com/)
2. Sign in with GitHub
3. Add your repository
4. Copy project token

### Step 6: Add Chromatic Token to Repository

```bash
# Add to GitHub repository secrets
gh secret set CHROMATIC_PROJECT_TOKEN --body "chpt_xxxxxxxxxxxx"
```

### Step 7: Test Locally

```bash
# Start Storybook
npm run storybook

# Visit http://localhost:6006
# Verify stories render correctly

# Build Storybook
npm run build-storybook

# Run Chromatic (requires token)
npx chromatic --project-token=<your-token>
```

### Step 8: Create More Stories

**Example: Card Component**

Create `src/components/ui/card/card.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from '../button/button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name">Name</label>
              <input id="name" placeholder="Name of your project" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}
```

---

## Option B: Playwright Visual Testing Setup

### Step 1: Create Visual Test File

Create `e2e/visual-regression.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      timeout: 10000,
    })
  })

  test('blog page visual snapshot', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveScreenshot('blog-page.png', {
      fullPage: true,
    })
  })

  test('project card component', async ({ page }) => {
    await page.goto('/projects')

    // Wait for cards to load
    await page.waitForSelector('[data-testid="project-card"]')

    // Screenshot first project card
    const card = page.locator('[data-testid="project-card"]').first()
    await expect(card).toHaveScreenshot('project-card.png')
  })
})
```

### Step 2: Configure Playwright for Visual Testing

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // ... existing config ...

  expect: {
    toHaveScreenshot: {
      // Maximum pixel difference threshold
      maxDiffPixels: 100,
      // Threshold for considering pixels as different (0-1)
      threshold: 0.2,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add more browsers for cross-browser visual testing
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
})
```

### Step 3: Generate Initial Baselines

```bash
# Generate baseline screenshots
npm run test:e2e -- e2e/visual-regression.spec.ts --update-snapshots

# Baselines saved to e2e/visual-regression.spec.ts-snapshots/
```

### Step 4: Run Visual Tests

```bash
# Run visual tests
npm run test:e2e -- e2e/visual-regression.spec.ts

# On differences, Playwright generates:
# - actual.png (current screenshot)
# - expected.png (baseline)
# - diff.png (highlighted differences)
```

---

## Workflow Integration

The `visual-regression.yml` workflow automatically:

1. **Detects Storybook** presence
2. **Runs Chromatic** (if Storybook configured)
   - Captures component snapshots
   - Compares with baseline
   - Posts results to PR
3. **Falls back to Playwright** (if no Storybook)
   - Comments on PR with setup instructions
   - Runs basic visual tests if configured

---

## Best Practices

### Story Organization

```
src/
  components/
    ui/
      button/
        button.tsx
        button.stories.tsx  ← Co-locate stories with components
      card/
        card.tsx
        card.stories.tsx
```

### Story Naming Convention

```typescript
// Title format: Category/ComponentName
title: 'UI/Button'      // ✅ Good
title: 'Button'         // ❌ Too generic
title: 'ui/button'      // ❌ Wrong casing
```

### Test Coverage Strategy

**High Priority:**
- UI components (buttons, cards, inputs)
- Layout components (headers, footers, navigation)
- Complex interactions (dropdowns, modals, forms)

**Medium Priority:**
- Page templates
- Content sections
- Marketing components

**Low Priority:**
- Static pages without components
- Admin/internal tools

### Handling Dynamic Content

```typescript
// Mock dynamic data in stories
export const WithData: Story = {
  parameters: {
    mockData: [
      { id: 1, title: 'First Post', date: '2024-01-01' },
      { id: 2, title: 'Second Post', date: '2024-01-02' },
    ],
  },
  render: (args, { parameters }) => (
    <BlogList posts={parameters.mockData} />
  ),
}
```

### Chromatic Configuration

Create `chromatic.config.json`:

```json
{
  "projectId": "your-project-id",
  "buildScriptName": "build-storybook",
  "onlyChanged": true,
  "externals": ["public/**", "src/styles/**/*.css"],
  "autoAcceptChanges": "main",
  "exitZeroOnChanges": false,
  "exitOnceUploaded": true
}
```

---

## Troubleshooting

### Storybook Build Fails

**Problem**: Build errors with Next.js components
**Solution**:
```bash
# Install required dependencies
npm install --save-dev @storybook/addon-actions
npm install --save-dev @storybook/addon-essentials

# Verify Next.js framework adapter
npm install --save-dev @storybook/nextjs
```

### Visual Differences on Different Platforms

**Problem**: Screenshots differ between local and CI
**Solution**:
- Use Chromatic (platform-independent rendering)
- Or configure Playwright to use consistent fonts:

```typescript
// playwright.config.ts
use: {
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: ['--font-render-hinting=none'],
  },
},
```

### Chromatic Workflow Failing

**Problem**: `CHROMATIC_PROJECT_TOKEN` not found
**Solution**:
```bash
# Verify secret exists
gh secret list | grep CHROMATIC

# Re-add if missing
gh secret set CHROMATIC_PROJECT_TOKEN
```

---

## Cost Considerations

### Chromatic Pricing

- **Free for open source projects**: Unlimited snapshots
- **Free tier**: 5,000 snapshots/month
- **Paid tiers**: Start at $149/month for more snapshots

### Optimization Tips

```yaml
# In visual-regression.yml, use onlyChanged: true
- name: Run Chromatic
  uses: chromaui/action@latest
  with:
    onlyChanged: true  # Only test changed components
```

---

## Next Steps

1. **Start with core components**
   - Button, Card, Input
   - Build up component library gradually

2. **Add stories as you build**
   - Create story when creating new component
   - Document component variations

3. **Review visual changes regularly**
   - Check Chromatic builds on every PR
   - Approve intentional changes
   - Reject regressions

4. **Expand coverage**
   - Add page-level stories
   - Test responsive breakpoints
   - Include dark mode variants

---

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Visual Regression Testing Best Practices](https://storybook.js.org/docs/writing-tests/visual-testing)

---

**Maintained by**: @dcyfr
**Last updated**: 2025-12-21
**Related**: [Phase 3 Implementation Guide](../operations/github-improvements-phase3-guide.md)
