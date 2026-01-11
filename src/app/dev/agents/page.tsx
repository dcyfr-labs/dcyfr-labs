// Server wrapper: allow page only in development
// Heavy client UI lives in AgentsClient

import type { Metadata } from "next";
import { assertDevOr404 } from "@/lib/dev-only";
import { createPageMetadata } from "@/lib/metadata";
import AgentsClient from "./AgentsClient";

export const metadata: Metadata = createPageMetadata({
  title: "AI Agent Dashboard",
  description:
    "Development dashboard for AI agent metrics, performance tracking, and cost analysis",
  path: "/dev/agents",
});

export default function Page() {
  assertDevOr404();

  return <AgentsClient />;
}
