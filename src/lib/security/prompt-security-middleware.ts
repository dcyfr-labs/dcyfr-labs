/**
 * Prompt Security Middleware
 *
 * Next.js API route middleware for real-time prompt security scanning.
 * Automatically scans user inputs before processing requests.
 *
 * Features:
 * - Automatic prompt scanning
 * - Risk-based blocking
 * - Threat logging via Inngest
 * - Bypass for trusted sources
 * - Performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPromptScanner, type ScanResult } from './prompt-scanner';
import { inngest } from '@/inngest/client';

// ============================================================================
// Types
// ============================================================================

export interface PromptSecurityConfig {
  enabled?: boolean;
  maxRiskScore?: number; // Maximum acceptable risk score (0-100)
  blockCritical?: boolean; // Automatically block critical threats
  logThreats?: boolean; // Log threats via Inngest
  trustedIPs?: string[]; // Whitelist of trusted IP addresses
  trustedOrigins?: string[]; // Whitelist of trusted origins
  scanFields?: string[]; // Fields to scan (default: all text fields)
  bypassHeader?: string; // Header to bypass scanning (e.g., internal services)
}

export interface PromptSecurityContext {
  scanResult: ScanResult;
  blocked: boolean;
  reason?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<PromptSecurityConfig> = {
  enabled: true,
  maxRiskScore: 70,
  blockCritical: true,
  logThreats: true,
  trustedIPs: [],
  trustedOrigins: [],
  scanFields: [],
  bypassHeader: 'X-Prompt-Security-Bypass',
};

// ============================================================================
// Middleware Function
// ============================================================================

export type NextHandler = (
  request: NextRequest,
  context?: PromptSecurityContext
) => Promise<NextResponse> | NextResponse;

/**
 * Create prompt security middleware
 */
export function withPromptSecurity(
  handler: NextHandler,
  config: PromptSecurityConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip if disabled
    if (!cfg.enabled) {
      return handler(request);
    }

    // Check bypass header (for internal services)
    const bypassToken = request.headers.get(cfg.bypassHeader);
    if (bypassToken && isValidBypassToken(bypassToken)) {
      return handler(request);
    }

    // Check trusted sources
    if (isTrustedSource(request, cfg)) {
      return handler(request);
    }

    try {
      // Extract text content from request
      const textContent = await extractTextContent(request, cfg.scanFields);

      if (!textContent || textContent.length === 0) {
        // No text to scan, proceed
        return handler(request);
      }

      // Scan for threats
      const scanner = getPromptScanner();
      const scanResults = await scanner.scanBatch(textContent, {
        maxRiskScore: cfg.maxRiskScore,
        cacheResults: true,
      });

      // Aggregate results
      const aggregateResult = aggregateScanResults(scanResults);

      // Determine if request should be blocked
      const shouldBlock = determineBlocking(aggregateResult, cfg);

      // Log threats if enabled
      if (cfg.logThreats && aggregateResult.threats.length > 0) {
        await logThreat(request, aggregateResult);
      }

      // Block if necessary
      if (shouldBlock) {
        return createBlockedResponse(aggregateResult);
      }

      // Attach scan context and proceed
      const context: PromptSecurityContext = {
        scanResult: aggregateResult,
        blocked: false,
      };

      return handler(request, context);
    } catch (error) {
      console.error('[PromptSecurity] Middleware error:', error);

      // Fail open (allow request) but log the error
      await logError(request, error);

      return handler(request);
    }
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract text content from request for scanning
 */
async function extractTextContent(request: NextRequest, scanFields: string[]): Promise<string[]> {
  const textContent: string[] = [];

  try {
    // Clone request to avoid consuming the body
    const clonedRequest = request.clone();

    // Check if request has body
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const body = await clonedRequest.json();

        if (scanFields.length > 0) {
          // Scan specific fields
          for (const field of scanFields) {
            const value = getNestedValue(body, field);
            if (typeof value === 'string' && value.trim()) {
              textContent.push(value);
            }
          }
        } else {
          // Scan all string fields
          extractStringsFromObject(body, textContent);
        }
      } else if (contentType.includes('text/')) {
        const text = await clonedRequest.text();
        if (text.trim()) {
          textContent.push(text);
        }
      }
    }

    // Also check query parameters
    const { searchParams } = new URL(request.url);
    searchParams.forEach((value) => {
      if (value.trim()) {
        textContent.push(value);
      }
    });
  } catch (error) {
    console.error('[PromptSecurity] Failed to extract text content:', error);
  }

  return textContent;
}

/**
 * Extract all string values from nested object
 */
function extractStringsFromObject(obj: any, results: string[]): void {
  if (typeof obj === 'string') {
    if (obj.trim()) results.push(obj);
    return;
  }

  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractStringsFromObject(item, results));
  } else {
    Object.values(obj).forEach((value) => extractStringsFromObject(value, results));
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Check if request is from trusted source
 */
function isTrustedSource(request: NextRequest, config: Required<PromptSecurityConfig>): boolean {
  // Check IP address
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (config.trustedIPs.includes(ip)) {
    return true;
  }

  // Check origin
  const origin = request.headers.get('origin') || '';
  if (config.trustedOrigins.some((trusted) => origin.includes(trusted))) {
    return true;
  }

  return false;
}

/**
 * Validate bypass token
 */
function isValidBypassToken(token: string): boolean {
  // In production, validate against stored token
  // For now, check environment variable
  const validToken = process.env.PROMPT_SECURITY_BYPASS_TOKEN;
  return validToken ? token === validToken : false;
}

/**
 * Aggregate multiple scan results into single result
 */
function aggregateScanResults(results: ScanResult[]): ScanResult {
  if (results.length === 0) {
    return {
      safe: true,
      threats: [],
      severity: 'safe',
      riskScore: 0,
      blockedPatterns: [],
      metadata: {
        scannedAt: new Date().toISOString(),
        scanDuration: 0,
        cacheHit: false,
        inputHash: '',
      },
    };
  }

  if (results.length === 1) {
    return results[0];
  }

  // Combine all threats
  const allThreats = results.flatMap((r) => r.threats);

  // Find highest risk score
  const maxRiskScore = Math.max(...results.map((r) => r.riskScore));

  // Determine overall severity
  const hasCritical = results.some((r) => r.severity === 'critical');
  const hasHigh = results.some((r) => r.severity === 'high');
  const hasMedium = results.some((r) => r.severity === 'medium');

  let severity: ScanResult['severity'] = 'safe';
  if (hasCritical) severity = 'critical';
  else if (hasHigh) severity = 'high';
  else if (hasMedium) severity = 'medium';
  else if (allThreats.length > 0) severity = 'low';

  // All must be safe for aggregate to be safe
  const safe = results.every((r) => r.safe);

  // Combine blocked patterns
  const blockedPatterns = [...new Set(results.flatMap((r) => r.blockedPatterns))];

  // Sum scan durations
  const totalDuration = results.reduce((sum, r) => sum + r.metadata.scanDuration, 0);

  return {
    safe,
    threats: allThreats,
    severity,
    riskScore: maxRiskScore,
    blockedPatterns,
    metadata: {
      scannedAt: new Date().toISOString(),
      scanDuration: totalDuration,
      cacheHit: results.some((r) => r.metadata.cacheHit),
      inputHash: 'aggregate',
    },
  };
}

/**
 * Determine if request should be blocked
 */
function determineBlocking(result: ScanResult, config: Required<PromptSecurityConfig>): boolean {
  // Block critical threats if configured
  if (config.blockCritical && result.severity === 'critical') {
    return true;
  }

  // Block if risk score exceeds threshold
  if (result.riskScore > config.maxRiskScore) {
    return true;
  }

  return false;
}

/**
 * Create blocked response
 */
function createBlockedResponse(result: ScanResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Security validation failed',
      message: 'Your request contains potentially harmful content and has been blocked.',
      severity: result.severity,
      riskScore: result.riskScore,
      threats: result.threats.map((t) => ({
        category: t.category,
        severity: t.severity,
      })),
      requestId: crypto.randomUUID(),
    },
    {
      status: 403,
      headers: {
        'X-Security-Block': 'prompt-threat-detected',
        'X-Risk-Score': result.riskScore.toString(),
        'X-Threat-Severity': result.severity,
      },
    }
  );
}

/**
 * Log threat detection via Inngest
 */
async function logThreat(request: NextRequest, result: ScanResult): Promise<void> {
  try {
    await inngest.send({
      name: 'security/prompt.threat-detected',
      data: {
        timestamp: Date.now(),
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        threats: result.threats,
        riskScore: result.riskScore,
        severity: result.severity,
        blocked: result.riskScore > 70 || result.severity === 'critical',
      },
    });
  } catch (error) {
    console.error('[PromptSecurity] Failed to log threat:', error);
  }
}

/**
 * Log middleware error
 */
async function logError(request: NextRequest, error: unknown): Promise<void> {
  try {
    await inngest.send({
      name: 'security/prompt.scan-error',
      data: {
        timestamp: Date.now(),
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  } catch (err) {
    console.error('[PromptSecurity] Failed to log error:', err);
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Standard security configuration (medium protection)
 */
export const standardSecurity: PromptSecurityConfig = {
  enabled: true,
  maxRiskScore: 70,
  blockCritical: true,
  logThreats: true,
};

/**
 * Strict security configuration (high protection)
 */
export const strictSecurity: PromptSecurityConfig = {
  enabled: true,
  maxRiskScore: 50,
  blockCritical: true,
  logThreats: true,
};

/**
 * Permissive security configuration (low protection, monitoring only)
 */
export const permissiveSecurity: PromptSecurityConfig = {
  enabled: true,
  maxRiskScore: 90,
  blockCritical: false,
  logThreats: true,
};
