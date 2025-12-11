import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";

const DOCS_ROOT = join(process.cwd(), "docs");

/**
 * API route for editing documentation files
 * GET: Returns the raw markdown content
 * POST: Saves the updated markdown content
 */
export async function GET(request: NextRequest) {
  // Disallow this route in production; only enable for development or when explicitly allowed
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Missing path parameter" },
      { status: 400 }
    );
  }

  // Security: prevent path traversal
  if (path.includes("..") || path.startsWith("/")) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400 }
    );
  }

  const filePath = join(DOCS_ROOT, `${path}.md`);
  const resolved = resolve(filePath);
  if (!resolved.startsWith(resolve(DOCS_ROOT))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content, path });
  } catch (error) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Disallow this route in production; only enable for development or when explicitly allowed
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { path, content } = await request.json();

    if (!path || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing path or content" },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    const filePath = join(DOCS_ROOT, `${path}.md`);
    const resolved = resolve(filePath);
    if (!resolved.startsWith(resolve(DOCS_ROOT))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Save the file
    await writeFile(filePath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "File saved successfully",
      path,
    });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }
}
