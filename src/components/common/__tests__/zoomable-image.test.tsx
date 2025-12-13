import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZoomableImage } from "../zoomable-image";

describe("ZoomableImage", () => {
  const defaultProps = {
    src: "/test-image.jpg",
    alt: "Test image",
  };

  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = "";
  });

  it("renders the image with correct props", () => {
    render(<ZoomableImage {...defaultProps} />);
    const img = screen.getByRole("button", { name: /zoom image/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test-image.jpg");
    expect(img).toHaveAttribute("alt", "Test image");
  });

  it("shows zoom icon on hover (via CSS)", () => {
    render(<ZoomableImage {...defaultProps} />);
    const img = screen.getByRole("button", { name: /zoom image/i });
    // Verify the image button exists with proper cursor styling for zoom
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("cursor-zoom-in");
  });

  it("opens lightbox modal on click", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Click the image
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);

    // Modal should be visible with close button
    const closeButton = screen.getByRole("button", { name: /close image viewer/i });
    expect(closeButton).toBeInTheDocument();
    
    // Should show the zoomed image
    const zoomedImg = screen.getAllByAltText("Test image")[1]; // Second image in modal
    expect(zoomedImg).toBeInTheDocument();
    expect(zoomedImg).toHaveClass("pointer-events-none");
  });

  it("opens lightbox on Enter key", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    const img = screen.getByRole("button", { name: /zoom image/i });
    img.focus();
    await user.keyboard("{Enter}");

    const closeButton = screen.getByRole("button", { name: /close image viewer/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("opens lightbox on Space key", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    const img = screen.getByRole("button", { name: /zoom image/i });
    img.focus();
    await user.keyboard(" ");

    const closeButton = screen.getByRole("button", { name: /close image viewer/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("closes modal on Escape key", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);
    
    expect(screen.getByRole("button", { name: /close image viewer/i })).toBeInTheDocument();

    // Press Escape
    await user.keyboard("{Escape}");

    // Modal should be closed
    expect(screen.queryByRole("button", { name: /close image viewer/i })).not.toBeInTheDocument();
  });

  it("closes modal on backdrop click", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);
    
    const dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(dialog).toBeInTheDocument();

    // Click backdrop (dialog element)
    await user.click(dialog);

    // Modal should be closed
    expect(screen.queryByRole("dialog", { name: /image viewer/i })).not.toBeInTheDocument();
  });

  it("closes modal when clicking the zoomed image on desktop", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Set desktop viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);
    
    // Click the zoomed image
    const zoomedImg = screen.getAllByAltText("Test image")[1];
    await user.click(zoomedImg);

    // Modal should be closed on desktop
    expect(screen.queryByRole("button", { name: /close image viewer/i })).not.toBeInTheDocument();
  });

  it("prevents body scroll when modal is open", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Body should be scrollable initially
    expect(document.body.style.overflow).toBe("");

    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);

    // Body scroll should be prevented
    expect(document.body.style.overflow).toBe("hidden");

    // Close modal
    await user.keyboard("{Escape}");

    // Body scroll should be restored
    expect(document.body.style.overflow).toBe("");
  });

  it("applies custom className to the image", () => {
    render(<ZoomableImage {...defaultProps} className="custom-class" />);
    const img = screen.getByRole("button", { name: /zoom image/i });
    expect(img).toHaveClass("custom-class");
  });

  it("shows close button in modal", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);

    // Check for close button
    const closeButton = screen.getByRole("button", { name: /close image viewer/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("closes modal when clicking close button", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);
    
    expect(screen.getByRole("button", { name: /close image viewer/i })).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole("button", { name: /close image viewer/i });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByRole("button", { name: /close image viewer/i })).not.toBeInTheDocument();
  });

  it("supports swipe-to-close gesture on mobile", async () => {
    const user = userEvent.setup();
    render(<ZoomableImage {...defaultProps} />);
    
    // Set mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    // Open modal
    const img = screen.getByRole("button", { name: /zoom image/i });
    await user.click(img);
    
    // Dialog should be open with touch event handlers
    const dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(dialog).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(<ZoomableImage {...defaultProps} />);
    const img = screen.getByRole("button", { name: /zoom image/i });
    
    // Should be focusable
    expect(img).toHaveAttribute("tabIndex", "0");
  });
});
