# Security Policy

## 🔒 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues via one of these methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/dcyfr/dcyfr-labs/security/advisories)
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

2. **Direct Contact**
   - Email: [Contact via website form](https://www.dcyfr.ai/contact)
   - Include "SECURITY" in the subject line
   - Provide as much detail as possible

### What to Include

When reporting a vulnerability, please include:

- **Type of issue** (e.g., XSS, CSRF, injection, authentication bypass)
- **Location** (file path, URL, or affected component)
- **Steps to reproduce** (detailed, step-by-step instructions)
- **Impact assessment** (what an attacker could potentially do)
- **Suggested fix** (if you have one)
- **Your contact information** (for follow-up questions)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 5 business days
- **Fix Timeline:** Depends on severity (see below)

## 🛡️ Security Measures

This project implements comprehensive security controls:

### Content Security Policy (CSP)

- ✅ Nonce-based CSP (Level 2+) with unique cryptographic nonces per request
- ✅ Violation reporting to `/api/csp-report` endpoint
- ✅ Automatic development environment relaxations
- ✅ Fallback CSP in production configuration

### Rate Limiting

- ✅ Redis-backed distributed rate limiting
- ✅ Per-endpoint limits:
  - Contact form: 3 requests/60s per IP
  - GitHub endpoints: 10 requests/60s per IP
  - CSP reports: 30 requests/60s per IP
- ✅ Graceful fallback to in-memory limiting

### Data Protection

- ✅ PII anonymization (email domains only in logs)
- ✅ Message content never logged
- ✅ HTTPS enforcement with HSTS headers
- ✅ Secure environment variable handling

### Input Validation

- ✅ All API endpoints validate inputs
- ✅ XSS protection via React's built-in escaping
- ✅ CSRF protection for state-changing operations
- ✅ Anti-spam measures (honeypot fields)

### Infrastructure Security

- ✅ Security headers (A+ rating)
- ✅ No hardcoded secrets or API keys
- ✅ Dependency scanning (npm audit + Dependabot)
- ✅ Code security scanning (GitHub CodeQL)
- ✅ Automated security updates via Dependabot

### Monitoring & Error Tracking

- ✅ Sentry integration for error monitoring
- ✅ Vercel analytics for performance tracking
- ✅ CSP violation monitoring
- ✅ Rate limit violation logging

## 📋 Vulnerability Severity Levels

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **Critical** | Remote code execution, authentication bypass, data breach | 24 hours | SQL injection, auth bypass |
| **High** | Privilege escalation, XSS, sensitive data exposure | 3-5 days | Stored XSS, broken access control |
| **Medium** | CSRF, information disclosure, security misconfiguration | 7-14 days | CSRF on non-critical endpoints |
| **Low** | Minor security issues with limited impact | 30 days | Verbose error messages |

## 🔍 Security Testing

### Automated Scanning

We continuously monitor security through:

- **Dependency Scanning:** Dependabot (daily) + npm audit
- **Code Security:** GitHub CodeQL (on push, PR, and daily schedule)
- **Secret Scanning:** GitHub Secret Scanning
- **Security Headers:** Automated header validation

### Manual Review

- Regular security audits of authentication flows
- CSP policy review and testing
- Rate limiting effectiveness testing
- Input validation boundary testing

## 📚 Security Documentation

Detailed security documentation is available in `/docs/security/`:

- [Quick Reference](./docs/security/QUICK_REFERENCE.md) - Overview of security controls
- [CSP Documentation](./docs/security/csp/) - Content Security Policy details
- [Rate Limiting](./docs/security/rate-limiting/) - Rate limiting implementation
- [API Security](./docs/security/api-security-audit.md) - API endpoint security
- [Anti-Spam](./docs/security/anti-spam-implementation.md) - Spam prevention measures

## ✅ Security Checklist

Before deploying, we verify:

- [ ] All dependencies are up-to-date and vulnerability-free
- [ ] Security headers are properly configured
- [ ] Rate limiting is active on all public APIs
- [ ] CSP is enforced without violations
- [ ] No secrets or API keys in code
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS is enforced with HSTS
- [ ] Monitoring and alerting are active

## 🏆 Security Status

Current security rating: **A+** (Excellent)

- ✅ **0 vulnerabilities** in dependencies (as of 2025-12-02)
- ✅ **0 code security issues** detected
- ✅ **100% security header coverage**
- ✅ **Production-ready** security posture

**Latest Security Updates:**

- **2025-12-02:** Operational audit complete, all dependencies updated
- **2025-11-26:** Dependencies updated (Next.js 16.0.4, Vitest 4.0.14, Playwright 1.57.0)
- **2025-11-17:** Initial security documentation complete

Last updated: 2025-12-02

## 📝 Responsible Disclosure

We believe in responsible disclosure and will:

1. **Acknowledge** your report within 48 hours
2. **Investigate** and validate the vulnerability
3. **Fix** the issue based on severity timeline
4. **Notify** you when the fix is deployed
5. **Credit** you in our security acknowledgments (if desired)

### Security Acknowledgments

We thank the following security researchers for their responsible disclosure:

*No vulnerabilities have been reported to date.*

## 📞 Contact

- **Security Issues:** Use GitHub Security Advisories or contact form
- **General Questions:** [www.dcyfr.ai/contact](https://www.dcyfr.ai/contact)
- **Repository:** [github.com/dcyfr/dcyfr-labs](https://github.com/dcyfr/dcyfr-labs)

---

**Note:** This security policy applies to the dcyfr-labs repository and its deployed instances. For questions about this policy, please reach out via the contact methods listed above.
