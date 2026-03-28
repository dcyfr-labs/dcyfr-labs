'use client';

/**
 * Prompt Security Scanner page
 *
 * Allows users to submit a prompt for security scanning and view results
 * including risk score, severity, findings, and remediation guidance.
 */

import { useState, useCallback } from 'react';
import { PageLayout, PageHero } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { ScanStatusPoller } from '@/components/security/ScanStatusPoller';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueuedScan {
  id: string;
  queuedAt: string;
}

// ─── Submit form ──────────────────────────────────────────────────────────────

interface ScanFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isSubmitting: boolean;
}

function ScanForm({ onSubmit, isSubmitting }: ScanFormProps) {
  const [prompt, setPrompt] = useState('');
  const maxLength = 10_000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setPrompt('');
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className={SPACING.content}>
          <div>
            <label htmlFor="prompt-input" className="block text-sm font-medium mb-2">
              Prompt to scan
            </label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to scan for injection attempts, XSS, code injection, and other threats..."
              maxLength={maxLength}
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {prompt.length}/{maxLength}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || prompt.trim().length === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Run Security Scan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SecurityScanPage() {
  const [scans, setScans] = useState<QueuedScan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (prompt: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/security-scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const json = (await res.json()) as {
        data?: { id: string; queuedAt: string };
        error?: string;
      };

      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      if (json.data) {
        setScans((prev) => [{ id: json.data!.id, queuedAt: json.data!.queuedAt }, ...prev]);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit scan.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <PageLayout>
      <PageHero
        title="Prompt Security Scanner"
        description="Scan prompts for injection attempts, XSS, code injection, and other adversarial patterns."
      />

      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pb-8 md:pb-12`}
      >
        <div className={SPACING.section}>
          <ScanForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          {scans.map((scan) => (
            <div key={scan.id}>
              <p className="text-xs text-muted-foreground mb-2">
                Scan {scan.id} — submitted {new Date(scan.queuedAt).toLocaleTimeString()}
              </p>
              <ScanStatusPoller scanId={scan.id} />
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
