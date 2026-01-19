import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DownloadableAsset } from "../downloadable-asset";

describe("DownloadableAsset", () => {
  beforeEach(() => {
    // Mock gtag
    (window as any).gtag = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render with title", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      expect(screen.getByText("Test Document")).toBeInTheDocument();
    });

    it("should render with description", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          description="This is a test description"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      expect(screen.getByText("This is a test description")).toBeInTheDocument();
    });

    it("should render file metadata", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          fileType="pdf"
          fileSize="2.3 MB"
        />
      );

      expect(screen.getByText("PDF")).toBeInTheDocument();
      expect(screen.getByText("2.3 MB")).toBeInTheDocument();
    });

    it("should render download button", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          fileType="pdf"
        />
      );

      expect(screen.getByRole("button", { name: /Download PDF/i })).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          className="custom-class"
        />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("File Types", () => {
    it("should render PDF icon for PDF files", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          fileType="pdf"
        />
      );

      const icon = container.querySelector(".text-red-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render DOC icon for Word files", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.doc"
          fileName="test.doc"
          fileType="doc"
        />
      );

      const icon = container.querySelector(".text-blue-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render XLS icon for Excel files", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.xls"
          fileName="test.xls"
          fileType="xls"
        />
      );

      const icon = container.querySelector(".text-green-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render ZIP icon for archive files", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.zip"
          fileName="test.zip"
          fileType="zip"
        />
      );

      const icon = container.querySelector(".text-purple-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render default icon for other files", () => {
      const { container } = render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.txt"
          fileName="test.txt"
          fileType="other"
        />
      );

      const icon = container.querySelector(".text-gray-500");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Download Without Email", () => {
    it("should trigger download on button click", () => {
      // Create a real anchor element to avoid mocking issues
      const originalCreateElement = document.createElement.bind(document);
      const mockLink = originalCreateElement("a");
      const clickSpy = vi.spyOn(mockLink, "click").mockImplementation(() => {});
      
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement(tagName);
      });

      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(mockLink.href).toContain("test.pdf");
      expect(mockLink.download).toBe("test.pdf");
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it("should call onDownload callback", () => {
      const onDownload = vi.fn();

      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          onDownload={onDownload}
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(onDownload).toHaveBeenCalledWith(undefined);
    });

    it("should show success message after download", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Download started!/i)).toBeInTheDocument();
      });
    });

    it("should track analytics event", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      expect((window as any).gtag).toHaveBeenCalledWith("event", "file_download", {
        event_category: "engagement",
        event_label: "test.pdf",
        value: undefined,
      });
    });
  });

  describe("Download With Email", () => {
    it("should show email input when requireEmail is true", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });

    it("should show error when email is empty", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(
          screen.getByText("Email is required to download this file")
        ).toBeInTheDocument();
      });
    });

    it("should show error for invalid email", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    it("should accept valid email and trigger download", async () => {
      const onDownload = vi.fn();

      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
          onDownload={onDownload}
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(onDownload).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("should clear error when typing after validation failure", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(
          screen.getByText("Email is required to download this file")
        ).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(
        screen.queryByText("Email is required to download this file")
      ).not.toBeInTheDocument();
    });

    it("should show success message with email confirmation", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Download started! Check your email for the file./i)
        ).toBeInTheDocument();
      });
    });

    it("should track analytics with email", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect((window as any).gtag).toHaveBeenCalledWith("event", "file_download", {
          event_category: "engagement",
          event_label: "test.pdf",
          value: "test@example.com",
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible email input", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("id", "download-email");
    });

    it("should mark invalid email input", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText("Enter your email");
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should associate error message with input", async () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText("Enter your email");
        expect(emailInput).toHaveAttribute("aria-describedby", "download-error");

        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toHaveAttribute("id", "download-error");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle file without size", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          fileType="pdf"
        />
      );

      expect(screen.queryByText("MB")).not.toBeInTheDocument();
    });

    it("should handle file without description", () => {
      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
        />
      );

      // Check that there's no description paragraph
      const paragraphs = screen.queryAllByText(/./);
      const descriptionParagraph = paragraphs.find(
        (p) => p.tagName === "P" && p.textContent !== "Test Document"
      );
      
      // Only the title should be present, no description
      expect(screen.getByText("Test Document")).toBeInTheDocument();
      expect(descriptionParagraph).toBeUndefined();
    });

    it("should handle very long email addresses", async () => {
      const onDownload = vi.fn();
      const longEmail = "verylongemailaddress@verylongdomainname.com";

      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test.pdf"
          fileName="test.pdf"
          requireEmail
          onDownload={onDownload}
        />
      );

      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, { target: { value: longEmail } });

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(onDownload).toHaveBeenCalledWith(longEmail);
      });
    });

    it("should handle special characters in file name", () => {
      const originalCreateElement = document.createElement.bind(document);
      const mockLink = originalCreateElement("a");
      const clickSpy = vi.spyOn(mockLink, "click").mockImplementation(() => {});
      
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement(tagName);
      });

      render(
        <DownloadableAsset
          title="Test Document"
          fileUrl="/test-file (1).pdf"
          fileName="test-file (1).pdf"
        />
      );

      const downloadButton = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(mockLink.download).toBe("test-file (1).pdf");

      createElementSpy.mockRestore();
    });
  });
});
