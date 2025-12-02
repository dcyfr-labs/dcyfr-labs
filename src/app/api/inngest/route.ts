import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
import { contactFormSubmitted } from "@/inngest/contact-functions";
import { 
  refreshGitHubData, 
  manualRefreshGitHubData 
} from "@/inngest/github-functions";
import {
  trackPostView,
  handleMilestone,
  calculateTrending,
  generateAnalyticsSummary,
  dailyAnalyticsSummary,
} from "@/inngest/blog-functions";

/**
 * Inngest API endpoint for Next.js App Router
 * 
 * @remarks
 * This route handler serves all Inngest functions and provides:
 * - Development UI at /api/inngest (local development only)
 * - Webhook endpoint for Inngest Cloud to trigger functions
 * - Function registration and discovery
 * 
 * In development:
 * - Visit http://localhost:3000/api/inngest to see the Inngest Dev Server UI
 * - Test functions directly from the UI
 * - View function logs and step-by-step execution
 * 
 * In production:
 * - Inngest Cloud uses this endpoint as a webhook
 * - Configure the webhook URL in your Inngest dashboard
 * - Example: https://www.dcyfr.ai/api/inngest
 * 
 * @see https://www.inngest.com/docs/sdk/serve
 * @see https://www.inngest.com/docs/deploy/nextjs
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Demo function
    helloWorld,
    
    // Contact form processing
    contactFormSubmitted,
    
    // GitHub data refresh
    refreshGitHubData,           // Scheduled: every 5 minutes
    manualRefreshGitHubData,    // Event-driven: manual refresh
    
    // Blog analytics
    trackPostView,               // Event-driven: on post view
    handleMilestone,             // Event-driven: on milestone reached
    calculateTrending,           // Scheduled: hourly
    generateAnalyticsSummary,    // Event-driven: on demand
    dailyAnalyticsSummary,       // Scheduled: daily at midnight UTC
  ],
});
