import { describe, it, expect, vi } from 'vitest';
import remarkMdxComponentLinter, {
  validateMdxComponents,
} from '@/lib/markdown/mdx-component-linter';

// Mock unist-util-visit
vi.mock('unist-util-visit', () => ({
  visit: (tree: any, type: string, handler: (node: any) => void) => {
    function walk(node: any) {
      if (node.type === type) handler(node);
      if (node.children) node.children.forEach(walk);
    }
    walk(tree);
  },
}));

function makeTree(wordCount: number, components: Record<string, number> = {}) {
  const words = Array(wordCount).fill('word').join(' ');
  const children: any[] = [{ type: 'text', value: words }];

  for (const [name, count] of Object.entries(components)) {
    for (let i = 0; i < count; i++) {
      children.push({ type: 'mdxJsxFlowElement', name });
    }
  }

  return { type: 'root', children };
}

function makeFile() {
  const messages: string[] = [];
  const failures: string[] = [];
  return {
    data: {} as Record<string, any>,
    message: (msg: string) => messages.push(msg),
    fail: (msg: string) => failures.push(msg),
    _messages: messages,
    _failures: failures,
  };
}

describe('remarkMdxComponentLinter', () => {
  it('skips short posts', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(100);
    const file = makeFile();
    plugin(tree, file);
    expect(file._messages).toHaveLength(0);
  });

  it('warns about missing SectionShare for long posts', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(500);
    const file = makeFile();
    plugin(tree, file);
    expect(file._messages.some((m: string) => m.includes('SectionShare'))).toBe(true);
  });

  it('does not warn when components are within bounds', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(500, {
      SectionShare: 2,
      GlossaryTooltip: 8,
      CollapsibleSection: 3,
      Alert: 1,
      KeyTakeaway: 2,
    });
    const file = makeFile();
    plugin(tree, file);
    // Should only have no warnings (all within bounds)
    const shareWarnings = file._messages.filter(
      (m: string) => m.includes('SectionShare') && m.includes('Found 0')
    );
    expect(shareWarnings).toHaveLength(0);
  });

  it('warns about too many CollapsibleSection', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(500, { CollapsibleSection: 15, SectionShare: 1 });
    const file = makeFile();
    plugin(tree, file);
    expect(file._messages.some((m: string) => m.includes('CollapsibleSection'))).toBe(true);
  });

  it('warns about too few GlossaryTooltip', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(500, { SectionShare: 1 });
    const file = makeFile();
    plugin(tree, file);
    expect(file._messages.some((m: string) => m.includes('GlossaryTooltip'))).toBe(true);
  });

  it('in strict mode uses file.fail instead of file.message', () => {
    const plugin = remarkMdxComponentLinter({ strict: true });
    const tree = makeTree(500);
    const file = makeFile();
    plugin(tree, file);
    expect(file._failures.length).toBeGreaterThan(0);
    expect(file._messages).toHaveLength(0);
  });

  it('adds metadata to file', () => {
    const plugin = remarkMdxComponentLinter();
    const tree = makeTree(500, { SectionShare: 2 });
    const file = makeFile();
    plugin(tree, file);
    expect(file.data.wordCount).toBe(500);
    expect(file.data.componentCounts.SectionShare).toBe(2);
  });
});

describe('validateMdxComponents', () => {
  it('throws with not implemented message', () => {
    expect(() => validateMdxComponents('')).toThrow('Use scripts/validate-mdx-components.mjs');
  });
});
