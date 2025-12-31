/**
 * Barrel export for views module
 * Re-exports from views.server.ts for backward compatibility
 */
export {
  incrementPostViews,
  getPostViews,
  getPostViews24h,
  getPostViewsInRange,
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from './views.server';
