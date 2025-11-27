import { Inngest } from "inngest";

/**
 * Inngest client for sending and receiving events
 * 
 * @remarks
 * The client ID should match your app name for better organization
 * in the Inngest dashboard. This is used to:
 * - Send events to trigger functions
 * - Define serverless functions that respond to events
 * - Track function executions and logs
 * 
 * @see https://www.inngest.com/docs/reference/client/create
 */
export const inngest = new Inngest({ id: "dcyfr-labs" });
