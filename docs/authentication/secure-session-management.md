# Secure Session Management

**AES-256 encrypted session storage in Redis for cross-environment authentication.**

## Overview

The DCYFR Labs platform uses a secure session management system built on Redis with AES-256-GCM encryption. This provides robust authentication that works consistently across Development, Preview, and Production environments.

## Architecture

```
Authentication Flow:
User Login → OAuth/Credential Validation → Encrypted Session Creation → Redis Storage
                                                     ↓
User Request → Cookie/Header Check → Decrypt Session → Validate & Update Activity
```

### Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **SecureSessionManager** | Core session management with encryption | `src/lib/secure-session-manager.ts` |
| **Auth Utils** | Helper functions for session operations | `src/lib/auth-utils.ts` |
| **Auth Middleware** | Request-level authentication protection | `src/lib/auth-middleware.ts` |
| **Background Jobs** | Automated cleanup and monitoring | `src/inngest/session-management.ts` |

## Security Features

### 🔐 Encryption
- **AES-256-GCM** encryption for all session data
- **Unique initialization vectors** for each session
- **Authentication tags** for tamper detection
- **Key derivation** from `SESSION_ENCRYPTION_KEY` environment variable

### 🛡️ Protection
- **CSRF token** generation and validation
- **Secure cookie settings** (HttpOnly, Secure, SameSite)
- **Automatic expiration** with configurable timeouts
- **Session revocation** for compromised accounts

### 🔄 Monitoring
- **Automated cleanup** of expired sessions
- **Health monitoring** with alerts
- **Admin dashboard** for session statistics
- **Security audits** and reporting

## Quick Start

### 1. Environment Configuration

```bash
# Generate encryption key
openssl rand -base64 32

# Add to .env.local
SESSION_ENCRYPTION_KEY="your-generated-key"
REDIS_URL="rediss://default:password@host:port"
COOKIE_DOMAIN=".yourdomain.com"  # Optional for production
```

### 2. Basic Usage

```typescript
// Create session after login
import { createAuthSession, setAuthCookies } from '@/lib/auth-utils';

const { sessionToken, csrfToken } = await createAuthSession({
  id: user.id,
  email: user.email,
  permissions: ['user']
}, 24); // 24-hour expiry

// Set secure cookies
const response = NextResponse.redirect('/dashboard');
return setAuthCookies(response, sessionToken, csrfToken, 24);
```

```typescript
// Protect API routes
import { withAuth } from '@/lib/auth-middleware';

export const POST = withAuth(async (request) => {
  const user = getRequestUser(request);
  // Handle authenticated request
}, {
  requireAuth: true,
  requireCSRF: true,
  requiredPermissions: ['admin']
});
```

## API Endpoints

### Authentication Status
```bash
GET /api/auth/session
# Returns current session status and user info
```

### Session Management
```bash
POST /api/auth/session
# Refresh session expiry
{
  "expiryHours": 24
}

DELETE /api/auth/session
# Logout and destroy session
```

### Admin Operations (requires admin permission)
```bash
GET /api/admin/sessions?action=stats
# Get session statistics

POST /api/admin/sessions
# Administrative actions
{
  "action": "cleanup" | "revoke_user_sessions" | "emergency_lockdown",
  "userId": "user-id",  // for revoke_user_sessions
  "reason": "string"    // for emergency actions
}
```

## Authentication Middleware

### Protection Levels

| Middleware | Auth Required | CSRF Required | Permissions |
|------------|---------------|---------------|-------------|
| `withAuth` | ✅ Yes | ✅ Yes | Configurable |
| `withOptionalAuth` | ❌ No | ❌ No | None |
| `withReadOnlyAuth` | ✅ Yes | ❌ No (GET only) | None |
| `withAdminAuth` | ✅ Yes | ✅ Yes | Admin only |
| `withLinkedInAuth` | ✅ Yes | ✅ Yes | LinkedIn permissions |

### Usage Examples

```typescript
// Basic protection
export const { GET, POST } = createProtectedHandler({
  GET: async (request) => { /* ... */ },
  POST: async (request) => { /* ... */ }
});

// Admin-only routes  
export const { GET, POST } = createAdminHandler({
  GET: async (request) => { /* ... */ },
  POST: async (request) => { /* ... */ }
});

// Custom protection
export const POST = withAuth(handler, {
  requireAuth: true,
  requireCSRF: true,
  requiredPermissions: ['posts:write'],
  updateActivity: true
});
```

## Background Jobs

### Automated Tasks

| Job | Schedule | Purpose |
|-----|----------|---------|
| **Session Cleanup** | Daily at 2 AM | Remove expired sessions |
| **Session Monitoring** | Hourly | Track metrics and alerts |
| **Security Audit** | Weekly (Sunday 3 AM) | Security health checks |

### Event-Driven Tasks

| Event | Purpose |
|-------|---------|
| `auth/revoke-user-sessions` | Revoke all sessions for specific user |
| `auth/emergency-lockdown` | Emergency session destruction |

### Manual Triggers

```typescript
// Revoke user sessions
await inngest.send({
  name: 'auth/revoke-user-sessions',
  data: { userId: 'user-123', reason: 'Security breach' }
});

// Emergency lockdown
await inngest.send({
  name: 'auth/emergency-lockdown',
  data: { reason: 'Critical security incident', initiatedBy: 'admin' }
});
```

## Client Integration

### React Hook Example

```typescript
// Custom hook for session management
function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data.authenticated ? data : null);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setSession(null);
  };

  const refreshSession = async (hours = 24) => {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiryHours: hours })
    });
  };

  return { session, loading, logout, refreshSession };
}
```

### CSRF Protection

```typescript
// Include CSRF token in API requests
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

## Monitoring & Admin

### Session Statistics Dashboard

The `SessionMonitor` component provides real-time session statistics:

```typescript
// Add to admin dashboard
import { SessionMonitor } from '@/components/admin/session-monitor';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/admin/sessions?action=stats')
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, []);

  return <SessionMonitor stats={stats} />;
}
```

### Health Monitoring

The system provides several health indicators:

- **Session Health Score**: Percentage of active vs total sessions
- **Cleanup Alerts**: High numbers of expired sessions
- **Business Hours Monitoring**: No active sessions during peak hours
- **Security Metrics**: Encryption status, Redis connectivity

## Environment-Specific Configuration

### Development
```bash
# .env.local
SESSION_ENCRYPTION_KEY="dev-key-from-openssl-rand"
REDIS_URL="redis://localhost:6379"  # Local Redis
# COOKIE_DOMAIN not needed for localhost
```

### Preview/Staging  
```bash
# Vercel environment variables
SESSION_ENCRYPTION_KEY="staging-key-32-bytes"
REDIS_URL="rediss://staging:password@host:port"
COOKIE_DOMAIN=".staging.yourdomain.com"
```

### Production
```bash
# Production environment
SESSION_ENCRYPTION_KEY="production-key-32-bytes-secure"
REDIS_URL="rediss://production:password@host:port"
COOKIE_DOMAIN=".yourdomain.com"
```

## Security Best Practices

### Key Management
- ✅ **Use different keys** for each environment
- ✅ **Rotate keys quarterly** (requires session recreation)
- ✅ **Store keys securely** (never in code)
- ✅ **Generate with cryptographically secure methods**

### Session Configuration
- ✅ **Set appropriate expiry times** (24 hours default)
- ✅ **Use HTTPS in production** (secure cookies)
- ✅ **Configure proper SameSite settings**
- ✅ **Enable CSRF protection for state changes**

### Monitoring
- ✅ **Monitor session health regularly**
- ✅ **Set up alerts for anomalies**
- ✅ **Run regular security audits**
- ✅ **Review admin session logs**

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "SESSION_ENCRYPTION_KEY not configured" | Missing environment variable | Generate and set encryption key |
| "Redis not configured" | Missing REDIS_URL | Configure Redis connection |
| Sessions not persisting | Incorrect cookie settings | Check HTTPS/domain configuration |
| CSRF validation fails | Missing token in request | Include X-CSRF-Token header |
| Decryption errors | Key mismatch/corruption | Verify encryption key consistency |

### Debug Commands

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Generate new encryption key
openssl rand -base64 32

# Check session health
curl -X GET http://localhost:3000/api/admin/sessions?action=health

# Manual session cleanup
curl -X POST http://localhost:3000/api/admin/sessions \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'
```

## Migration Guide

### From Cookie Sessions
1. Install dependencies: `@upstash/redis`
2. Generate encryption key: `openssl rand -base64 32`
3. Update environment variables
4. Replace session creation with `createAuthSession()`
5. Update middleware to use `withAuth()`
6. Test cross-environment compatibility

### From JWT Tokens
1. Keep existing auth validation logic
2. Add session creation after JWT validation
3. Update API routes to use session middleware
4. Migrate to secure cookie storage
5. Add session monitoring and cleanup

---

**Status**: Production Ready  
**Last Updated**: December 15, 2025  
**Dependencies**: Redis, @upstash/redis, Inngest  
**Security Level**: AES-256-GCM encryption, CSRF protection, secure cookies