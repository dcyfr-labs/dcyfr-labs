# LinkedIn Automated Token Management

This system automatically manages LinkedIn OAuth token lifecycle, eliminating the need for manual token refresh every few months.

## 🎯 Overview

LinkedIn tokens typically expire every 60 days and rarely include refresh tokens. This system:

1. **Automatically stores tokens** when obtained via OAuth
2. **Monitors expiration dates** and sends proactive alerts
3. **Attempts automatic refresh** when refresh tokens are available
4. **Sends re-authorization alerts** when manual intervention is needed
5. **Provides a dashboard** for monitoring token status

## 📋 Features

### Automatic Token Storage
- Tokens are automatically stored in Redis when OAuth completes
- Expiration tracking with 1-hour buffer for safety
- Scheduled background jobs for proactive monitoring

### Smart Refresh Strategy
```typescript
// 1. Try refresh token (if available)
if (tokenInfo.refreshToken) {
  const success = await refreshWithRefreshToken();
  if (success) return;
}

// 2. Send re-authorization alert
await sendReAuthAlert();
```

### Multi-Channel Alerts
- **Console logs** for immediate visibility
- **Email alerts** (if configured)
- **Dashboard notifications** for admin UI
- **Sentry alerts** for monitoring integration

### Background Monitoring
- **Daily checks** at 9 AM UTC
- **Scheduled refresh** 7 days before expiration
- **Critical alerts** when < 3 days remaining
- **Warning alerts** when < 7 days remaining

## 🏗️ Architecture

```
┌─────────────────────┐    ┌──────────────────────┐
│   OAuth Callback    │    │   Token Manager      │
│                     │───▶│                      │
│ - Store tokens      │    │ - Track expiration   │
│ - Schedule refresh  │    │ - Monitor status     │
└─────────────────────┘    └──────────────────────┘
                                       │
                                       ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Background Jobs   │    │   Alert System      │
│                     │    │                      │
│ - Daily monitoring  │◀───│ - Email alerts      │
│ - Automatic refresh │    │ - Dashboard notices  │
└─────────────────────┘    └──────────────────────┘
```

## 🔧 Implementation

### 1. Token Storage (Automatic)

When users complete OAuth, tokens are automatically stored:

```typescript
// In OAuth callback
await LinkedInTokenManager.storeToken(tokenData, 'openid');
```

### 2. Application Usage

Use the LinkedIn API helper for automatic token management:

```typescript
// Automatically handles token validation and refresh
const profile = await LinkedInAPI.getUserProfile();
const postResult = await LinkedInAPI.createPost(content);
```

### 3. Monitoring Dashboard

Add to your admin interface:

```tsx
import { LinkedInTokenStatus } from '@/components/admin/linkedin-token-status';

<LinkedInTokenStatus className="mb-6" />
```

### 4. Manual Operations (API)

Check token status programmatically:

```bash
# Get token status
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/linkedin/tokens

# Force token refresh
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tokenType": "openid"}' \
  http://localhost:3000/api/linkedin/tokens
```

## 📅 Timeline Example

```
Day 0:  User completes OAuth → Token stored (expires Day 60)
Day 53: Scheduled refresh attempt (7 days before expiry)
Day 56: Warning alert sent (if refresh failed)
Day 57: Critical alert sent
Day 58: Final alert with re-auth URL
Day 60: Token expires → Re-authorization required
```

## 🚨 Alert Types

### Email Alerts (if configured)
- **Subject**: "LinkedIn Token Expiration - Action Required"
- **Trigger**: 7 days, 3 days, 1 day before expiry
- **Content**: Re-authorization URLs and instructions

### Dashboard Alerts
- **Visual indicators**: 🟢 (>30 days) 🔵 (7-30 days) 🟡 (<7 days) 🔴 (expired)
- **Re-auth buttons**: Direct links to OAuth flows
- **Status summary**: Days remaining, automatic monitoring status

### Console Logs
```
⚠️ LinkedIn openid token expires in 5 days
🚨 LinkedIn posting re-authorization required: Token expired
🔗 Re-authorization URL: https://yourdomain.com/api/auth/linkedin/posting/authorize
```

## ⚙️ Configuration

### Environment Variables Required
```bash
# Redis for token storage
REDIS_URL=redis://...

# LinkedIn app credentials
LINKEDIN_OPENID_CLIENT_ID=86f4ergw4zh4ux
LINKEDIN_OPENID_CLIENT_SECRET=...
LINKEDIN_POSTING_CLIENT_ID=86w0t9qk94hz04  
LINKEDIN_POSTING_CLIENT_SECRET=...

# Optional: Email alerts
RESEND_API_KEY=...
INNGEST_ERROR_ALERTS_EMAIL=admin@yourdomain.com

# Optional: Admin API access
ADMIN_API_KEY=...
```

### Inngest Functions (Auto-registered)
- `linkedin-token-refresh` - Daily monitoring (9 AM UTC)
- `linkedin-schedule-token-refresh` - Schedule proactive refresh
- `linkedin-handle-token-refresh` - Execute scheduled refresh
- `linkedin-reauth-required` - Handle re-authorization alerts

## 🔒 Security

### Token Storage
- Tokens stored in Redis with automatic expiration
- No tokens in environment variables or code
- Secure transmission via encrypted Redis connection

### API Protection
- Admin API requires `ADMIN_API_KEY`
- Token status endpoint protected by authentication
- Re-authorization URLs use HTTPS in production

### Audit Trail
- All token operations logged to console
- Sentry integration for error tracking
- Inngest dashboard for job monitoring

## 📊 Monitoring

### Inngest Dashboard
- View background job execution
- Check refresh attempt history  
- Monitor alert delivery status
- Replay failed operations

### Application Metrics
- Token expiration countdown
- Refresh success/failure rates
- Re-authorization frequency
- API call success rates

### Health Checks
```bash
# Check Inngest functions
curl http://localhost:3000/api/inngest

# Check token status (requires admin key)
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/linkedin/tokens
```

## 🚀 Usage

### For Users
1. **Complete OAuth once** - System handles the rest
2. **Receive email alerts** when action needed (optional)
3. **Click re-auth links** if automatic refresh fails
4. **No manual token copying** required

### For Developers
```typescript
// Simple API usage - tokens managed automatically
const data = await LinkedInAPI.getUserProfile();
const post = await LinkedInAPI.createPost(content);

// Check if manual intervention needed
const { openidRequired, postingRequired } = await linkedinUtils.checkReAuthRequired();
```

### For Administrators
- Monitor token status via dashboard component
- Receive email alerts for critical expirations
- Force refresh via API if needed
- Track system health via Inngest dashboard

## 🔄 Migration from Manual Management

If you have existing manual token management:

1. **Keep existing tokens** in `.env.local` as backup
2. **Complete OAuth flows** to populate automated system
3. **Verify dashboard shows active tokens**
4. **Remove manual tokens** from environment files
5. **Update application code** to use `LinkedInAPI` helper

The system gracefully handles both approaches during transition.

## 🐛 Troubleshooting

### Tokens Not Being Stored
- Check Redis connection (`REDIS_URL`)
- Verify Inngest functions are registered
- Check OAuth callback success logs

### Refresh Failing
- LinkedIn rarely provides refresh tokens
- Check client secrets are correct
- Verify LinkedIn app permissions

### Alerts Not Sent
- Check `RESEND_API_KEY` configuration  
- Verify `INNGEST_ERROR_ALERTS_EMAIL` is set
- Check Inngest job execution logs

### Manual Re-authorization
If automatic refresh fails completely:

1. Visit re-authorization URLs from dashboard
2. Complete LinkedIn OAuth flows
3. Verify new tokens in dashboard
4. System automatically resumes monitoring

---

**Result**: LinkedIn integration that works reliably without monthly manual intervention. Users complete OAuth once and receive proactive alerts only when manual action is truly needed.