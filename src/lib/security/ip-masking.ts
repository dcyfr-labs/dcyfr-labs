/**
 * Mask an IP address for safe telemetry.
 * IPv4: 192.0.2.123 -> 192.0.2.xxx
 * IPv6: 2001:db8::1 -> 2001:db8:...:1
 */
export function maskIp(ip?: string): string {
  if (!ip) return '[redacted]';

  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    if (parts.length <= 2) return '[redacted]';

    const first = parts.slice(0, 2).join(':');
    const last = parts.at(-1) ?? '[redacted]';
    return `${first}:...:${last}`;
  }

  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }

  return '[redacted]';
}

/**
 * Best-effort extraction of Origin or Referer for audit logging.
 */
export function extractOriginLikeValue(request: Request): string | null {
  return request.headers.get('origin') ?? request.headers.get('referer');
}
