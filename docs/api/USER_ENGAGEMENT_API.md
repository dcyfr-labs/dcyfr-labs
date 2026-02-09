{/* TLP:CLEAR */}

# User Engagement API

**Created:** February 5, 2026
**Status:** ✅ Production Ready
**Authentication:** Required (Session Token or Bearer Token)

## Overview

Server-backed storage for user engagement data (bookmarks, likes, preferences) with cross-device synchronization. Requires authentication via session tokens for security.

## Endpoints

### GET `/api/user/engagement/:key`

Retrieve engagement data for authenticated user.

**Authentication:** Required
**Method:** GET

**Path Parameters:**
- `key` (string, required) - Engagement data key (e.g., `bookmarks`, `liked-posts`)

**Response (200):**
```json
{
  "value": {
    // Your engagement data
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Key does not exist
- `400 Bad Request` - Invalid key parameter

**Example:**
```typescript
const response = await fetch('/api/user/engagement/bookmarks', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
const data = await response.json();
console.log(data.value); // Bookmark data
```

---

### POST `/api/user/engagement/:key`

Store or update engagement data for authenticated user.

**Authentication:** Required
**Method:** POST
**Content-Type:** application/json

**Path Parameters:**
- `key` (string, required) - Engagement data key

**Request Body:**
```json
{
  "value": {
    // Your engagement data to store
  }
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication
- `400 Bad Request` - Missing value in request body
- `500 Internal Server Error` - Storage operation failed

**Example:**
```typescript
const response = await fetch('/api/user/engagement/bookmarks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    value: {
      bookmarks: [...],
      lastUpdated: new Date().toISOString(),
    },
  }),
});
```

**Data Expiration:**
- Engagement data expires after 90 days of inactivity
- Prevents accumulation of stale records
- Regular syncs reset the expiration timer

---

### DELETE `/api/user/engagement/:key`

Remove engagement data for authenticated user.

**Authentication:** Required
**Method:** DELETE

**Path Parameters:**
- `key` (string, required) - Engagement data key to delete

**Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Key does not exist (still returns success)

**Example:**
```typescript
const response = await fetch('/api/user/engagement/bookmarks', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
```

---

### HEAD `/api/user/engagement/:key`

Check if engagement data exists for authenticated user.

**Authentication:** Required
**Method:** HEAD

**Path Parameters:**
- `key` (string, required) - Engagement data key to check

**Response:**
- `200 OK` - Key exists
- `404 Not Found` - Key does not exist
- `401 Unauthorized` - Missing or invalid authentication

**Example:**
```typescript
const response = await fetch('/api/user/engagement/bookmarks', {
  method: 'HEAD',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
const exists = response.status === 200;
```

---

## Authentication

### Session Token (Cookie)

Automatically included when using browser fetch/axios:

```typescript
// No explicit auth header needed - cookie sent automatically
const response = await fetch('/api/user/engagement/bookmarks');
```

### Bearer Token (Header)

For API clients or mobile apps:

```typescript
const response = await fetch('/api/user/engagement/bookmarks', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
```

---

## Storage Backend

**Provider:** Upstash Redis (serverless)
**Key Format:** `engagement:{userId}:{key}`
**Expiration:** 90 days (automatic cleanup)
**Environment:** Separate databases for production/preview/dev

**Example Keys:**
- `engagement:user123:bookmarks`
- `engagement:user123:liked-posts`
- `engagement:user123:preferences`

---

## Usage with Storage Adapter

### Client-Side (Automatic Adaptation)

```typescript
import { createStorageAdapter } from '@/lib/storage-adapter';

// Adapter automatically uses API storage for authenticated users
const adapter = createStorageAdapter(isAuthenticated, authToken);

// Save bookmark
await adapter.set('bookmarks', {
  bookmarks: [...],
  lastUpdated: new Date().toISOString(),
});

// Load bookmark
const data = await adapter.get('bookmarks');
```

### Server-Side Bookmark Sync

```typescript
import { syncBookmarksWithServer } from '@/lib/activity/bookmarks';

// Sync bookmarks to server (requires auth)
const result = await syncBookmarksWithServer(
  collection,
  isAuthenticated,
  authToken
);

if (result.syncStatus === 'synced') {
  console.log('✅ Bookmarks synced to server');
} else if (result.syncStatus === 'error') {
  console.error('❌ Sync failed:', result.syncError);
}
```

---

## Security

### Input Validation
- Key parameter sanitized (alphanumeric + dashes/underscores only)
- Maximum key length: 255 characters
- JSON body size limit: 1MB

### Authentication
- Session tokens validated via `getAuthenticatedUser()`
- Expired sessions rejected (401)
- No guest/unauthenticated access

### Data Isolation
- User ID embedded in Redis key (`engagement:{userId}:*`)
- Cross-user access prevented by key structure
- No enumeration of other users' data

---

## Testing

**Test Coverage:** 11/11 tests passing (100%)

**Test File:** `tests/lib/bookmark-sync.test.ts`

**Scenarios Covered:**
- ✅ Unauthenticated users (local-only storage)
- ✅ Authenticated users (server sync)
- ✅ Sync error handling (network failures)
- ✅ Server data loading
- ✅ Conflict resolution (merge local + server)
- ✅ Empty collection handling

**Run Tests:**
```bash
npx vitest run tests/lib/bookmark-sync.test.ts
```

---

## Migration Path

### Phase 1: Local Storage (Current Default)
- Unauthenticated users use `localStorage`
- Data persists only in browser
- No cross-device sync

### Phase 2: OAuth Integration (Complete)
- Authenticated users use API storage
- Data persists to Redis backend
- Cross-device sync enabled

### Phase 3: Data Migration (Future)
- On first OAuth login, migrate localStorage → server
- Use `migrateLocalStorageToApi()` helper
- Preserve guest-created bookmarks

---

## Related Files

**API Routes:**
- `src/app/api/user/engagement/[key]/route.ts` - CRUD endpoints
- `src/app/api/user/engagement/route.ts` - Collection operations

**Storage Layer:**
- `src/lib/storage-adapter.ts` - Adapter pattern (local + API)
- `src/lib/activity/bookmarks.ts` - Bookmark sync logic

**Authentication:**
- `src/lib/auth-utils.ts` - Session validation
- `src/lib/secure-session-manager.ts` - Session storage

**Tests:**
- `tests/lib/bookmark-sync.test.ts` - Sync functionality tests

---

## Future Enhancements

### Bulk Operations
- `GET /api/user/engagement` - List all keys for user
- `DELETE /api/user/engagement` - Clear all user data

### Real-Time Sync
- WebSocket connection for live updates
- Server-Sent Events for push notifications
- Optimistic updates with conflict resolution

### Analytics
- Track sync frequency per user
- Monitor engagement data size
- Alert on excessive storage usage

---

**Last Updated:** February 5, 2026
**Maintainer:** DCYFR Labs Team
**Status:** ✅ Production Ready
