'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { CONTAINER_WIDTHS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

type SeoDashboardClientProps = {
  keyConfigured: boolean;
  appUrlConfigured: boolean;
  keyFilePath: string | null;
};

type SubmitState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  payload?: unknown;
};

const EXTERNAL_LINKS = [
  {
    label: 'IndexNow Documentation',
    href: 'https://www.indexnow.org/documentation',
  },
  {
    label: 'Bing Webmaster Tools',
    href: 'https://www.bing.com/webmasters',
  },
  {
    label: 'Inngest Local Dashboard',
    href: '/api/inngest',
  },
];

export default function SeoDashboardClient({
  keyConfigured,
  appUrlConfigured,
  keyFilePath,
}: SeoDashboardClientProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: '',
  });

  const canSubmit = keyConfigured && appUrlConfigured;

  const parsedUrls = useMemo(
    () =>
      urlInput
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    [urlInput]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parsedUrls.length) {
      setSubmitState({
        status: 'error',
        message: 'Provide at least one URL to submit.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/indexnow/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: parsedUrls }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? String((payload as { error: string }).error)
            : `Submission failed with status ${response.status}`;

        setSubmitState({
          status: 'error',
          message,
          payload,
        });

        return;
      }

      const message =
        typeof payload === 'object' && payload !== null && 'message' in payload
          ? String((payload as { message: string }).message)
          : 'Submission accepted';

      setSubmitState({
        status: 'success',
        message,
        payload,
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={CONTAINER_WIDTHS.dashboard}>
      <section className={SPACING.section}>
        <h1 className={TYPOGRAPHY.h1.standard}>SEO &amp; IndexNow Dashboard</h1>
        <p className={`${TYPOGRAPHY.body} text-muted-foreground max-w-3xl`}>
          Validate IndexNow configuration and manually submit URLs for immediate indexing checks.
        </p>
      </section>

      <section className={`${SPACING.section} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
        <article className="rounded-lg border border-border p-6 space-y-4">
          <h2 className={TYPOGRAPHY.h3.standard}>Configuration Status</h2>
          <div className="space-y-3">
            <p className={TYPOGRAPHY.body}>
              <span className="font-semibold">INDEXNOW_API_KEY:</span>{' '}
              {keyConfigured ? 'Configured' : 'Missing'}
            </p>
            <p className={TYPOGRAPHY.body}>
              <span className="font-semibold">NEXT_PUBLIC_SITE_URL:</span>{' '}
              {appUrlConfigured ? 'Configured' : 'Missing'}
            </p>
            <p className={TYPOGRAPHY.body}>
              <span className="font-semibold">Submission Ready:</span>{' '}
              {canSubmit ? 'Yes' : 'No'}
            </p>
          </div>

          {keyFilePath ? (
            <p className={`${TYPOGRAPHY.body} text-sm`}>
              Key file endpoint:{' '}
              <Link href={keyFilePath} className="underline underline-offset-2" target="_blank">
                {keyFilePath}
              </Link>
            </p>
          ) : null}
        </article>

        <article className="rounded-lg border border-border p-6 space-y-4">
          <h2 className={TYPOGRAPHY.h3.standard}>Resources</h2>
          <ul className="space-y-2">
            {EXTERNAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline underline-offset-2 text-sm"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className={`${SPACING.section} rounded-lg border border-border p-6`}>
        <h2 className={TYPOGRAPHY.h3.standard}>Manual Submission Test</h2>
        <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-2`}>
          Enter one URL per line. URLs must match your configured site domain.
        </p>

        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <textarea
            className="w-full min-h-40 rounded-md border border-border bg-background p-3 text-sm"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="https://www.dcyfr.ai/blog/example-post"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to IndexNow'}
            </button>
            <span className="text-sm text-muted-foreground">URLs detected: {parsedUrls.length}</span>
          </div>
        </form>

        {submitState.status !== 'idle' ? (
          <div className="mt-4 rounded-md border border-border bg-muted/40 p-4 space-y-2">
            <p className={`${TYPOGRAPHY.body} text-sm`}>
              <span className="font-semibold">Status:</span>{' '}
              {submitState.status === 'success' ? 'Success' : 'Error'}
            </p>
            <p className={`${TYPOGRAPHY.body} text-sm`}>{submitState.message}</p>
            {submitState.payload ? (
              <pre className="overflow-x-auto text-xs bg-background rounded-md border border-border p-3">
                {JSON.stringify(submitState.payload, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className={`${SPACING.section} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
        <article className="rounded-lg border border-border p-6">
          <h2 className={TYPOGRAPHY.h3.standard}>Recent Submissions</h2>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-2`}>
            Coming soon: recent submission history and last response status.
          </p>
        </article>

        <article className="rounded-lg border border-border p-6">
          <h2 className={TYPOGRAPHY.h3.standard}>Aggregate Metrics</h2>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-2`}>
            Coming soon: success rate, rate-limit events, and submission volume.
          </p>
        </article>
      </section>
    </div>
  );
}
