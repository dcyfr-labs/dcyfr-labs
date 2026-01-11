import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VercelInsights } from '@/components/analytics';

describe('VercelInsights component', () => {
  it('renders top pages, referrers, and devices when data is provided', () => {
    const data = {
      topPages: [
        { path: '/blog/test-1', views: 100, url: '/blog/test-1' },
        { path: '/blog/test-2', views: 50, url: '/blog/test-2' },
      ],
      topReferrers: [
        { referrer: 'google.com', views: 60 },
      ],
      topDevices: [
        { device: 'mobile', views: 80 },
      ],
    };

    render(<VercelInsights vercel={data} lastSynced={new Date().toISOString()} />);

    expect(screen.getByText('Vercel Insights')).toBeDefined();
    // Top pages
    expect(screen.getByText('/blog/test-1')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
    // Top referrers
    expect(screen.getByText('google.com')).toBeDefined();
    expect(screen.getByText('60')).toBeDefined();
    // Top devices
    expect(screen.getByText('mobile')).toBeDefined();
    expect(screen.getByText('80')).toBeDefined();
  });

  it('renders nothing when vercel is not provided', () => {
    const { container } = render(<VercelInsights vercel={null} />);
    expect(container.childElementCount).toBe(0);
  });
});
