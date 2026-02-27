import { notFound } from 'next/navigation';

/**
 * Assert the current runtime is development; otherwise render a 404.
 *
 * Use this from server components for developer-only pages. It calls
 * Next's `notFound()` which will render the app's 404 page.
 */
export function assertDevOr404() {
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  // Allow a force-disable override. In some build/test environments env vars or
  // .env files can cause pages to be prerendered as development content. Set
  // DISABLE_DEV_PAGES=1 to explicitly disable dev pages during
  // builds or tests.
  const disableFlag = process.env.DISABLE_DEV_PAGES === '1';
  const isDev = !disableFlag && (nodeEnv === 'development' || vercelEnv === 'development');

  if (!isDev) {
    notFound();
  }
}

export default assertDevOr404;
