/**
 * Bot Detection Utilities
 *
 * Provides helper functions to check if a request is from a bot using Vercel BotID.
 *
 * Usage in API Routes:
 * ```typescript
 * import { checkBotId } from 'botid/server';
 *
 * export async function POST(request: NextRequest) {
 *   const verification = await checkBotId();
 *   if (verification.isBot) {
 *     return new Response('Access denied', { status: 403 });
 *   }
 *   // Process request
 * }
 * ```
 *
 * Requirements:
 * 1. Client-side initialization in instrumentation-client.ts with initBotId()
 * 2. Route protection configuration: initBotId({ protect: [...] })
 * 3. next.config.ts wrapped with withBotId()
 * 4. Use checkBotId() in API routes (not Server Components)
 *
 * See: https://vercel.com/docs/botid/get-started
 */

/**
 * Re-export checkBotId from botid/server for convenience
 *
 * Use this in API routes that are configured in initBotId({ protect: [...] })
 *
 * @example
 * ```typescript
 * import { checkBotId } from '@/lib/bot-detection';
 *
 * export async function POST(request: NextRequest) {
 *   const verification = await checkBotId();
 *   if (verification.isBot) {
 *     return NextResponse.json({ error: 'Bot detected' }, { status: 403 });
 *   }
 *   // Your business logic
 * }
 * ```
 */
export { checkBotId } from 'botid/server';
