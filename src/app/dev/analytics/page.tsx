// Server wrapper: allow page only in development. The heavy client UI lives in
// `AnalyticsClient` so we can perform an environment check on the server and
// return a 404 for preview/production environments.

import { assertDevOr404 } from "@/lib/dev-only";
// Import the client component directly - the client component file contains
// "use client" so it will be rendered on the client. We perform the server
// environment check below and return a 404 in non-dev environments.
import AnalyticsClient from "./AnalyticsClient";

// Force dynamic so the server check runs at request time.
export const dynamic = "force-dynamic";

export default function Page() {
  // Centralized helper: assert dev or render 404. Keeps behavior consistent
  // across developer-only pages.
  assertDevOr404();

  return <AnalyticsClient />;
}
