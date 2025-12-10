import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Mock next/navigation to return a default pathname for tests
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
import { SiteHeader } from '@/components/navigation/site-header';

describe('SiteHeader', () => {
  it('renders Sponsors link on desktop nav', () => {
    render(<SiteHeader />);
    const sponsorsLink = screen.getByRole('link', { name: /Sponsors/i });
    expect(sponsorsLink).toBeInTheDocument();
    expect(sponsorsLink).toHaveAttribute('href', '/sponsors');
  });
});
