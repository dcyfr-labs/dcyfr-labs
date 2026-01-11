# Logging Security Best Practices

**CRITICAL: Never log sensitive information in clear text.**

This guide provides comprehensive patterns for secure logging practices in the dcyfr-labs codebase.

## Table of Contents

1. [Quick Rules](#quick-rules)
2. [What NOT to Log](#what-not-to-log)
3. [What IS Safe to Log](#what-is-safe-to-log)
4. [Two Recommended Approaches](#two-recommended-approaches)
5. [Real-World Examples](#real-world-examples)
6. [CodeQL Security Scanning](#codeql-security-scanning)
7. [Common Violations](#common-violations)

## Quick Rules

### Definitions
- **PI (Proprietary Information)** — Information that confers competitive or business advantage and should be protected; defined per NIST: https://csrc.nist.gov/glossary/term/proprietary_information
- **PI (Proprietary Information)** — Information that confers competitive or business advantage and should be protected; defined per NIST: https://csrc.nist.gov/glossary/term/proprietary_information. See `docs/security/private/pi-policy.md` for handling guidance.
- **PII (Personally Identifiable Information)** — Data that identifies an individual (email, phone, SSN, etc.). Do not log PII in cleartext.

### Never Log

- **API Keys & Tokens**: Auth tokens, JWT, API keys, access keys, secret keys
- **Credentials**: Passwords, passphrases, PIN codes
- **Environment Variables**: Containing secrets (checked at system boundaries)
- **User Personal Data**: Emails, phone numbers, SSNs, personal IDs
- **IP Addresses**: PII under GDPR/CCPA (use for rate limiting only, never log)
- **Private Keys & Certificates**: SSL/TLS certificates, private encryption keys
- **Authentication Responses**: Session tokens, authentication headers, bearer tokens
- **Payment Information**: Credit card numbers, bank account details, payment tokens
- **Database Credentials**: Connection strings with passwords, database URLs with auth

### Safe to Log

- **Non-Sensitive Metadata**: Project IDs, service names, public identifiers
- **Public User Info**: Public profile names (already available publicly)
- **Application State**: Feature flags, configuration state, validation results
- **Error Messages**: Without embedded secrets or personal data
- **Request/Response Metadata**: Request IDs, timestamps, correlation IDs, HTTP status codes
- **Performance Metrics**: Latency, throughput, memory usage
- **Audit Events**: Action taken, timestamp, user role (not user identity), success/failure

## What NOT to Log

### 1. Credentials & Authentication

```javascript
// ❌ WRONG: Logs full credentials
const password = getPassword();
console.log(`User login with password: ${password}`);

// ❌ WRONG: Logs API key
const apiKey = process.env.GOOGLE_INDEXING_API_KEY;
console.log(`Authenticating with key: ${apiKey}`);

// ❌ WRONG: Logs JWT token
const token = generateJWT(user);
console.log(`Generated token: ${token}`);

// ✅ CORRECT: Log only that authentication occurred
console.log("User authentication successful");
console.log(`Auth method: ${authMethod}`);
console.log(`Status: authenticated`);
```

### 2. Environment Variables with Secrets

```javascript
// ❌ WRONG: Logs environment variable containing secrets
const dbUrl = process.env.DATABASE_URL; // postgres://user:password@host/db
console.log(`Connecting to: ${dbUrl}`);

// ❌ WRONG: Logs parsed credentials
const credentials = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
console.log(`Service account: ${credentials.client_email}`);
console.log(`Project ID: ${credentials.project_id}`);

// ✅ CORRECT: Log only that connection was established
console.log("✅ Database connection established");
console.log("✅ Service account configuration loaded");
```

### 3. Personal User Data

```javascript
// ❌ WRONG: Logs user email
const user = getUser(userId);
console.log(`Processing request from: ${user.email}`);

// ❌ WRONG: Logs phone number
console.log(`User contact: ${user.phone}`);

// ❌ WRONG: Logs user ID if it's sensitive
if (process.env.NODE_ENV === 'production') {
  console.log(`User ID: ${sensitiveUserId}`);
}

// ✅ CORRECT: Log only that processing occurred
console.log("User request processed");
console.log(`User role: ${user.role}`); // Only if role is non-sensitive
```

### 3a. IP Addresses (PII under GDPR/CCPA)

**IP addresses are considered PII** and must be handled carefully. See docs/security/private/pi-policy.md for full policy.

```javascript
// ❌ WRONG: Logs full IP address
const clientIp = getClientIp(request);
console.log(`Request from IP: ${clientIp}`);

// ❌ WRONG: Logs IP in error message
console.error(`Rate limit exceeded for ${ip}`);

// ❌ WRONG: Logs IP with user action
console.log(`User at ${ipAddress} submitted form`);

// ✅ CORRECT: Log the action without the IP
console.log("Rate limit applied to request");
console.log("Contact form submission received");

// ✅ CORRECT: If debugging is truly needed, mask the IP
const maskedIp = ip.split('.').map((octet, i) => i < 2 ? octet : 'xxx').join('.');
console.log(`Debug context: ${maskedIp}`); // Output: "192.168.xxx.xxx"

// ✅ CORRECT: Use IP for rate limiting (not logging)
// This is acceptable - IP used for security, not logged
const rateLimitResult = await rateLimit(clientIp, config);
```

**Why IP addresses matter:**

- **GDPR Article 4(1)**: IP addresses are personal data that can identify an individual
- **CCPA**: IP addresses are personal information under California law
- **Legitimate use**: Rate limiting, abuse prevention (ephemeral, not logged)
- **Never log**: Do not persist IPs in logs, databases, or analytics

**Our IP policy**: IPs are used only for rate limiting (60s TTL in Redis), never logged or stored long-term.

### 4. Sensitive Configuration

```javascript
// ❌ WRONG: Logs entire environment
console.log("Environment configuration:");
console.log(process.env); // Contains all secrets!

// ❌ WRONG: Logs connection string with auth
console.log(`MongoDB connection: ${mongoDbUri}`);

// ✅ CORRECT: Log only non-sensitive config
console.log("Environment: production");
console.log("Database: MongoDB");
console.log("Region: us-east-1");
```

## What IS Safe to Log

### 1. Application Events

```javascript
// ✅ GOOD: Application events without sensitive data
console.log("Blog post published");
console.log("Email notification sent");
console.log("Cache cleared");
console.log("Cron job executed: analytics-aggregation");
```

### 2. Request Metadata

```javascript
// ✅ GOOD: Request and response metadata
console.log(`Request ID: ${requestId}`);
console.log(`Correlation ID: ${correlationId}`);
console.log(`HTTP ${statusCode} - ${method} ${path}`);
console.log(`Response time: ${duration}ms`);
console.log(`User agent: ${userAgent}`);
```

### 3. Validation Results

```javascript
// ✅ GOOD: Validation status without exposing data
if (!isValidEmail(email)) {
  console.error("Email validation failed");
}

if (password.length < 8) {
  console.error("Password too short");
}

if (!credentials.hasRequiredFields()) {
  console.error("Credentials missing required fields");
}
```

### 4. Performance Metrics

```javascript
// ✅ GOOD: Performance and resource metrics
console.log(`Query execution: ${queryTime}ms`);
console.log(`Memory usage: ${memoryUsage}MB`);
console.log(`Cache hit rate: ${hitRate}%`);
console.log(`Response size: ${bytes} bytes`);
```

### 5. Business Logic Flow

```javascript
// ✅ GOOD: Application flow and state
console.log("Processing started: batch import");
console.log("Step 1/5 completed: validation");
console.log("Feature flag enabled: new-checkout-flow");
console.log("Retry attempt 3/5");
```

## Two Recommended Approaches

### Approach 1: Remove Sensitive Logging (Preferred)

Use this for test scripts, configuration validation, and development utilities.

**Best when:**
- Logging is only for development/debugging
- The script is not user-facing
- Sensitive data isn't needed for diagnosis

```javascript
// scripts/test-google-indexing.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });

if (!process.env.GOOGLE_INDEXING_API_KEY) {
  console.error("❌ Error: GOOGLE_INDEXING_API_KEY not configured");
  console.error("See setup guide: docs/features/google-indexing-api.md");
  process.exit(1);
}

try {
  const credentials = JSON.parse(process.env.GOOGLE_INDEXING_API_KEY);

  const requiredFields = ['type', 'project_id', 'private_key', 'client_email', 'client_id'];
  const missingFields = requiredFields.filter(field => !credentials[field]);

  if (missingFields.length > 0) {
    console.error("❌ Error: Invalid service account JSON");
    console.error(`   Missing fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  // ✅ CORRECT: Only confirm validation succeeded
  console.log("✅ Service account JSON is valid");

  // ✅ CORRECT: Generic instruction without exposing email
  console.log("  → Add the service account email from GOOGLE_INDEXING_API_KEY");
  console.log("  → Visit: https://search.google.com/search-console");
  console.log("  → Permission: Owner");

} catch (error) {
  console.error("❌ Error: Failed to parse GOOGLE_INDEXING_API_KEY");
  console.error(`   ${error.message}`);
  process.exit(1);
}
```

### Approach 2: Mask Sensitive Data

Use this when you need to verify the data exists without exposing it.

**Best when:**
- Need to confirm data type/format for debugging
- Verification is critical for diagnosis
- Can create generic representations

```javascript
// Example 1: Mask email address
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

console.log(`Service Account: ${maskEmail(credentials.client_email)}`);
// Output: Service Account: co***@example.com

// Example 2: Mask API key (show last 4 chars only)
const maskApiKey = (key) => {
  if (key.length <= 4) return '***';
  return '***' + key.substring(key.length - 4);
};

console.log(`API Key configured: ${maskApiKey(apiKey)}`);
// Output: API Key configured: ***3x9q

// Example 3: Mask database connection string
const maskConnectionString = (connStr) => {
  return connStr.replace(/(:\/\/)([^:]+):([^@]+)@/, '$1***:***@');
};

console.log(`Database: ${maskConnectionString(dbUrl)}`);
// Output: Database: postgres://***:***@localhost/mydb

// Example 4: Show only safe metadata
const credentials = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
console.log(`Service Account Type: ${credentials.type}`);
console.log(`Project ID: ${credentials.project_id}`);
// DON'T log: client_email, private_key, or full credentials
```

## Real-World Examples

### Example 1: Authentication Flow

```javascript
// services/auth.ts

// ❌ WRONG
async function loginUser(username, password) {
  console.log(`Login attempt: ${username}:${password}`); // Logs password!

  const result = await authenticate(username, password);

  if (result.token) {
    console.log(`Generated token: ${result.token}`); // Logs full JWT!
  }

  return result;
}

// ✅ CORRECT
async function loginUser(username, password) {
  console.log(`Authentication attempt for user account`);

  const result = await authenticate(username, password);

  if (result.token) {
    console.log(`Authentication successful`);
    console.log(`Status: active`);
    // Token is managed securely, not logged
  }

  return result;
}
```

### Example 2: API Configuration

```javascript
// services/google-api.ts

// ❌ WRONG
function initializeGoogleAPI() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  console.log(`Google API Key loaded: ${keyJson}`); // Exposes entire key!

  const client = google.auth.fromJSON(JSON.parse(keyJson));
  return client;
}

// ✅ CORRECT (Approach 1: Remove logging)
function initializeGoogleAPI() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!keyJson) {
    console.error("Error: GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    throw new Error("Missing configuration");
  }

  try {
    const credentials = JSON.parse(keyJson);
    const client = google.auth.fromJSON(credentials);
    console.log("✅ Google API initialized");
    return client;
  } catch (error) {
    console.error("Error: Failed to initialize Google API");
    throw error;
  }
}

// ✅ CORRECT (Approach 2: Mask sensitive data)
function initializeGoogleAPI() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  const credentials = JSON.parse(keyJson);
  console.log(`✅ Google API initialized for project: ${credentials.project_id}`);
  // project_id is non-sensitive metadata

  return google.auth.fromJSON(credentials);
}
```

### Example 3: Database Connection

```javascript
// lib/database.ts

// ❌ WRONG
async function connectToDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  console.log(`Connecting to database: ${dbUrl}`); // Exposes password!

  return await mongoose.connect(dbUrl);
}

// ✅ CORRECT
async function connectToDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL not configured");
  }

  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Database connection established");
    return;
  } catch (error) {
    console.error("Error: Failed to connect to database");
    throw error;
  }
}
```

### Example 4: Payment Processing

```javascript
// services/payment.ts

// ❌ WRONG
async function processPayment(cardData, amount) {
  console.log(`Processing payment: ${JSON.stringify(cardData)}`); // Card number exposed!

  const result = await stripe.charges.create({
    amount,
    currency: 'usd',
    source: cardData.token
  });

  console.log(`Payment result:`, result); // May contain sensitive info
  return result;
}

// ✅ CORRECT
async function processPayment(cardData, amount) {
  console.log(`Processing payment of $${amount / 100}`); // Only amount, not card data

  const result = await stripe.charges.create({
    amount,
    currency: 'usd',
    source: cardData.token
  });

  console.log(`Payment processed successfully`);
  console.log(`Transaction ID: ${result.id}`); // Safe, public transaction ID
  console.log(`Status: ${result.status}`);

  return result;
}
```

## CodeQL Security Scanning

GitHub's CodeQL automatically detects clear-text logging of sensitive information.

### How CodeQL Identifies Violations

CodeQL flags logging when:
1. Logs contain environment variables known to contain secrets
2. Logs contain parsed credentials from sensitive env vars
3. Logs contain API keys or tokens
4. Logs contain user passwords or authentication data

### Example CodeQL Finding

```javascript
// This triggers CodeQL alert: "Clear-text logging of sensitive information"
const credentials = JSON.parse(process.env.GOOGLE_INDEXING_API_KEY);
console.log(`Service Account: ${credentials.client_email}`); // Alert on line with email
```

**Why it triggers:** `GOOGLE_INDEXING_API_KEY` is a credential, so any logged data from it is flagged.

### Fixing CodeQL Violations

1. **Remove the log statement** (preferred)
2. **Replace with generic message** that doesn't expose data
3. **Use masking** if you need to verify the data exists

## Common Violations

### Violation 1: Logging Entire Objects

```javascript
// ❌ WRONG: Object might contain sensitive fields
const user = await getUser(userId);
console.log("User data:", user); // If user has password field, it's logged!

// ✅ CORRECT: Log only what's needed
console.log(`User role: ${user.role}`);
console.log(`User verified: ${user.isVerified}`);
```

### Violation 2: Logging Environment Without Filtering

```javascript
// ❌ WRONG: Logs all environment variables
console.log("Environment:", process.env); // Contains all secrets!

// ✅ CORRECT: Log only non-sensitive variables
console.log("Environment: production");
console.log(`Node version: ${process.version}`);
```

### Violation 3: Logging Error Objects Wholesale

```javascript
// ❌ WRONG: Error might contain sensitive data
try {
  await apiCall();
} catch (error) {
  console.error("Error:", error); // Full error with stack and data
}

// ✅ CORRECT: Log only relevant error message
try {
  await apiCall();
} catch (error) {
  console.error(`API call failed: ${error.message}`);
  // Exclude the full error object
}
```

### Violation 4: Logging Query Parameters

```javascript
// ❌ WRONG: URL might contain API keys
const url = new URL(request.url);
console.log(`Request: ${url.toString()}`); // Exposes query params with secrets!

// ✅ CORRECT: Log only safe URL parts
console.log(`Request: ${request.method} ${url.pathname}`);
```

### Violation 5: Logging Response Data

```javascript
// ❌ WRONG: Response might contain tokens
const response = await fetch(apiUrl, { headers });
const data = await response.json();
console.log("API Response:", data); // Might contain tokens!

// ✅ CORRECT: Log only needed status information
console.log(`API Response: ${response.status} ${response.statusText}`);
console.log(`Data received: ${data.length} items`); // Safe metadata only
```

## Testing for Violations

### Local Check

Run the design token validation script which includes logging checks:

```bash
node scripts/validate-design-tokens.mjs
```

### Pre-commit Check

Husky runs linting and checks before commits:

```bash
git add src/services/auth.ts
git commit -m "fix: remove sensitive logging"
# Hooks run automatically
```

### GitHub Actions Check

CodeQL runs automatically on all PRs:

```yaml
# GitHub Actions will report any violations
# Check the "CodeQL" check in PR status
```

## References

**OWASP Guidelines:**
- [Sensitive Data Exposure](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)

**CWE References:**
- [CWE-312: Cleartext Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/312.html)
- [CWE-532: Insertion of Sensitive Information into Log File](https://cwe.mitre.org/data/definitions/532.html)

**Related Documentation:**
- CLAUDE.md - Security Best Practices
- DESIGN_SYSTEM.md - Logging Security

## Quick Reference Card

**When in doubt:**

1. Ask: "Is this data sensitive?"
   - ✅ Safe: Public IDs, status, timestamps, counts
   - ❌ Sensitive: Passwords, tokens, keys, personal data

2. Choose your approach:
   - **Remove**: Best for config/test scripts
   - **Mask**: Best when verification is critical

3. Check your code:
   - Search for `console.log` in sensitive paths
   - Look for `process.env` in log statements
   - Review error logging for exposed data

4. Test locally:
   - Run: `node scripts/validate-design-tokens.mjs`
   - Check: GitHub Actions on your PR

**Still unsure?** Default to: "Don't log it" ✅
