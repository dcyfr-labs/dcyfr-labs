import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncResendContact } from '@/lib/resend-contact-sync';

describe('syncResendContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new contact-form contact as unsubscribed by default and assigns the segment', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response) as typeof fetch;

    const result = await syncResendContact({
      apiKey: 're_test_123',
      email: 'Lead@Example.com',
      unsubscribed: true,
      segmentId: 'seg_123',
      firstName: 'Lead Person',
      preserveExistingSubscriptionState: true,
    });

    expect(result).toEqual({
      operation: 'created',
      unsubscribed: true,
      segmentAssigned: true,
    });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'lead@example.com',
        unsubscribed: true,
        first_name: 'Lead Person',
      }),
    });
    expect(globalThis.fetch).toHaveBeenNthCalledWith(3, 'https://api.resend.com/contacts/lead%40example.com/segments/seg_123', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
    });
  });

  it('preserves an existing subscribed contact state for contact-form submissions', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ unsubscribed: false }),
        text: async () => '',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => 'already in segment',
      } as Response) as typeof fetch;

    const result = await syncResendContact({
      apiKey: 're_test_123',
      email: 'lead@example.com',
      unsubscribed: true,
      segmentId: 'seg_123',
      preserveExistingSubscriptionState: true,
    });

    expect(result).toEqual({
      operation: 'updated',
      unsubscribed: false,
      segmentAssigned: true,
    });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'https://api.resend.com/contacts/lead%40example.com', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unsubscribed: false,
      }),
    });
  });

  it('updates an existing contact to subscribed for newsletter signups', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ unsubscribed: true }),
        text: async () => '',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response) as typeof fetch;

    const result = await syncResendContact({
      apiKey: 're_test_123',
      email: 'lead@example.com',
      unsubscribed: false,
      segmentId: 'seg_123',
    });

    expect(result).toEqual({
      operation: 'updated',
      unsubscribed: false,
      segmentAssigned: true,
    });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'https://api.resend.com/contacts/lead%40example.com', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unsubscribed: false,
      }),
    });
  });
});
