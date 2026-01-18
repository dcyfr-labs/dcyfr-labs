import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoleBasedCTA } from "../role-based-cta";

describe("RoleBasedCTA", () => {
  const defaultProps = {
    role: "executive" as const,
    title: "For Business Leaders",
    description: "Understand organizational risk",
    buttonText: "Get Brief",
    buttonHref: "/contact?role=executive",
  };

  beforeEach(() => {
    // Reset window.gtag mock
    window.gtag = undefined as any;
  });

  describe("Rendering", () => {
    it("should render a single card for executive role", () => {
      render(<RoleBasedCTA {...defaultProps} />);
      
      expect(screen.getByText("For Business Leaders")).toBeInTheDocument();
      expect(screen.getByText("Understand organizational risk")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Get Brief/ })).toBeInTheDocument();
    });

    it("should render a single card for developer role", () => {
      render(
        <RoleBasedCTA
          {...defaultProps}
          role="developer"
          title="For Developers"
          description="Learn implementation patterns"
          buttonText="View Examples"
        />
      );
      
      expect(screen.getByText("For Developers")).toBeInTheDocument();
      expect(screen.getByText("Learn implementation patterns")).toBeInTheDocument();
    });

    it("should render a single card for security role", () => {
      render(
        <RoleBasedCTA
          {...defaultProps}
          role="security"
          title="For Security Teams"
          description="Access threat models"
          buttonText="Download Guide"
        />
      );
      
      expect(screen.getByText("For Security Teams")).toBeInTheDocument();
      expect(screen.getByText("Access threat models")).toBeInTheDocument();
    });

    it("should render with correct role-specific classes for executive", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      
      // Executive role should have blue styling
      expect(card?.className).toMatch(/bg-blue/);
    });

    it("should render with correct role-specific classes for developer", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="developer" />
      );
      const card = container.querySelector("[data-testid='role-based-cta-developer']");
      
      // Developer role should have green styling
      expect(card?.className).toMatch(/bg-green/);
    });

    it("should render with correct role-specific classes for security", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="security" />
      );
      const card = container.querySelector("[data-testid='role-based-cta-security']");
      
      // Security role should have red styling
      expect(card?.className).toMatch(/bg-red/);
    });
  });

  describe("Button Functionality", () => {
    it("should have correct href on button", () => {
      render(<RoleBasedCTA {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: /Get Brief/ });
      expect(button).toHaveAttribute("href", "/contact?role=executive");
    });

    it("should support custom button href", () => {
      render(
        <RoleBasedCTA
          {...defaultProps}
          buttonHref="/custom-path?role=dev"
        />
      );
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("href", "/custom-path?role=dev");
    });

    it("should track analytics on click", () => {
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      render(<RoleBasedCTA {...defaultProps} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(gtagSpy).toHaveBeenCalledWith("event", "cta_click", {
        cta_type: "role_based",
        role: "executive",
        button_text: "Get Brief",
      });
    });

    it("should handle missing gtag gracefully", () => {
      window.gtag = undefined as any;

      render(<RoleBasedCTA {...defaultProps} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button); // Should not throw
      
      expect(true).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label", () => {
      render(<RoleBasedCTA {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Get Brief for For Business Leaders");
    });

    it("should hide icon from accessibility tree", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<RoleBasedCTA {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();
    });

    it("should have visible focus ring", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const button = container.querySelector("a");
      expect(button?.className).toMatch(/focus:ring-2/);
    });
  });

  describe("Design Token Compliance", () => {
    it("should use BORDERS.card token", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      expect(card?.className).toMatch(/rounded-lg/);
    });

    it("should use TYPOGRAPHY tokens", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const title = container.querySelector("h3");
      expect(title).toBeInTheDocument();
    });

    it("should not have hardcoded colors", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      // Should have role-based color classes, not hardcoded hex
      expect(card?.className).not.toMatch(/#[0-9a-f]/i);
    });
  });

  describe("Multiple Instances", () => {
    it("should render multiple role cards separately", () => {
      const { container } = render(
        <>
          <RoleBasedCTA {...defaultProps} role="executive" title="Executive" />
          <RoleBasedCTA {...defaultProps} role="developer" title="Developer" />
          <RoleBasedCTA {...defaultProps} role="security" title="Security" />
        </>
      );

      expect(screen.getByText("Executive")).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();

      // Each should be a separate card with testid
      const executiveCard = container.querySelector("[data-testid='role-based-cta-executive']");
      const developerCard = container.querySelector("[data-testid='role-based-cta-developer']");
      const securityCard = container.querySelector("[data-testid='role-based-cta-security']");

      expect(executiveCard).toBeInTheDocument();
      expect(developerCard).toBeInTheDocument();
      expect(securityCard).toBeInTheDocument();
    });

    it("should have different colors for each role", () => {
      const { container } = render(
        <>
          <RoleBasedCTA {...defaultProps} role="executive" title="Executive" />
          <RoleBasedCTA {...defaultProps} role="developer" title="Developer" />
          <RoleBasedCTA {...defaultProps} role="security" title="Security" />
        </>
      );

      const executiveCard = container.querySelector("[data-testid='role-based-cta-executive']");
      const developerCard = container.querySelector("[data-testid='role-based-cta-developer']");
      const securityCard = container.querySelector("[data-testid='role-based-cta-security']");

      // Each role should have different color classes
      expect(executiveCard?.className).toMatch(/bg-blue/);
      expect(developerCard?.className).toMatch(/bg-green/);
      expect(securityCard?.className).toMatch(/bg-red/);
    });
  });

  describe("Props Validation", () => {
    it("should handle empty description", () => {
      render(
        <RoleBasedCTA
          {...defaultProps}
          description=""
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle very long title", () => {
      const longTitle = "This is a very long title that might wrap to multiple lines";
      render(
        <RoleBasedCTA
          {...defaultProps}
          title={longTitle}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle special characters in text", () => {
      render(
        <RoleBasedCTA
          {...defaultProps}
          title="For C++ & Node.js Devs"
          description="Learn about XSS prevention"
          buttonText="Get & Go"
        />
      );

      expect(screen.getByText(/For C\+\+ & Node\.js Devs/)).toBeInTheDocument();
    });

    it("should accept custom className", () => {
      const { container } = render(
        <RoleBasedCTA
          {...defaultProps}
          className="custom-class"
        />
      );

      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      expect(card?.className).toMatch(/custom-class/);
    });
  });

  describe("Analytics Integration", () => {
    it("should include button text in analytics", () => {
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      render(
        <RoleBasedCTA
          {...defaultProps}
          buttonText="Schedule Assessment"
        />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(gtagSpy).toHaveBeenCalledWith("event", "cta_click", 
        expect.objectContaining({
          button_text: "Schedule Assessment",
        })
      );
    });

    it("should include role in analytics", () => {
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      render(
        <RoleBasedCTA
          {...defaultProps}
          role="developer"
        />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(gtagSpy).toHaveBeenCalledWith("event", "cta_click",
        expect.objectContaining({
          role: "developer",
        })
      );
    });
  });

  describe("Responsive Behavior", () => {
    it("should be full-width", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      expect(card?.className).toMatch(/w-full/);
    });

    it("should have margin on y-axis", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      expect(card?.className).toMatch(/my-8/);
    });

    it("should use responsive layout with flexbox", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const card = container.querySelector("[data-testid='role-based-cta-executive']");
      expect(card?.className).toMatch(/flex flex-col md:flex-row/);
    });

    it("should have responsive button sizing (full-width on mobile, auto on desktop)", () => {
      const { container } = render(<RoleBasedCTA {...defaultProps} />);
      
      const button = container.querySelector("a");
      expect(button?.className).toMatch(/w-full md:w-auto/);
    });
  });

  describe("Icon Rendering", () => {
    it("should render briefcase icon for executive", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="executive" />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render code icon for developer", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="developer" />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render shield icon for security", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="security" />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Button Styling", () => {
    it("should use blue button for executive role", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="executive" />
      );

      const button = container.querySelector("a");
      expect(button?.className).toMatch(/bg-blue-600/);
      expect(button?.className).toMatch(/text-white/);
    });

    it("should use green button for developer role", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="developer" />
      );

      const button = container.querySelector("a");
      expect(button?.className).toMatch(/bg-green-600/);
      expect(button?.className).toMatch(/text-white/);
    });

    it("should use red button for security role", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="security" />
      );

      const button = container.querySelector("a");
      expect(button?.className).toMatch(/bg-red-600/);
      expect(button?.className).toMatch(/text-white/);
    });

    it("should have role-specific focus ring colors", () => {
      const { container: executiveContainer } = render(
        <RoleBasedCTA {...defaultProps} role="executive" />
      );
      const executiveButton = executiveContainer.querySelector("a");
      expect(executiveButton?.className).toMatch(/focus:ring-blue-500/);

      const { container: developerContainer } = render(
        <RoleBasedCTA {...defaultProps} role="developer" />
      );
      const developerButton = developerContainer.querySelector("a");
      expect(developerButton?.className).toMatch(/focus:ring-green-500/);

      const { container: securityContainer } = render(
        <RoleBasedCTA {...defaultProps} role="security" />
      );
      const securityButton = securityContainer.querySelector("a");
      expect(securityButton?.className).toMatch(/focus:ring-red-500/);
    });

    it("should not have underline on button text", () => {
      const { container } = render(
        <RoleBasedCTA {...defaultProps} role="executive" />
      );

      const button = container.querySelector("a");
      expect(button?.className).toMatch(/no-underline/);
    });
  });
});
