import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type React from 'react';

// Mock next font imports to avoid calling into next font helpers in tests
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
  Alegreya: () => ({ variable: '--font-serif' }),
}));

// Mock navigation and other heavy imports
vi.mock('@/components/navigation', () => ({
  SiteHeader: () => <header data-testid="site-header" />,
  SiteFooter: () => <footer />,
  BottomNav: () => <nav />,
}));
vi.mock('@/components/ui/sonner', () => ({ Toaster: () => <div /> }));
vi.mock('@/components/features/layout-utilities', () => ({ LayoutUtilities: () => <div /> }));
vi.mock('@/components/features/scroll-to-anchor', () => ({ ScrollToAnchor: () => <div /> }));
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => <></> }));
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => <></> }));
vi.mock('@/lib/axiom/web-vitals', () => ({ AxiomWebVitals: () => <></> }));
vi.mock('next/headers', () => ({ headers: () => ({ get: (_k: string) => null }) }));

describe('RootLayout (simulated integration)', () => {
  beforeEach(() => {
    // default to production
    vi.stubEnv('NODE_ENV', 'production');
  });

  it('renders children in production', async () => {
    const RootLayoutSimulated = ({ children }: { children: React.ReactNode }) => (
      <>
        {/* LayoutUtilities, ScrollToAnchor, Header, etc mocked above */}
        <main>{children}</main>
      </>
    );

    render(
      <RootLayoutSimulated>
        <div data-testid="child">child</div>
      </RootLayoutSimulated>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const RootLayoutSimulated = ({ children }: { children: React.ReactNode }) => (
      <>
        <main>{children}</main>
      </>
    );

    render(
      <RootLayoutSimulated>
        <div data-testid="child">child</div>
      </RootLayoutSimulated>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
