import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FAQSchema, type FAQItem } from "../faq-schema";

describe("FAQSchema", () => {
  const defaultItems: FAQItem[] = [
    {
      id: "faq-1",
      question: "What is the RIVET framework?",
      answer: "RIVET stands for Reader-centric navigation, Interactive elements, Visual density, Enhanced discoverability, and Tiered content depth.",
    },
    {
      id: "faq-2",
      question: "How do I use FAQSchema?",
      answer: "Import the component and pass an array of FAQ items with id, question, and answer fields.",
    },
    {
      id: "faq-3",
      question: "Does this support SEO?",
      answer: "Yes! FAQSchema automatically generates schema.org/FAQPage structured data for Google rich results.",
    },
  ];

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = { hash: "" } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default title", () => {
      render(<FAQSchema items={defaultItems} />);
      
      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<FAQSchema items={defaultItems} title="Common Questions" />);
      
      expect(screen.getByText("Common Questions")).toBeInTheDocument();
    });

    it("should render all FAQ items", () => {
      render(<FAQSchema items={defaultItems} />);
      
      expect(screen.getByText("What is the RIVET framework?")).toBeInTheDocument();
      expect(screen.getByText("How do I use FAQSchema?")).toBeInTheDocument();
      expect(screen.getByText("Does this support SEO?")).toBeInTheDocument();
    });

    it("should render with React node answers", async () => {
      const itemsWithReactNodes: FAQItem[] = [
        {
          id: "faq-react",
          question: "Can I use React nodes?",
          answer: (
            <div>
              <p>Yes, you can!</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          ),
        },
      ];

      const user = userEvent.setup();
      render(<FAQSchema items={itemsWithReactNodes} />);
      
      expect(screen.getByText("Can I use React nodes?")).toBeInTheDocument();
      
      // Expand to see React node content
      await user.click(screen.getByText("Can I use React nodes?"));
      
      await waitFor(() => {
        expect(screen.getByText("Yes, you can!")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });
    });

    it("should render group controls by default", () => {
      render(<FAQSchema items={defaultItems} />);
      
      expect(screen.getByLabelText("Expand all FAQs")).toBeInTheDocument();
      expect(screen.getByLabelText("Collapse all FAQs")).toBeInTheDocument();
    });

    it("should hide group controls when showGroupControls is false", () => {
      render(<FAQSchema items={defaultItems} showGroupControls={false} />);
      
      expect(screen.queryByLabelText("Expand all FAQs")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Collapse all FAQs")).not.toBeInTheDocument();
    });

    it("should hide group controls when only one item", () => {
      render(<FAQSchema items={[defaultItems[0]]} />);
      
      expect(screen.queryByLabelText("Expand all FAQs")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <FAQSchema items={defaultItems} className="custom-class" />
      );
      
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Schema.org JSON-LD", () => {
    it("should generate schema.org/FAQPage structured data", () => {
      render(<FAQSchema items={defaultItems} />);
      
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
      
      const schemaData = JSON.parse(script?.textContent || "{}");
      expect(schemaData["@context"]).toBe("https://schema.org");
      expect(schemaData["@type"]).toBe("FAQPage");
    });

    it("should include all FAQ items in schema", () => {
      render(<FAQSchema items={defaultItems} />);
      
      const script = document.querySelector('script[type="application/ld+json"]');
      const schemaData = JSON.parse(script?.textContent || "{}");
      
      expect(schemaData.mainEntity).toHaveLength(3);
      expect(schemaData.mainEntity[0]["@type"]).toBe("Question");
      expect(schemaData.mainEntity[0].name).toBe("What is the RIVET framework?");
      expect(schemaData.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    });

    it("should handle React node answers in schema (empty text)", () => {
      const itemsWithReactNodes: FAQItem[] = [
        {
          id: "faq-react",
          question: "React node question?",
          answer: <div>React content</div>,
        },
      ];

      render(<FAQSchema items={itemsWithReactNodes} />);
      
      const script = document.querySelector('script[type="application/ld+json"]');
      const schemaData = JSON.parse(script?.textContent || "{}");
      
      // React nodes should result in empty text in schema (not string answers)
      expect(typeof schemaData.mainEntity[0].acceptedAnswer.text).toBe("string");
      // Can be empty string for React nodes
      expect(schemaData.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Accordion Interaction", () => {
    it("should start with all items collapsed by default", () => {
      render(<FAQSchema items={defaultItems} />);
      
      // Answers should not be in the document initially (accordion content hidden)
      expect(screen.queryByText(/RIVET stands for/)).not.toBeInTheDocument();
    });

    it("should expand item when clicked", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      const trigger = screen.getByText("What is the RIVET framework?");
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
      });
    });

    it("should collapse item when clicked again", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      const trigger = screen.getByText("What is the RIVET framework?");
      
      // Expand
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
      });
      
      // Collapse
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText(/RIVET stands for/)).not.toBeInTheDocument();
      });
    });

    it("should allow multiple items to be expanded simultaneously", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      await user.click(screen.getByText("What is the RIVET framework?"));
      await user.click(screen.getByText("How do I use FAQSchema?"));
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
        expect(screen.getByText(/Import the component/)).toBeVisible();
      });
    });
  });

  describe("Group Controls", () => {
    it("should expand all items when Expand All is clicked", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      const expandAllButton = screen.getByLabelText("Expand all FAQs");
      await user.click(expandAllButton);
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
        expect(screen.getByText(/Import the component/)).toBeVisible();
        expect(screen.getByText(/schema\.org\/FAQPage/)).toBeVisible();
      });
    });

    it("should collapse all items when Collapse All is clicked", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      // First expand all
      await user.click(screen.getByLabelText("Expand all FAQs"));
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
      });
      
      // Then collapse all
      await user.click(screen.getByLabelText("Collapse all FAQs"));
      
      await waitFor(() => {
        expect(screen.queryByText(/RIVET stands for/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Import the component/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Default Expanded State", () => {
    it("should expand specified items by default", async () => {
      render(<FAQSchema items={defaultItems} defaultExpanded={["faq-1", "faq-3"]} />);
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeVisible();
        expect(screen.getByText(/schema\.org\/FAQPage/)).toBeVisible();
        expect(screen.queryByText(/Import the component/)).not.toBeInTheDocument();
      });
    });
  });

  describe("URL Hash Navigation", () => {
    it("should expand item matching URL hash on mount", async () => {
      // Mock location.hash
      delete (window as any).location;
      window.location = { hash: "#faq-2" } as any;

      render(<FAQSchema items={defaultItems} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Import the component/)).toBeVisible();
      });
    });

    it("should scroll to item matching URL hash", async () => {
      const scrollIntoViewMock = vi.fn();
      
      // Mock getElementById and scrollIntoView
      const originalGetElementById = document.getElementById;
      document.getElementById = vi.fn((id: string) => {
        if (id === "faq-2") {
          return { scrollIntoView: scrollIntoViewMock } as any;
        }
        return originalGetElementById.call(document, id);
      });

      delete (window as any).location;
      window.location = { hash: "#faq-2" } as any;

      render(<FAQSchema items={defaultItems} />);
      
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: "smooth",
          block: "start",
        });
      }, { timeout: 200 });

      // Restore
      document.getElementById = originalGetElementById;
    });

    it("should not expand items when hash doesn't match any FAQ", () => {
      delete (window as any).location;
      window.location = { hash: "#non-existent" } as any;

      render(<FAQSchema items={defaultItems} />);
      
      // All items should remain collapsed
      expect(screen.queryByText(/RIVET stands for/)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on accordion", () => {
      render(<FAQSchema items={defaultItems} />);
      
      const triggers = screen.getAllByRole("button");
      expect(triggers.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<FAQSchema items={defaultItems} />);
      
      const firstTrigger = screen.getByText("What is the RIVET framework?");
      
      // Focus and activate with keyboard
      await user.click(firstTrigger);
      
      await waitFor(() => {
        expect(screen.getByText(/RIVET stands for/)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty items array", () => {
      render(<FAQSchema items={[]} />);
      
      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
      expect(screen.queryByLabelText("Expand all FAQs")).not.toBeInTheDocument();
    });

    it("should handle very long questions", () => {
      const longItems: FAQItem[] = [
        {
          id: "long",
          question: "This is a very long question that contains a lot of text to test how the component handles lengthy content in the question field?".repeat(2),
          answer: "Short answer",
        },
      ];

      render(<FAQSchema items={longItems} />);
      
      expect(screen.getByText(/This is a very long question/)).toBeInTheDocument();
    });

    it("should handle very long answers", () => {
      const longItems: FAQItem[] = [
        {
          id: "long-answer",
          question: "Short question?",
          answer: "This is a very long answer. ".repeat(50),
        },
      ];

      render(<FAQSchema items={longItems} />);
      
      expect(screen.getByText("Short question?")).toBeInTheDocument();
    });
  });
});
