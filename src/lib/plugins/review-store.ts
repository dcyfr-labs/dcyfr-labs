/**
 * Plugin Review Store
 *
 * Module-level singleton for the plugin rating and review system.
 * Uses PluginRatingAggregator from @dcyfr/ai with an in-memory store.
 *
 * In a production system, this would be backed by a database.
 * Reviews are lost on server restart — acceptable for this phase.
 *
 * @module lib/plugins/review-store
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForReviews = globalThis as unknown as { __pluginReviewAggregator?: any };

let aggregatorInstance: PluginRatingAggregatorType | null = null;

type PluginRatingAggregatorType = import('@dcyfr/ai').PluginRatingAggregator;

/**
 * Get or create the singleton PluginRatingAggregator.
 * Lazy-initializes on first access to avoid import issues in edge runtime.
 */
export async function getReviewStore(): Promise<PluginRatingAggregatorType> {
  if (!aggregatorInstance) {
    // Dynamically import to support edge runtime and avoid circular deps
    const { PluginRatingAggregator } = await import('@dcyfr/ai');

    // Use globalThis to survive hot-reloads in development
    if (globalForReviews.__pluginReviewAggregator) {
      aggregatorInstance = globalForReviews.__pluginReviewAggregator as PluginRatingAggregatorType;
    } else {
      aggregatorInstance = new PluginRatingAggregator({ autoApproveOnCreate: true });
      globalForReviews.__pluginReviewAggregator = aggregatorInstance;
    }
  }
  return aggregatorInstance;
}
