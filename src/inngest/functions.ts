import { inngest } from "./client";

// Import IP reputation functions
export {
  scheduleIpReputationCheck,
  checkIpReputation,
  handleMaliciousIpDetected,
} from "./ip-reputation-functions";

// Import Credly cache functions
export {
  refreshCredlyCache,
  clearCredlyCache,
} from "./credly-cache-functions";

// Import analytics functions
export { updateAnalyticsMilestones } from "./update-analytics-milestones";

// Import social analytics functions
export {
  syncDevToMetrics,
  manualDevToSync,
  aggregateReferrals,
} from "./social-analytics-functions";

/**
 * Hello World function - demonstrates basic Inngest function pattern
 * 
 * @remarks
 * This function:
 * - Listens for "test/hello.world" events
 * - Waits 1 second using step.sleep for demonstration
 * - Returns a personalized greeting using event data
 * 
 * Event payload structure:
 * ```ts
 * {
 *   name: "test/hello.world",
 *   data: {
 *     email: string
 *   }
 * }
 * ```
 * 
 * Steps are automatically retried on failure and provide:
 * - Automatic retries with exponential backoff
 * - Observability in the Inngest dashboard
 * - Ability to replay from any step
 * 
 * @example
 * // Trigger this function by sending an event:
 * await inngest.send({
 *   name: "test/hello.world",
 *   data: { email: "user@example.com" }
 * });
 * 
 * @see https://www.inngest.com/docs/functions
 */
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
