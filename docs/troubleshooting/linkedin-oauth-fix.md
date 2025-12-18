# LinkedIn OAuth Troubleshooting Guide

## ✅ Issue Resolved: Missing NEXT_PUBLIC_SITE_URL

**Error:** `{"error":"Internal server error during LinkedIn OpenID callback","details":"fetch failed"}`

**Root Cause:** The `NEXT_PUBLIC_SITE_URL` environment variable was missing/commented out, causing the LinkedIn OAuth callback to fail when constructing the redirect URI.

**Fix Applied:**
1. Uncommented `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`
2. Enhanced error handling in the LinkedIn callback route for better diagnostics
3. Added proper logging and troubleshooting tips in error responses

## 🔧 Quick Fix Summary

**Before:**
```env
# NEXT_PUBLIC_SITE_URL=https://www.dcyfr.ai  # Commented out
```

**After:**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # Active for local development
```

## 🛠️ Diagnostic Script

Created `scripts/debug-linkedin-oauth.mjs` to help diagnose LinkedIn OAuth issues:

```bash
node scripts/debug-linkedin-oauth.mjs
```

This script checks:
- ✅ Required environment variables
- ✅ Network connectivity to LinkedIn
- ✅ Redirect URI configuration
- ✅ Common troubleshooting tips

## 🔐 Enhanced Authentication in Social Dashboard

Updated the `/dev/social` dashboard with improved authentication:

### Re-authentication Buttons
- **Profile Access**: Opens LinkedIn OpenID Connect flow in popup window
- **Posting Access**: Opens LinkedIn Community Management API flow in popup window  
- **Test Connection**: Validates current token status

### Enhanced Error Handling
- Better error messages with specific troubleshooting steps
- Network error detection and guidance
- Popup window management for OAuth flows
- Console logging for debugging

## 📋 Environment Variables Required

For LinkedIn OAuth to work, ensure these are set in `.env.local`:

```env
# Required for OAuth callback
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # localhost for dev, your domain for prod

# LinkedIn OpenID App (for authentication)
LINKEDIN_OPENID_CLIENT_ID=your_client_id
LINKEDIN_OPENID_CLIENT_SECRET=your_client_secret

# LinkedIn Posting App (for content management)
LINKEDIN_POSTING_CLIENT_ID=your_posting_client_id
LINKEDIN_POSTING_CLIENT_SECRET=your_posting_client_secret
```

## 🔗 LinkedIn App Configuration

Make sure your LinkedIn apps are configured with these redirect URIs:

**Development:**
- `http://localhost:3000/api/auth/linkedin/callback`
- `http://localhost:3000/api/auth/linkedin/posting/callback`

**Production:**
- `https://your-domain.com/api/auth/linkedin/callback`  
- `https://your-domain.com/api/auth/linkedin/posting/callback`

## 🚨 Common Pitfalls to Avoid

1. **Missing NEXT_PUBLIC_SITE_URL**: Always set this variable (most common issue)
2. **HTTP/HTTPS Mismatch**: Use http for localhost, https for production
3. **Redirect URI Mismatch**: Must match LinkedIn app settings exactly
4. **Wrong LinkedIn App Product**: Need "Sign In with LinkedIn using OpenID Connect"
5. **Network Issues**: Check firewall/VPN settings if fetch fails

## 🏥 How to Troubleshoot Future Issues

1. **Run the diagnostic script:**
   ```bash
   node scripts/debug-linkedin-oauth.mjs
   ```

2. **Check server logs for detailed error info**
3. **Verify LinkedIn app settings in developer console**
4. **Test network connectivity to LinkedIn endpoints**
5. **Use the enhanced error messages for specific guidance**

## 📱 Testing the Fix

1. Visit `/dev/social` in your browser
2. Select LinkedIn platform
3. Click "Settings" tab
4. Try "Re-authenticate Profile Access" button
5. Complete the LinkedIn authorization flow
6. Check for successful token storage

The OAuth flow should now work correctly with proper error handling and debugging information.

---

**Status:** ✅ Resolved  
**Date:** December 16, 2025  
**Files Modified:**
- `.env.local` (uncommented NEXT_PUBLIC_SITE_URL)
- `src/app/api/auth/linkedin/callback/route.ts` (enhanced error handling)
- `src/components/admin/social-manager.tsx` (improved authentication UX)
- `scripts/debug-linkedin-oauth.mjs` (diagnostic tool)