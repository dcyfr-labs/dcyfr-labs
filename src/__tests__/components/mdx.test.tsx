import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MDX } from "@/components/common/mdx";

// Mock the heavy dependencies
vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: ({ components }: { source: string; components: Record<string, unknown> }) => {
    // Simple mock that renders some common elements for testing
    const H1 = components?.h1 as React.ComponentType<{ children: string }>;
    const H2 = components?.h2 as React.ComponentType<{ children: string }>;
    const P = components?.p as React.ComponentType<{ children: string }>;
    const Code = components?.code as React.ComponentType<{ children: string }>;
    const A = components?.a as React.ComponentType<{ href: string; children: string }>;
    const Ul = components?.ul as React.ComponentType<{ children: React.ReactNode }>;
    const Blockquote = components?.blockquote as React.ComponentType<{ children: string }>;
    const Table = components?.table as React.ComponentType<{ children: React.ReactNode }>;
    const Hr = components?.hr as React.ComponentType;
    const CheckIcon = components?.CheckIcon as React.ComponentType;
    const XIcon = components?.XIcon as React.ComponentType;
    const InfoIcon = components?.InfoIcon as React.ComponentType;

    return (
      <div data-testid="mdx-content">
        {H1 && <H1>Test Heading 1</H1>}
        {H2 && <H2>Test Heading 2</H2>}
        {P && <P>Test paragraph</P>}
        {Code && <Code>inline code</Code>}
        {A && <A href="https://example.com">External Link</A>}
        {A && <A href="/internal">Internal Link</A>}
        {Ul && <Ul><li>List item</li></Ul>}
        {Blockquote && <Blockquote>Quote text</Blockquote>}
        {Table && <Table><tbody><tr><td>Cell</td></tr></tbody></Table>}
        {Hr && <Hr />}
        {CheckIcon && <CheckIcon />}
        {XIcon && <XIcon />}
        {InfoIcon && <InfoIcon />}
      </div>
    );
  },
}));

vi.mock("@/components/common/copy-code-button", () => ({
  CopyCodeButton: () => <button data-testid="copy-button">Copy</button>,
}));

vi.mock("@/components/common/horizontal-rule", () => ({
  HorizontalRule: () => <hr data-testid="horizontal-rule" />,
}));

vi.mock("@/components/common/mermaid", () => ({
  Mermaid: ({ chart }: { chart: string }) => <div data-testid="mermaid-diagram">{chart}</div>,
}));

describe("MDX Component", () => {
  describe("Rendering", () => {
    it("should render MDX content", () => {
      render(<MDX source="# Hello World" />);
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
    });

    it("should apply custom component mappings", () => {
      render(<MDX source="# Test" />);
      const content = screen.getByTestId("mdx-content");
      expect(content).toBeTruthy();
    });
  });

  describe("Heading Components", () => {
    it("should render h1 with proper classes", () => {
      render(<MDX source="# Heading 1" />);
      const h1 = screen.getByText("Test Heading 1");
      expect(h1.tagName).toBe("H1");
      expect(h1.className).toContain("mt-8");
      expect(h1.className).toContain("scroll-mt-20");
      expect(h1.className).toContain("first:mt-0");
    });

    it("should render h2 with proper classes", () => {
      render(<MDX source="## Heading 2" />);
      const h2 = screen.getByText("Test Heading 2");
      expect(h2.tagName).toBe("H2");
      expect(h2.className).toContain("mt-8");
      expect(h2.className).toContain("scroll-mt-20");
    });
  });

  describe("Text Elements", () => {
    it("should render paragraphs with proper styling", () => {
      render(<MDX source="Test content" />);
      const p = screen.getByText("Test paragraph");
      expect(p.tagName).toBe("P");
      // Paragraphs rely on prose CSS, no inline classes
    });

    it("should render blockquotes with correct spacing and styling", () => {
      render(<MDX source="> Quote" />);
      const blockquote = screen.getByText("Quote text");
      expect(blockquote.tagName).toBe("BLOCKQUOTE");
      // Classnames changed to reflect updated design tokens: left padding and spacing
      expect(blockquote.className).toContain("pl-4");
      expect(blockquote.className).toContain("mt-6");
      expect(blockquote.className).toContain("border-l-4");
    });
  });

  describe("Code Elements", () => {
    it("should render inline code with proper styling", () => {
      render(<MDX source="`code`" />);
      const code = screen.getByText("inline code");
      expect(code.tagName).toBe("CODE");
      expect(code.className).toContain("rounded-md");
      expect(code.className).toContain("bg-primary/10");
      expect(code.className).toContain("font-mono");
      expect(code.className).toContain("border-primary/20");
    });
  });

  describe("List Elements", () => {
    it("should render unordered lists with proper classes", () => {
      render(<MDX source="- Item" />);
      const ul = screen.getByRole("list");
      expect(ul.className).toContain("list-disc");
      expect(ul.className).toContain("pl-6");
    });
  });

  describe("Link Elements", () => {
    it("should render external links with target blank", () => {
      render(<MDX source="[Link](https://example.com)" />);
      const link = screen.getByText("External Link") as HTMLAnchorElement;
      expect(link.tagName).toBe("A");
      expect(link.href).toBe("https://example.com/");
      expect(link.target).toBe("_blank");
      expect(link.rel).toBe("noopener noreferrer");
    });

    it("should render internal links without target blank", () => {
      render(<MDX source="[Link](/internal)" />);
      const link = screen.getByText("Internal Link") as HTMLAnchorElement;
      expect(link.tagName).toBe("A");
      expect(link.href).toContain("/internal");
      expect(link.target).toBe("");
    });

    it("should add external link icon to external links", () => {
      render(<MDX source="[Link](https://example.com)" />);
      const link = screen.getByText("External Link");
      const svg = link.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });

    it("should apply hover styles to links", () => {
      render(<MDX source="[Link](/test)" />);
      const link = screen.getByText("Internal Link");
      expect(link.className).toContain("underline");
      expect(link.className).toContain("hover:text-primary");
    });
  });

  describe("Table Elements", () => {
    it("should wrap tables in overflow container", () => {
      render(<MDX source="| Col |\n|-----|\n| Val |" />);
      // Table is wrapped in a figure with role="table", get the actual table element
      const tableElement = document.querySelector("table");
      expect(tableElement).toBeInTheDocument();
      expect(tableElement?.className).toContain("border-collapse");
      // Check for wrapper div with overflow
      const wrapper = tableElement?.parentElement;
      expect(wrapper?.className).toContain("overflow-x-auto");
    });
  });

  describe("Custom Components", () => {
    it("should render HorizontalRule component for hr", () => {
      render(<MDX source="---" />);
      expect(screen.getByTestId("horizontal-rule")).toBeInTheDocument();
    });

    it("should render CheckIcon component", () => {
      render(<MDX source="<CheckIcon />" />);
      const icon = screen.getByLabelText("Check");
      expect(icon).toBeInTheDocument();
      // Icon colors (text-*-500/600) are excluded from SEMANTIC_COLORS enforcement
      // eslint-disable-next-line no-restricted-syntax -- Testing CSS class for icon color
      expect(icon.className).toContain("text-green-600");
    });

    it("should render XIcon component", () => {
      render(<MDX source="<XIcon />" />);
      const icon = screen.getByLabelText("Cross");
      expect(icon).toBeInTheDocument();
      // Icon colors (text-*-500/600) are excluded from SEMANTIC_COLORS enforcement
      // eslint-disable-next-line no-restricted-syntax -- Testing CSS class for icon color
      expect(icon.className).toContain("text-red-600");
    });
    it("should render InfoIcon component", () => {
      render(<MDX source="<InfoIcon />" />);
      const icon = screen.getByLabelText("Information");
      expect(icon).toBeInTheDocument();
      // Icon colors (text-*-500/600) are excluded from SEMANTIC_COLORS enforcement
      // eslint-disable-next-line no-restricted-syntax -- Testing CSS class for icon color
      expect(icon.className).toContain("text-blue-600");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on icon components", () => {
      render(<MDX source="Test" />);
      expect(screen.getByLabelText("Check")).toBeInTheDocument();
      expect(screen.getByLabelText("Cross")).toBeInTheDocument();
      expect(screen.getByLabelText("Information")).toBeInTheDocument();
    });

    it("should use semantic HTML elements", () => {
      render(<MDX source="# Test\n\nParagraph" />);
      expect(screen.getByText("Test Heading 1").tagName).toBe("H1");
      expect(screen.getByText("Test paragraph").tagName).toBe("P");
    });

    it("should add scroll-margin-top to headings for skip links", () => {
      render(<MDX source="## Heading" />);
      const heading = screen.getByText("Test Heading 2");
      expect(heading.className).toContain("scroll-mt-20");
    });
  });

  describe("Theme Support", () => {
    it("should apply theme-aware classes", () => {
      render(<MDX source="`code`" />);
      const code = screen.getByText("inline code");
      // Check for theme-aware utility classes
      expect(code.className).toContain("bg-primary/10");
      expect(code.className).toContain("text-primary");
    });
  });

  describe("Typography", () => {
    it("should apply design tokens to headings", () => {
      render(<MDX source="# Test" />);
      const h1 = screen.getByText("Test Heading 1");
      // The component should use TYPOGRAPHY.h1.mdx classes
      expect(h1.className).toBeTruthy();
    });

    it("should render paragraphs without custom classes", () => {
      render(<MDX source="Text" />);
      const p = screen.getByText("Test paragraph");
      // Paragraphs rely on prose CSS, no inline classes needed
      expect(p.tagName).toBe("P");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty source", () => {
      render(<MDX source="" />);
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
    });

    it("should handle complex nested structures", () => {
      const source = `
# Heading
- List item
  - Nested item
> Quote
`;
      render(<MDX source={source} />);
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
    });

    it("should handle links without href", () => {
      render(<MDX source="[Link](#)" />);
      // Should not throw error
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
    });
  });
});
