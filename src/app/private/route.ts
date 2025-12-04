import { type NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer") || "direct";
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const url = request.nextUrl.pathname;

  // Log honeypot access for security monitoring (breadcrumb doesn't consume event quota)
  // These will appear in traces when actual errors occur
  Sentry.addBreadcrumb({
    category: "security",
    message: `Honeypot triggered: ${url}`,
    level: "warning",
    data: {
      path: url,
      user_agent: userAgent,
      referer: referer,
      ip: ip,
    },
  });

  Sentry.setContext("honeypot_attempt", {
    path: url,
    user_agent: userAgent,
    referer: referer,
    ip: ip,
    timestamp: new Date().toISOString(),
  });

  // Return 404 to appear like a non-existent route
  return NextResponse.json(
    { error: "Not found" },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}

export async function PUT(request: NextRequest) {
  return GET(request);
}

export async function DELETE(request: NextRequest) {
  return GET(request);
}

export async function PATCH(request: NextRequest) {
  return GET(request);
}

export async function HEAD(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer") || "direct";
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const url = request.nextUrl.pathname;

  // Log honeypot access for security monitoring (breadcrumb doesn't consume event quota)
  Sentry.addBreadcrumb({
    category: "security",
    message: `Honeypot triggered: ${url}`,
    level: "warning",
    data: {
      path: url,
      user_agent: userAgent,
      referer: referer,
      ip: ip,
    },
  });

  Sentry.setContext("honeypot_attempt", {
    path: url,
    user_agent: userAgent,
    referer: referer,
    ip: ip,
    timestamp: new Date().toISOString(),
  });

  return new NextResponse(null, { status: 404 });
}

export async function OPTIONS(request: NextRequest) {
  return GET(request);
}
