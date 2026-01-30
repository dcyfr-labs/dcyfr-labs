<!-- TLP:CLEAR -->

# Blog View Counts

Implements per-post view tracking using a Redis-compatible datastore.

## Overview
- **Feature**: Increments and displays total views for each `/blog/[slug]` page.
- **Storage**: Uses a Redis instance reachable via `REDIS_URL` (Upstash, Redis Cloud, etc.).
- **Runtime**: Node.js App Router route. A singleton Redis client is reused across requests to avoid connection churn.

## Environment Variables
| Name | Description |
| --- | --- |
| `REDIS_URL` | Connection string for the Redis database (e.g. `redis://default:password@host:port`). |

Add the variable in Vercel → Project → Settings → Environment Variables, then pull it locally:

```bash
vercel env pull .env.development.local
```

Restart `npm run dev` after updating environment variables.

## How It Works
1. `src/lib/views.ts` exposes `incrementPostViews` and `getPostViews` helpers backed by Redis `INCR` / `GET`.
2. `src/app/blog/[slug]/page.tsx` calls `incrementPostViews(slug)` before rendering, then reads the resulting count.
3. The page renders a badge with the formatted total and emits `interactionStatistic` JSON-LD metadata when a count is available.

Redis keys follow the pattern `views:post:<slug>`.

## Verification Steps
1. Run the dev server: `npm run dev`.
2. Visit `http://localhost:3000/blog/<slug>` and refresh a few times.
3. The "views" badge should increment; inspect Redis to confirm:
   ```bash
   npx redis-cli -u "$REDIS_URL" get views:post/<slug>
   # or with Upstash REST:
   curl "https://<UPSTASH_ENDPOINT>/get/views:post/<slug>?_token=<TOKEN>"
   ```
4. On Vercel, open Storage > Redis instance > Data tab to view keys.

## Operational Notes
- Counts are best-effort; failures fall back to rendering without the badge.
- Rate limiting is not applied yet; add IP throttling if exposing an increment endpoint.
- To reset counts for a post: delete the key `views:post:<slug>`.
- For staging/previews, point `REDIS_URL` to a separate namespace to avoid polluting production data.

## Future Enhancements
- Add IP-based deduplication window to prevent rapid refresh inflation.
- Expose aggregated analytics (e.g., most viewed posts API).
- Visualize daily/weekly trends using an additional time-series structure if needed.
