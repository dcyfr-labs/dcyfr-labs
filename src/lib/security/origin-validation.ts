export interface OriginValidationResult {
  valid: boolean;
  source: 'origin' | 'referer' | 'none';
  value: string | null;
  reason?: string;
}

function normalizeHostname(input: string): string {
  return input.trim().toLowerCase();
}

function isLocalHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function parseHostname(value: string): string | null {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

/**
 * Validates request Origin/Referer against the allowed domain.
 * - Uses Origin first, then Referer fallback
 * - Case-insensitive hostname comparison
 * - Protocol-agnostic hostname check
 * - Port-agnostic for localhost-style hosts
 */
export function validateOrigin(
  request: Request,
  allowedDomain: string
): OriginValidationResult {
  const originHeader = request.headers.get('origin');
  const refererHeader = request.headers.get('referer');

  let source: OriginValidationResult['source'] = 'none';
  if (originHeader) {
    source = 'origin';
  } else if (refererHeader) {
    source = 'referer';
  }

  const value = originHeader ?? refererHeader;
  if (!value) {
    return {
      valid: false,
      source,
      value,
      reason: 'Missing Origin/Referer header',
    };
  }

  const requestHostname = parseHostname(value);
  const allowedHostname = parseHostname(allowedDomain);

  if (!requestHostname || !allowedHostname) {
    return {
      valid: false,
      source,
      value,
      reason: 'Invalid Origin/Referer URL format',
    };
  }

  const requestHost = normalizeHostname(requestHostname);
  const allowedHost = normalizeHostname(allowedHostname);

  if (requestHost === allowedHost) {
    return { valid: true, source, value };
  }

  if (isLocalHost(requestHost) && isLocalHost(allowedHost)) {
    return { valid: true, source, value };
  }

  return {
    valid: false,
    source,
    value,
    reason: `Origin host mismatch: expected ${allowedHost}, got ${requestHost}`,
  };
}
