/**
 * Activity Page Components - Minimal Barrel Export
 *
 * Only exports the components needed for the /activity page to reduce bundle bloat.
 * This prevents unused activity components (heatmap, embed generator, etc) from being
 * bundled into the /activity page route.
 *
 * Used by: src/app/activity/activity-client.tsx
 *
 * Why separate file?
 * The main index.ts exports ALL activity components for flexibility across the app.
 * But the /activity page only needs 2 components, so this export prevents tree-shaking
 * from failing due to circular dependencies in the main barrel export.
 */

export { ActivityFilters } from "./ActivityFilters";
export { ThreadedActivityGroup } from "./ThreadedActivityGroup";
