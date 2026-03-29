const RESEND_API_BASE_URL = 'https://api.resend.com' as const;

type ResendContactLookupResponse = {
  unsubscribed?: boolean | null;
  data?: {
    unsubscribed?: boolean | null;
  };
};

export type SyncResendContactOptions = {
  apiKey: string;
  email: string;
  unsubscribed: boolean;
  segmentId?: string;
  firstName?: string;
  lastName?: string;
  preserveExistingSubscriptionState?: boolean;
};

export type SyncResendContactResult = {
  operation: 'created' | 'updated';
  unsubscribed: boolean;
  segmentAssigned: boolean;
};

function createHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function getContactEndpoint(email: string): string {
  return `${RESEND_API_BASE_URL}/contacts/${encodeURIComponent(email)}`;
}

function getSegmentEndpoint(email: string, segmentId: string): string {
  return `${RESEND_API_BASE_URL}/contacts/${encodeURIComponent(email)}/segments/${segmentId}`;
}

function extractExistingUnsubscribed(payload: ResendContactLookupResponse | null): boolean | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  if (typeof payload.unsubscribed === 'boolean') {
    return payload.unsubscribed;
  }

  if (payload.data && typeof payload.data.unsubscribed === 'boolean') {
    return payload.data.unsubscribed;
  }

  return undefined;
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function readTextSafely(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable response body>';
  }
}

async function patchContact(
  apiKey: string,
  email: string,
  unsubscribed: boolean,
  firstName?: string,
  lastName?: string
): Promise<void> {
  const response = await fetch(getContactEndpoint(email), {
    method: 'PATCH',
    headers: createHeaders(apiKey),
    body: JSON.stringify({
      unsubscribed,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    }),
  });

  if (!response.ok) {
    const error = await readTextSafely(response);
    throw new Error(`Failed to update Resend contact (${response.status}): ${error}`);
  }
}

async function createContact(
  apiKey: string,
  email: string,
  unsubscribed: boolean,
  firstName?: string,
  lastName?: string
): Promise<'created' | 'updated'> {
  const response = await fetch(`${RESEND_API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: createHeaders(apiKey),
    body: JSON.stringify({
      email,
      unsubscribed,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    }),
  });

  if (response.ok) {
    return 'created';
  }

  if (response.status === 409) {
    await patchContact(apiKey, email, unsubscribed, firstName, lastName);
    return 'updated';
  }

  const error = await readTextSafely(response);
  throw new Error(`Failed to create Resend contact (${response.status}): ${error}`);
}

async function assignSegment(apiKey: string, email: string, segmentId: string): Promise<boolean> {
  const response = await fetch(getSegmentEndpoint(email, segmentId), {
    method: 'POST',
    headers: createHeaders(apiKey),
  });

  if (response.ok || response.status === 409) {
    return true;
  }

  const error = await readTextSafely(response);
  throw new Error(`Failed to assign Resend contact to segment (${response.status}): ${error}`);
}

export async function syncResendContact(options: SyncResendContactOptions): Promise<SyncResendContactResult> {
  const normalizedEmail = options.email.trim().toLowerCase();
  const segmentId = options.segmentId?.trim();

  const lookupResponse = await fetch(getContactEndpoint(normalizedEmail), {
    method: 'GET',
    headers: createHeaders(options.apiKey),
  });

  let operation: 'created' | 'updated';
  let effectiveUnsubscribed = options.unsubscribed;

  if (lookupResponse.status === 404) {
    operation = await createContact(
      options.apiKey,
      normalizedEmail,
      effectiveUnsubscribed,
      options.firstName,
      options.lastName
    );
  } else if (lookupResponse.ok) {
    const existingPayload = await readJsonSafely<ResendContactLookupResponse>(lookupResponse);
    const existingUnsubscribed = extractExistingUnsubscribed(existingPayload);

    if (options.preserveExistingSubscriptionState && typeof existingUnsubscribed === 'boolean') {
      effectiveUnsubscribed = existingUnsubscribed;
    }

    await patchContact(
      options.apiKey,
      normalizedEmail,
      effectiveUnsubscribed,
      options.firstName,
      options.lastName
    );
    operation = 'updated';
  } else {
    const error = await readTextSafely(lookupResponse);
    throw new Error(`Failed to lookup Resend contact (${lookupResponse.status}): ${error}`);
  }

  const segmentAssigned = segmentId ? await assignSegment(options.apiKey, normalizedEmail, segmentId) : false;

  return {
    operation,
    unsubscribed: effectiveUnsubscribed,
    segmentAssigned,
  };
}
