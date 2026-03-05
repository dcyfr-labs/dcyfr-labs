export interface PayloadValidationResult {
  valid: boolean;
  size: number | null;
  maxBytes: number;
  reason?: string;
}

/**
 * Validates request payload size using Content-Length header.
 * If header is missing, request is treated as valid and handled downstream.
 */
export function validatePayloadSize(
  request: Request,
  maxBytes: number
): PayloadValidationResult {
  const contentLengthHeader = request.headers.get('content-length');

  if (!contentLengthHeader) {
    return {
      valid: true,
      size: null,
      maxBytes,
      reason: 'Content-Length header missing',
    };
  }

  const parsed = Number.parseInt(contentLengthHeader, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      valid: false,
      size: null,
      maxBytes,
      reason: 'Invalid Content-Length header',
    };
  }

  if (parsed > maxBytes) {
    return {
      valid: false,
      size: parsed,
      maxBytes,
      reason: 'Payload exceeds configured maximum size',
    };
  }

  return {
    valid: true,
    size: parsed,
    maxBytes,
  };
}
