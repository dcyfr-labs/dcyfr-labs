import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmbedGenerator } from "@/components/activity";

describe("EmbedGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders with default options", () => {
    render(<EmbedGenerator />);

    expect(screen.getByText("Embed Activity Feed")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Source (optional)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Time Range (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Number of Items")).toBeInTheDocument();
  });

  it("generates correct embed URL with no filters", () => {
    render(<EmbedGenerator />);

    const codeBlock = screen.getByRole("code");
    const codeText = codeBlock.textContent || "";
    expect(codeText).toContain('src="');
    expect(codeText).toContain('/activity/embed"');
  });

  it("updates embed URL when source filter is selected", () => {
    render(<EmbedGenerator />);

    const sourceSelect = screen.getByLabelText("Filter by Source (optional)");
    fireEvent.change(sourceSelect, { target: { value: "blog" } });

    const codeBlock = screen.getByRole("code");
    const codeText = codeBlock.textContent || "";
    expect(codeText).toContain("source=blog");
  });

  it("updates embed URL when time range is selected", () => {
    render(<EmbedGenerator />);

    const timeRangeSelect = screen.getByLabelText("Time Range (optional)");
    fireEvent.change(timeRangeSelect, { target: { value: "week" } });

    const codeBlock = screen.getByText(/timeRange=week/);
    expect(codeBlock).toBeInTheDocument();
  });

  it("updates embed URL when limit is changed", () => {
    render(<EmbedGenerator />);

    const limitInput = screen.getByLabelText("Number of Items");
    fireEvent.change(limitInput, { target: { value: "50" } });

    const codeBlock = screen.getByText(/limit=50/);
    expect(codeBlock).toBeInTheDocument();
  });

  it("updates iframe dimensions", () => {
    render(<EmbedGenerator />);

    const widthInput = screen.getByLabelText("Width");
    const heightInput = screen.getByLabelText("Height");

    fireEvent.change(widthInput, { target: { value: "800px" } });
    fireEvent.change(heightInput, { target: { value: "400px" } });

    const codeBlock = screen.getByText(/width="800px"/);
    expect(codeBlock).toBeInTheDocument();
    expect(screen.getByText(/height="400px"/)).toBeInTheDocument();
  });

  it("copies embed code to clipboard", async () => {
    const writeTextMock = vi.spyOn(navigator.clipboard, "writeText");
    render(<EmbedGenerator />);

    const copyButton = screen.getByLabelText("Copy embed code");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByLabelText("Copy embed code")).toHaveAttribute(
        "class",
        expect.stringContaining("success")
      );
    });
  });

  it("shows check icon after successful copy", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<EmbedGenerator />);

    const copyButton = screen.getByLabelText("Copy embed code");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Copy embed code")).toHaveAttribute(
        "class",
        expect.stringContaining("success")
      );
    });
  });

  it("includes auto-resize script in generated code", () => {
    render(<EmbedGenerator />);

    const codeBlock = screen.getByText(/activity-embed-resize/);
    expect(codeBlock).toBeInTheDocument();
  });

  it("displays preview link with correct URL", () => {
    render(<EmbedGenerator />);

    const sourceSelect = screen.getByLabelText("Filter by Source (optional)");
    fireEvent.change(sourceSelect, { target: { value: "github" } });

    const previewLink = screen.getByText("Preview embed in new window");
    expect(previewLink).toHaveAttribute(
      "href",
      expect.stringContaining("/activity/embed?source=github")
    );
  });

  it("combines multiple filter parameters correctly", () => {
    render(<EmbedGenerator />);

    const sourceSelect = screen.getByLabelText("Filter by Source (optional)");
    const timeRangeSelect = screen.getByLabelText("Time Range (optional)");
    const limitInput = screen.getByLabelText("Number of Items");

    fireEvent.change(sourceSelect, { target: { value: "blog" } });
    fireEvent.change(timeRangeSelect, { target: { value: "month" } });
    fireEvent.change(limitInput, { target: { value: "30" } });

    const codeBlock = screen.getByText(
      /source=blog.*timeRange=month.*limit=30/
    );
    expect(codeBlock).toBeInTheDocument();
  });

  it("displays usage instructions", () => {
    render(<EmbedGenerator />);

    expect(screen.getByText("Usage Instructions:")).toBeInTheDocument();
    expect(screen.getByText(/Customize the options above/)).toBeInTheDocument();
    expect(
      screen.getByText(/Copy the generated embed code/)
    ).toBeInTheDocument();
  });

  it("handles clipboard copy failure gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Copy failed")
    );

    render(<EmbedGenerator />);

    const copyButton = screen.getByLabelText("Copy embed code");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to copy:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
