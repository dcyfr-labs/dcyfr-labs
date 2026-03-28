import { NextRequest, NextResponse } from 'next/server';
import { withPromptSecurity } from '@/lib/security/prompt-security-middleware';
import { getPromptScanner } from '@/lib/security/prompt-scanner';

/**
 * POST /api/security-scans
 *
 * Accepts a prompt for security scanning.
 * Validates → Scans synchronously (Next.js edge/serverless budget) → Returns result.
 *
 * For async queue-based scanning, integrate with the dcyfr-ai-api backend.
 */
async function handlePost(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || !('prompt' in body)) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const prompt = (body as Record<string, unknown>).prompt;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'prompt must be a non-empty string' }, { status: 400 });
  }

  if (prompt.length > 10_000) {
    return NextResponse.json(
      { error: 'prompt must be 10,000 characters or fewer' },
      { status: 400 }
    );
  }

  const scanner = getPromptScanner();
  const result = await scanner.scanPrompt(prompt);

  return NextResponse.json(
    {
      data: {
        safe: result.safe,
        riskScore: result.riskScore,
        severity: result.severity,
        findings: result.threats.map((t) => ({
          pattern: t.pattern,
          category: t.category,
          severity: t.severity,
          confidence: t.confidence,
          source: t.source,
          details: t.details,
        })),
        remediationSummary: result.safe
          ? 'No threats detected. Prompt appears safe.'
          : `Severity: ${result.severity.toUpperCase()} — ${result.threats.length} finding(s). Review flagged patterns before processing.`,
        metadata: result.metadata,
      },
    },
    { status: result.safe ? 200 : 422 }
  );
}

export const POST = withPromptSecurity(handlePost, {
  enabled: true,
  maxRiskScore: 90, // permissive on the meta-endpoint itself
  blockCritical: true,
  logThreats: true,
});
