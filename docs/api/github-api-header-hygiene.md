{/* TLP:CLEAR */}

# GitHub API Header Hygiene

**Implementation Date:** October 20, 2025  
**Status:** ✅ Complete

## Overview

The GitHub contributions API (`/api/github-contributions`) now properly handles missing `GITHUB_TOKEN` by conditionally building headers instead of sending an empty `Authorization` header. This improves HTTP header hygiene and follows GitHub API best practices.

## Problem

Previously, when `GITHUB_TOKEN` was not configured, the code would send:

```typescript
headers: {
  'Authorization': '', // Empty string - bad practice
  'Content-Type': 'application/json',
  'User-Agent': '...',
}
```

**Issues:**
- Sends unnecessary header with empty value
- Not following HTTP best practices
- May trigger warnings or different behavior in some API implementations
- Violates principle of "don't send headers you don't need"

## Solution

Headers are now built conditionally:

```typescript
// Build headers conditionally
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'User-Agent': `${SITE_DOMAIN}-portfolio`,
};

// Only add Authorization header if token is present
if (process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

// Use the headers object
const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers,
  // ...
});
```

## Implementation Details

### File Changed
- `/src/app/api/github-contributions/route.ts`

### Changes Made
1. **Headers Object Construction**
   - Create base headers object with required fields
   - Conditionally add `Authorization` only when token exists
   - Use proper TypeScript typing (`HeadersInit`)

2. **Type Safety**
   - Uses `HeadersInit` type for proper type checking
   - Ensures headers conform to Fetch API standards

3. **Clean Separation**
   - Clear separation between required and optional headers
   - Easy to understand and maintain

## Behavior Comparison

### Before
```typescript
// With token
Authorization: "Bearer ghp_xxx..."
// Without token
Authorization: "" ❌ Empty string sent
```

### After
```typescript
// With token
Authorization: "Bearer ghp_xxx..."
// Without token
Authorization: (header not sent) ✅ Clean
```

## Benefits

1. **HTTP Best Practices** - Only send headers that have values
2. **Cleaner Requests** - Smaller request headers without token
3. **API Compliance** - Better adherence to REST/GraphQL conventions
4. **Maintainability** - Clearer intent in code
5. **Type Safety** - Proper TypeScript typing for headers

## GitHub API Behavior

### With Token (Authenticated)
- Rate limit: 5,000 requests/hour
- Full API access
- `Authorization: Bearer ghp_xxx...` header sent

### Without Token (Unauthenticated)
- Rate limit: 60 requests/hour
- Public API access only
- No `Authorization` header sent
- Warning message returned to client

## Testing

### Test Without Token
1. Comment out `GITHUB_TOKEN` in `.env.development.local`
2. Restart dev server
3. Visit page with GitHub heatmap component
4. Check Network tab in DevTools:
   - Request to `/api/github-contributions`
   - Should NOT have `Authorization` header
5. Component should still work with rate limit warning

### Test With Token
1. Set valid `GITHUB_TOKEN` in environment
2. Restart dev server
3. Visit page with GitHub heatmap
4. Check Network tab:
   - Request should have `Authorization: Bearer ghp_...`
5. Should work with higher rate limits

## Related Changes

This follows the same pattern implemented for the contact form email fallback:
- Check configuration before using it
- Don't send incomplete/empty values
- Provide graceful degradation
- Clear user feedback

## Code Inspection

To verify the fix, inspect the network request:

```bash
# In browser DevTools Network tab
1. Filter: /api/github-contributions
2. Click on request
3. Headers tab → Request Headers
4. Look for Authorization header

# Without token: header should be absent
# With token: header should show "Bearer ghp_..."
```

## Future Enhancements

Consider:
- Add request/response logging for debugging
- Implement retry logic for rate limit errors
- Cache GitHub API responses
- Support multiple GitHub accounts
- Add metrics for API usage monitoring

## Best Practices Applied

✅ **Conditional Headers** - Only send headers when needed  
✅ **Type Safety** - Use proper TypeScript types  
✅ **Clean Code** - Clear intent and easy to maintain  
✅ **Error Handling** - Existing error handling still works  
✅ **Documentation** - Code comments explain the logic  

## Related Files

- `/src/app/api/github-contributions/route.ts` - GitHub API handler
- `/src/components/github-heatmap.tsx` - Heatmap component
- `/docs/platform/view-counts.md` - Related API documentation
- `.env.development.local` - Environment configuration

## See Also

- [GitHub GraphQL API Docs](https://docs.github.com/en/graphql)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Contact API Fallback](./contact-fallback) - Similar pattern
