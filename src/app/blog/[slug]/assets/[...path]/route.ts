import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Serve static assets co-located with blog posts
 * 
 * URL pattern: /blog/{slug}/assets/{filename}
 * File location: src/content/blog/{slug}/{filename}
 *              or src/content/blog/private/{slug}/{filename} (dev only)
 * 
 * Supports images, videos, and other static files.
 * Returns 404 for non-existent files or disallowed extensions.
 */

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");
const PRIVATE_CONTENT_DIR = path.join(process.cwd(), "src/content/blog/private");

// Allowed file extensions and their MIME types
const ALLOWED_EXTENSIONS: Record<string, string> = {
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  // Videos
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  // Documents
  ".pdf": "application/pdf",
  // Data
  ".json": "application/json",
  ".csv": "text/csv",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  const { slug, path: pathSegments } = await params;
  
  // Reconstruct the file path from segments
  const filename = pathSegments.join("/");
  
  // Security: Prevent directory traversal attacks
  if (filename.includes("..") || slug.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Get the file extension
  const ext = path.extname(filename).toLowerCase();
  
  // Only allow specific file types
  if (!ALLOWED_EXTENSIONS[ext]) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Try public content first
  let filePath = path.join(CONTENT_DIR, slug, filename);

  // Then try private content (only in development)
  if (!fs.existsSync(filePath) && process.env.NODE_ENV !== "production") {
    filePath = path.join(PRIVATE_CONTENT_DIR, slug, filename);
  }

  // Ensure the file exists and is within allowed content directories
  const isInPublicDir = filePath.startsWith(CONTENT_DIR);
  const isInPrivateDir = process.env.NODE_ENV !== "production" && filePath.startsWith(PRIVATE_CONTENT_DIR);
  
  if (!isInPublicDir && !isInPrivateDir) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Read and return the file
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = ALLOWED_EXTENSIONS[ext];

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
