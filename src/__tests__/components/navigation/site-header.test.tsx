import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Mock next/navigation to return a default pathname for tests
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
import { SiteHeader } from '@/components/navigation/site-header';

describe('SiteHeader', () => {
  it('renders Sponsors link with heart icon on desktop nav', () => {
    const { container } = render(<SiteHeader />);
    const sponsorsLink = screen.getByRole('link', { name: /Sponsors/i });
    expect(sponsorsLink).toBeInTheDocument();
    // Check for SVG icon inside the link (lucide icon renders as svg)
    const svg = sponsorsLink.querySelector('svg') as SVGElement | null;
    expect(svg).toBeInTheDocument();
    // icon should use the semantic color token
    expect(svg?.classList.contains('text-primary')).toBe(true);
  });
});
