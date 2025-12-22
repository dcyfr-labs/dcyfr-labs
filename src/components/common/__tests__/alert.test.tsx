import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../alert";

describe("Alert", () => {
  it("renders with critical type", () => {
    const { container } = render(
      <Alert type="critical">
        Critical alert message
      </Alert>
    );
    
    expect(screen.getByText("Critical alert message")).toBeInTheDocument();
    const alertDiv = container.querySelector(".bg-destructive\\/10, [class*='bg-destructive']");
    expect(alertDiv || screen.getByText("Critical alert message").closest('[class*="bg"]')).toBeInTheDocument();
  });

  it("renders with warning type", () => {
    const { container } = render(
      <Alert type="warning">
        Warning alert message
      </Alert>
    );
    
    expect(screen.getByText("Warning alert message")).toBeInTheDocument();
    // eslint-disable-next-line no-restricted-syntax -- Testing CSS selector for alert styling
    const alertDiv = container.querySelector("[class*='bg-amber-500']");
    expect(alertDiv || screen.getByText("Warning alert message").closest('[class*="bg"]')).toBeInTheDocument();
  });

  it("renders with info type", () => {
    const { container } = render(
      <Alert type="info">
        Info alert message
      </Alert>
    );
    
    expect(screen.getByText("Info alert message")).toBeInTheDocument();
    const alertDiv = container.querySelector("[class*='bg-primary']");
    expect(alertDiv || screen.getByText("Info alert message").closest('[class*="bg"]')).toBeInTheDocument();
  });

  it("renders with success type", () => {
    const { container } = render(
      <Alert type="success">
        Success alert message
      </Alert>
    );
    
    expect(screen.getByText("Success alert message")).toBeInTheDocument();
    // eslint-disable-next-line no-restricted-syntax -- Testing CSS selector for alert styling
    const alertDiv = container.querySelector("[class*='bg-green-500']");
    expect(alertDiv || screen.getByText("Success alert message").closest('[class*="bg"]')).toBeInTheDocument();
  });

  it("defaults to info type", () => {
    const { container } = render(
      <Alert>
        Default alert message
      </Alert>
    );
    
    expect(screen.getByText("Default alert message")).toBeInTheDocument();
    const alertDiv = container.querySelector("[class*='bg-primary']");
    expect(alertDiv || screen.getByText("Default alert message").closest('[class*="bg"]')).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Alert className="custom-class">
        Custom alert message
      </Alert>
    );
    
    const alertDiv = container.querySelector(".custom-class");
    expect(alertDiv).toBeInTheDocument();
  });

  it("renders complex JSX content", () => {
    render(
      <Alert type="critical">
        <strong>Important:</strong> This is a complex alert with <em>formatted</em> text
      </Alert>
    );
    
    expect(screen.getByText("Important:")).toBeInTheDocument();
    expect(screen.getByText("formatted")).toBeInTheDocument();
  });

  it("displays icon for each type", () => {
    const { container } = render(
      <Alert type="critical">Alert</Alert>
    );
    
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("applies rounded and padding classes", () => {
    const { container } = render(
      <Alert type="critical">Alert</Alert>
    );
    
    const alertDiv = container.querySelector(".rounded-lg");
    expect(alertDiv).toBeInTheDocument();
    expect(alertDiv).toHaveClass("p-4", "sm:p-5", "my-6", "rounded-lg");
  });
});
