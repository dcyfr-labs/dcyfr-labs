"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS, TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DownloadableAssetProps {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  fileType?: "pdf" | "doc" | "xls" | "zip" | "other";
  requireEmail?: boolean;
  onDownload?: (email?: string) => void;
  className?: string;
}

/**
 * DownloadableAsset - Lead capture form with file delivery
 *
 * Features:
 * - Optional email capture before download
 * - File type icons and metadata
 * - Success state with confirmation
 * - Email validation
 * - Analytics tracking
 * - Direct download trigger
 *
 * @example
 * ```tsx
 * <DownloadableAsset
 *   title="Security Checklist"
 *   description="Comprehensive security audit checklist"
 *   fileUrl="/downloads/security-checklist.pdf"
 *   fileName="security-checklist.pdf"
 *   fileSize="2.3 MB"
 *   fileType="pdf"
 *   requireEmail
 * />
 * ```
 */
export function DownloadableAsset({
  title,
  description,
  fileUrl,
  fileName,
  fileSize,
  fileType = "other",
  requireEmail = false,
  onDownload,
  className,
}: DownloadableAssetProps) {
  const [email, setEmail] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDownload = () => {
    // Email validation if required
    if (requireEmail) {
      if (!email.trim()) {
        setError("Email is required to download this file");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    setError("");

    // Track analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "file_download", {
        event_category: "engagement",
        event_label: fileName,
        value: requireEmail ? email : undefined,
      });
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Call callback
    onDownload?.(requireEmail ? email : undefined);

    // Show success state
    setIsDownloaded(true);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "xls":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "zip":
        return <Download className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div
      className={cn(
        "downloadable-asset",
        "border rounded-lg p-6 bg-card",
        BORDERS.card,
        `my-${SPACING.lg}`,
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="flex-shrink-0">{getFileIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}

          {/* File Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="uppercase font-medium">{fileType.toUpperCase()}</span>
            {fileSize && (
              <>
                <span>•</span>
                <span>{fileSize}</span>
              </>
            )}
          </div>

          {/* Success State */}
          {isDownloaded ? (
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-green-600 dark:text-green-500",
                ANIMATION.transition.base
              )}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>
                {requireEmail
                  ? "Download started! Check your email for the file."
                  : "Download started!"}
              </span>
            </div>
          ) : (
            <>
              {/* Email Input (if required) */}
              {requireEmail && (
                <div className="mb-4">
                  <Label htmlFor="download-email" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="download-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={cn(error && "border-red-500")}
                    aria-invalid={!!error}
                    aria-describedby={error ? "download-error" : undefined}
                  />
                  {error && (
                    <p
                      id="download-error"
                      className="text-sm text-red-500 mt-1"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Download Button */}
              <Button onClick={handleDownload} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download {fileType.toUpperCase()}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
