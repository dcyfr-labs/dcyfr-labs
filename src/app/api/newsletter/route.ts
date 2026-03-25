import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/api/api-guardrails';
import { inngest } from '@/inngest/client';

const RESEND_API_BASE_URL = 'https://api.resend.com';

const RATE_LIMIT_CONFIG = {
  limit: RATE_LIMITS.newsletter.requestsPerMinute,
  windowInSeconds: 60,
  failClosed: true,
};

function validateEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const tld = parts[1].split('.').pop();
  if (!tld || tld.length < 2) return false;
  if (email.length > 254) return false;

  return true;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('email' in body)) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const email = (body as Record<string, unknown>).email;
  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const trimmedEmail = email.trim().slice(0, 254);
  if (!validateEmail(trimmedEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('[Newsletter API] Missing RESEND_API_KEY, cannot register contact');
    return NextResponse.json(
      { error: 'Newsletter service is not configured. Please try again later.' },
      { status: 503 }
    );
  }

  const resendSegmentId = process.env.RESEND_SEGMENT_ID?.trim();
  const contactsEndpoint = `${RESEND_API_BASE_URL}/contacts`;

  const contactsPayload = {
    email: normalizedEmail,
    unsubscribed: false,
    ...(resendSegmentId ? { segments: [{ id: resendSegmentId }] } : {}),
  };

  try {
    const contactsResponse = await fetch(contactsEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactsPayload),
    });

    if (!contactsResponse.ok && contactsResponse.status !== 409) {
      const resendError = await contactsResponse.text();
      console.error('[Newsletter API] Failed to create Resend contact:', {
        status: contactsResponse.status,
        hasSegmentId: !!resendSegmentId,
        error: resendError,
      });

      return NextResponse.json(
        { error: 'Failed to register your subscription. Please try again later.' },
        { status: 502, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }
  } catch (contactsError) {
    console.error('[Newsletter API] Contacts API request failed:', {
      error: contactsError instanceof Error ? contactsError.message : String(contactsError),
      hasSegmentId: !!resendSegmentId,
    });

    return NextResponse.json(
      { error: 'Failed to register your subscription. Please try again later.' },
      { status: 502, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    await inngest.send({
      name: 'newsletter/subscribe.submitted',
      data: {
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        ip: clientIp,
      },
    });

    console.warn('[Newsletter API] Subscription queued:', {
      emailDomain: normalizedEmail.split('@')[1] || 'unknown',
      timestamp: new Date().toISOString(),
      hasSegmentId: !!resendSegmentId,
    });

    return NextResponse.json(
      { success: true, message: 'Thanks for subscribing! Check your email to confirm.' },
      { status: 200, headers: createRateLimitHeaders(rateLimitResult) }
    );
  } catch (inngestError) {
    console.error(
      '[Newsletter API] Failed to queue subscription:',
      inngestError instanceof Error ? inngestError.message : String(inngestError)
    );
    return NextResponse.json(
      { error: 'Failed to process your subscription. Please try again later.' },
      { status: 500 }
    );
  }
}
