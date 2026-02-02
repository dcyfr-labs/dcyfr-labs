# MCP Configuration Security Guide

**Secure MCP Server Configuration & Deployment for dcyfr-labs**

Version: 1.0.0
Based on: Enterprise-Grade Security for MCP (arxiv:2504.08623)
Last Updated: February 2, 2026

---

## Overview

This guide provides security-hardened configurations for all 16 MCP servers in `.mcp.json`. Each configuration follows enterprise security best practices from the Narajala & Habler MCP security framework.

---

## Configuration Structure

### Secure MCP Server Template

```json
{
  "mcpServers": {
    "SERVER_NAME": {
      // Server identity and access
      "command": "execution command",
      "args": ["argument", "array"],
      "type": "stdio|http",

      // Security controls (NEW)
      "security": {
        // Authentication & Authorization
        "auth": {
          "required": true,
          "method": "oauth2", // oauth2, mTLS, jwt
          "mfa": true,
          "tokenLifetime": 900  // 15 minutes
        },

        // Input/Output Validation
        "validation": {
          "inputSchema": "strict|relaxed",
          "rejectUnknownFields": true,
          "maxPayloadSize": 1048576  // 1MB
        },

        // Rate Limiting
        "rateLimit": {
          "requestsPerMinute": 60,
          "requestsPerHour": 1000
        },

        // Access Control
        "rbac": {
          "roles": ["admin", "user"],
          "permissions": ["read", "write"]
        }
      },

      // Monitoring & Observability
      "observability": {
        "logging": "debug|info|warn|error",
        "metrics": true,
        "tracing": true
      }
    }
  }
}
```

---

## Server-Specific Configurations

### 1. INTERNAL SERVERS

#### 1.1 Memory MCP

**Purpose:** Session context management
**Risk:** 🟡 MEDIUM (session hijacking)
**Data:** Session state, temporary context

```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"],
    "type": "stdio",

    "security": {
      "auth": {
        "required": true,
        "method": "oauth2",
        "mfa": false,  // Session-based, user already MFA'd
        "tokenLifetime": 900
      },
      "validation": {
        "inputSchema": "strict",
        "rejectUnknownFields": true,
        "maxPayloadSize": 1048576
      },
      "rateLimit": {
        "requestsPerMinute": 1000  // Lenient for session operations
      }
    },

    "observability": {
      "logging": "info",
      "metrics": true,
      "redactSensitiveFields": ["session_token", "auth_header"]
    },

    "notes": "Session data cleared on logout. No persistent storage."
  }
}
```

**Security Checklist:**
- ✅ In-memory only (no disk persistence)
- ✅ Cleared on session termination
- ✅ No sensitive data stored
- ✅ Rate limiting prevents resource exhaustion

#### 1.2 Filesystem MCP

**Purpose:** Local file access (`/public`, `/docs`)
**Risk:** 🔴 CRITICAL (unauthorized file access)
**Data:** Public-facing files

```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/drew/DCYFR/code/dcyfr-labs"
    ],
    "type": "stdio",

    "security": {
      // Strict authentication
      "auth": {
        "required": true,
        "method": "oauth2",
        "scope": ["files:read", "files:list"],  // No write by default
        "mfa": true,
        "tokenLifetime": 600  // 10 minutes
      },

      // Path whitelisting
      "pathControl": {
        "allowlist": [
          "/Users/drew/DCYFR/code/dcyfr-labs/public/**",
          "/Users/drew/DCYFR/code/dcyfr-labs/docs/**"
        ],
        "denylist": [
          "*/.env*",
          "*/.git/**",
          "*/node_modules/**",
          "*/.next/**",
          "*/src/**"
        ],
        "symlinkResolution": "forbid"  // Prevent escape
      },

      // Input validation
      "validation": {
        "inputSchema": "strict",
        "rejectUnknownFields": true,
        "pathTraversalPrevention": true,
        "maxPayloadSize": 52428800  // 50MB for large files
      },

      // Rate limiting
      "rateLimit": {
        "requestsPerMinute": 50,
        "totalBytesPerHour": 1073741824  // 1GB
      }
    },

    "monitoring": {
      "logging": "warn",  // Log all file access
      "alertOn": [
        "path_denied",
        "rate_limit_exceeded",
        "large_file_access",
        "unusual_pattern"
      ]
    },

    "notes": "CRITICAL: Write access requires explicit approval. All read operations logged."
  }
}
```

**Security Checklist:**
- ✅ Whitelist-only path access
- ✅ Symlink resolution disabled
- ✅ Path traversal prevention
- ✅ Sensitive file patterns blocked
- ✅ All access logged with alerts
- ✅ Rate limiting prevents exfiltration

**Operational Controls:**
```bash
# Monitor for suspicious access patterns
grep "path_denied\|rate_limit" logs/mcp-filesystem.log

# Audit file access (daily)
npm run audit:filesystem-access

# Test path restrictions
npm run test:filesystem-security
```

#### 1.3 dcyfr-analytics MCP

**Purpose:** User analytics & behavior data
**Risk:** 🔴 CRITICAL (PII/GDPR violation)
**Data:** User behavior, potentially PII

```json
{
  "dcyfr-analytics": {
    "type": "stdio",
    "command": "npx",
    "args": ["dotenv", "-e", ".env.local", "--", "npm", "run", "mcp:analytics"],
    "cwd": "/Users/drew/DCYFR/code/dcyfr-labs",

    "security": {
      // Strictest authentication
      "auth": {
        "required": true,
        "method": "oauth2",
        "scope": ["analytics:read"],  // Read-only
        "mfa": true,
        "tokenLifetime": 900,  // 15 minutes
        "audience": "dcyfr-analytics-only"
      },

      // JIT Access
      "jitAccess": {
        "enabled": true,
        "approvalRequired": true,
        "approvers": ["analytics-lead@dcyfr.ai"],
        "autoExpire": 3600  // 1 hour
      },

      // Query Whitelisting
      "queryControl": {
        "allowlistMode": true,
        "approvedQueries": [
          "user_count_anonymized",
          "page_views_by_route",
          "error_rates",
          "feature_usage"
        ],
        "forbiddenPatterns": [
          ".*email.*",  // Never expose emails
          ".*password.*",
          ".*session.*",
          ".*cookie.*"
        ]
      },

      // Output Filtering
      "outputFiltering": {
        "dlpEnabled": true,
        "anonymization": {
          "user_id": "hash:sha256",
          "email": "domain_only",
          "ip_address": "last_octet_masked"
        },
        "redactPatterns": [
          { "pattern": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b", "replacement": "[email]" },
          { "pattern": "\\d{3}-\\d{2}-\\d{4}", "replacement": "SSN:***" }
        ]
      },

      // Rate Limiting
      "rateLimit": {
        "requestsPerMinute": 10,
        "recordsPerRequest": 10000,
        "totalBytesPerHour": 104857600  // 100MB
      }
    },

    "monitoring": {
      "logging": "info",  // Log all queries
      "alertOn": [
        "query_denied",
        "rate_limit_exceeded",
        "large_export",
        "pii_detection",
        "anomalous_access_pattern"
      ],
      "auditRetention": 730  // 2 years (GDPR)
    },

    "notes": "CRITICAL: PII/GDPR-sensitive. All access requires approval. Queries anonymized."
  }
}
```

**Security Checklist:**
- ✅ OAuth 2.0 with MFA required
- ✅ JIT access with approval
- ✅ Query whitelist enforced
- ✅ PII anonymization enforced
- ✅ DLP integration active
- ✅ 2-year audit trail
- ✅ GDPR-compliant

**Compliance:**
```bash
# Verify GDPR compliance
npm run compliance:gdpr

# Test PII anonymization
npm run test:pii-anonymization

# Audit access patterns (weekly)
npm run audit:analytics-access
```

#### 1.4 dcyfr-designtokens MCP

**Purpose:** Design token management
**Risk:** 🟠 HIGH (IP theft)
**Data:** Design system tokens, colors, spacing

```json
{
  "dcyfr-designtokens": {
    "type": "stdio",
    "command": "npm",
    "args": ["run", "mcp:tokens"],
    "cwd": "/Users/drew/DCYFR/code/dcyfr-labs",

    "security": {
      // Strong authentication
      "auth": {
        "required": true,
        "method": "oauth2",
        "scope": ["design:read"],  // Read-only
        "mfa": false,  // Can be relaxed for read-only internal use
        "tokenLifetime": 1800  // 30 minutes
      },

      // Input validation
      "validation": {
        "inputSchema": "strict",
        "rejectUnknownFields": true,
        "maxPayloadSize": 1048576
      },

      // Rate limiting
      "rateLimit": {
        "requestsPerMinute": 100,
        "totalBytesPerHour": 52428800  // 50MB
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "write_attempt",  // Alert on any write attempt
        "rate_limit_exceeded",
        "external_access"  // Flag if accessed from outside dcyfr-labs
      ]
    },

    "notes": "Read-only access to design system. No modifications allowed via MCP."
  }
}
```

#### 1.5 dcyfr-contentmanager MCP

**Purpose:** Editorial content management
**Risk:** 🟡 MEDIUM (content theft)
**Data:** Blog posts, documentation (not yet published)

```json
{
  "dcyfr-contentmanager": {
    "type": "stdio",
    "command": "npm",
    "args": ["run", "mcp:content"],
    "cwd": "/Users/drew/DCYFR/code/dcyfr-labs",

    "security": {
      // Authentication
      "auth": {
        "required": true,
        "method": "oauth2",
        "scope": ["content:read", "content:write"],  // Read + Write
        "mfa": true,
        "tokenLifetime": 1800  // 30 minutes
      },

      // Draft content protection
      "contentControl": {
        "draftMode": "hidden",  // Unpublished content not accessible
        "publishedOnly": false,  // Allow draft access for authorized users
      },

      // Rate limiting (write operations are stricter)
      "rateLimit": {
        "readRequestsPerMinute": 100,
        "writeRequestsPerMinute": 10,  // Stricter for modifications
        "totalBytesPerHour": 104857600  // 100MB
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "content_modified",
        "draft_accessed",
        "publish_action",
        "delete_attempt"
      ]
    },

    "notes": "Content access logged. Write operations require audit trail."
  }
}
```

---

### 2. EXTERNAL SERVERS (Third-Party)

#### 2.1 GitHub MCP

**Purpose:** GitHub integration
**Risk:** 🔴 CRITICAL (source code, credentials)
**Data:** Repositories, source code, API tokens

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",

    "security": {
      // Mutual TLS
      "tls": {
        "enabled": true,
        "version": "1.3",
        "certificatePin": {
          "publicKeySHA256": "sha256/abc123..."
        }
      },

      // Authentication
      "auth": {
        "required": true,
        "method": "oauth2",
        "tokenRotation": 300,  // Rotate every 5 minutes
        "mfa": true,
        "scope": ["repo:read", "gist:read"],  // Read-only, minimal scope
        "tokenLifetime": 600  // 10 minutes maximum
      },

      // JIT Access (for write operations)
      "jitAccess": {
        "enabled": true,
        "requiredFor": ["repo:push", "repo:admin"],
        "approvalRequired": true,
        "maxDuration": 300  // 5 minutes
      },

      // Input validation
      "validation": {
        "inputSchema": "strict",
        "forbiddenOperations": [
          "delete_repo",
          "delete_branch",
          "force_push",
          "change_settings"
        ]
      },

      // Rate limiting
      "rateLimit": {
        "requestsPerMinute": 10,  // Strict - GitHub API rate limiting
        "burstLimit": 15
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "forbidden_operation",
        "authentication_failure",
        "token_compromise_indicator",
        "unusual_repository_access",
        "mass_clone_attempt"
      ],
      "externalMonitoring": true  // Flag unusual activity to GitHub
    },

    "notes": "CRITICAL: Manage GitHub tokens securely. Short-lived, read-only by default."
  }
}
```

**GitHub Token Management:**
```bash
# Create short-lived GitHub token (from Vercel Secrets Manager)
GITHUB_TOKEN=$(aws secretsmanager get-secret-value --secret-id github-token | jq .SecretString)

# Verify token permissions
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user/permissions

# Rotate tokens monthly
npm run rotate:github-token
```

#### 2.2 Vercel MCP

**Purpose:** Deployment management
**Risk:** 🟠 HIGH (deployment config, secrets)
**Data:** Deployment configuration, environment variables

```json
{
  "vercel": {
    "url": "https://mcp.vercel.com",
    "type": "http",

    "security": {
      "tls": {
        "enabled": true,
        "version": "1.3"
      },

      "auth": {
        "required": true,
        "method": "oauth2",
        "mfa": true,
        "scope": ["deployments:read", "projects:read"],
        "tokenLifetime": 1800  // 30 minutes
      },

      "jitAccess": {
        "enabled": true,
        "requiredFor": ["deployments:create", "projects:admin"],
        "approvalRequired": true
      },

      "validation": {
        "forbiddenOperations": [
          "delete_project",
          "modify_domain",
          "change_git_settings",
          "delete_deployment"
        ]
      },

      "rateLimit": {
        "requestsPerMinute": 20
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "deployment_triggered",
        "environment_change",
        "forbidden_operation"
      ]
    }
  }
}
```

#### 2.3 Sentry MCP

**Purpose:** Error tracking & monitoring
**Risk:** 🟠 HIGH (error logs, stack traces, PII)
**Data:** Error logs, stack traces, user context

```json
{
  "sentry": {
    "url": "https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs",
    "type": "http",

    "security": {
      "tls": {
        "enabled": true,
        "version": "1.3"
      },

      "auth": {
        "required": true,
        "method": "oauth2",
        "scope": ["issues:read"],  // Read-only
        "tokenLifetime": 1800
      },

      "outputFiltering": {
        "redactPII": true,
        "patterns": [
          "email",
          "ip_address",
          "user_id",
          "api_key"
        ]
      },

      "rateLimit": {
        "requestsPerMinute": 30
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "pii_in_error",
        "sensitive_endpoint_error",
        "rate_limit_exceeded"
      ]
    }
  }
}
```

#### 2.4 Perplexity MCP

**Purpose:** Search/research capability
**Risk:** 🟡 MEDIUM (query leakage)
**Data:** Search queries (may contain internal context)

```json
{
  "perplexity": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@perplexity-ai/mcp-server"],
    "env": {
      "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
    },

    "security": {
      "auth": {
        "required": true,
        "method": "api_key",
        "keyRotation": 8640  // Every 6 days
      },

      "queryFiltering": {
        "forbiddenPatterns": [
          ".*password.*",
          ".*api.key.*",
          ".*auth.*token.*",
          ".*secret.*"
        ]
      },

      "rateLimit": {
        "requestsPerMinute": 20
      }
    },

    "monitoring": {
      "logging": "info",
      "alertOn": [
        "sensitive_query",
        "rate_limit_exceeded"
      ]
    }
  }
}
```

---

### 3. DEVELOPMENT SERVERS

#### 3.1-3.3 Code Analysis & Testing

```json
{
  "deepgraph-nextjs": {
    "command": "npx",
    "args": ["-y", "mcp-code-graph@latest", "vercel/next.js"],
    "security": {
      "auth": { "required": true, "method": "oauth2" },
      "rateLimit": { "requestsPerMinute": 100 }
    }
  },

  "playwright": {
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"],
    "security": {
      "auth": { "required": true, "method": "oauth2" },
      "rateLimit": { "requestsPerMinute": 50 },
      "outputFiltering": {
        "redactURLs": true,
        "redactCookies": true
      }
    }
  },

  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"],
    "security": {
      "auth": { "required": true, "method": "oauth2" },
      "rateLimit": { "requestsPerMinute": 50 }
    }
  }
}
```

---

## Deployment & Validation

### Pre-Deployment Security Checklist

```bash
#!/bin/bash
# Run before deploying updated .mcp.json

echo "🔐 MCP Security Pre-Deployment Checklist"

# 1. Validate JSON syntax
npm run validate:mcp-json

# 2. Verify authentication is required for all servers
npm run validate:mcp-auth

# 3. Check for hardcoded secrets
npm run scan:mcp-secrets

# 4. Validate rate limiting is configured
npm run validate:mcp-ratelimit

# 5. Test server connectivity
npm run test:mcp-connectivity

# 6. Security scan
npm run security:mcp-scan

echo "✅ All checks passed. Ready for deployment."
```

### Runtime Validation

```typescript
// mcp-security-validator.ts
interface MCPValidation {
  validateConfig(config: MCPConfig): ValidationResult {
    const checks = [
      this.validateAuth(),
      this.validateRateLimit(),
      this.validateOutputFiltering(),
      this.validateInputValidation(),
      this.validateMonitoring(),
    ];

    return checks.every(c => c.passed)
      ? { passed: true }
      : { passed: false, failures: checks.filter(c => !c.passed) };
  }
}
```

---

## Monitoring & Alerting

### MCP Security Metrics

```
# MCP Server Health
mcp_server_online{server="github"} 1
mcp_server_requests_total{server="github", status="success"} 1234
mcp_server_requests_total{server="github", status="denied"} 5

# Security Events
mcp_auth_failures_total{server="github"} 0
mcp_rate_limit_exceeded_total{server="filesystem"} 2
mcp_policy_violations_total{server="analytics"} 0

# Performance
mcp_request_duration_ms{server="github", operation="list_repos"} 234
mcp_payload_bytes{server="filesystem"} 1048576
```

### Alert Rules (Prometheus)

```yaml
groups:
  - name: mcp_security_alerts
    rules:
      - alert: MCPAuthenticationFailure
        expr: rate(mcp_auth_failures_total[5m]) > 0
        for: 1m
        annotations:
          summary: "MCP authentication failures detected"

      - alert: MCPRateLimitExceeded
        expr: rate(mcp_rate_limit_exceeded_total[5m]) > 10
        for: 5m
        annotations:
          summary: "MCP rate limiting triggered"

      - alert: MCPPolicyViolation
        expr: mcp_policy_violations_total > 0
        for: 1m
        annotations:
          summary: "MCP security policy violated"
```

---

## Incident Response

### When an MCP Server is Compromised

1. **Immediate Actions**
   ```bash
   # 1. Isolate the server
   npm run mcp:isolate github

   # 2. Revoke all tokens
   npm run mcp:revoke-tokens github

   # 3. Collect forensics
   npm run mcp:forensics github > /tmp/github-mcp-forensics.log
   ```

2. **Investigation**
   - Review audit logs
   - Identify compromised data
   - Assess user impact

3. **Remediation**
   - Patch vulnerability
   - Rotate credentials
   - Re-enable with hardened config

4. **Communication**
   - Alert security team
   - Notify affected users (if applicable)
   - Update status page

---

## References

- **Paper:** Narajala, V. S., & Habler, I. (2025). Enterprise-Grade Security for the Model Context Protocol. arXiv:2504.08623
- **Framework:** See [docs/MCP_SECURITY_FRAMEWORK.md](../docs/MCP_SECURITY_FRAMEWORK.md)
- **Threat Model:** See [docs/MCP_THREAT_MODEL.md](../docs/MCP_THREAT_MODEL.md)
- **MCP Spec:** https://docs.anthropic.com/claude/protocols/mcp/overview

---

**Document Classification:** Internal Use Only
**Owner:** dcyfr-labs Security Team
**Last Updated:** February 2, 2026

