"use server";

/**
 * Server Actions for Agent Telemetry
 *
 * These server actions provide a bridge between client components and the
 * @dcyfr/ai telemetry system, which requires Node.js APIs.
 */

import { telemetry } from "./compat";
import type { ComparisonStats } from "./agent-telemetry";
import type { HandoffPatterns } from "@dcyfr/ai";

/**
 * Get agent comparison statistics
 */
export async function getAgentComparison(
  period: string = "30d"
): Promise<ComparisonStats> {
  return await telemetry.compareAgents(period);
}

/**
 * Get handoff patterns
 */
export async function getHandoffPatterns(
  period: string = "30d"
): Promise<HandoffPatterns> {
  return await telemetry.getHandoffPatterns(period);
}
