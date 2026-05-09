import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AnalyticsCharts } from '@/components/analytics/analytics-charts';
import type { DailyData } from '@/types/analytics';

// Minimal post data to render the component
const posts = [
  { id: '1', title: 'Post 1', slug: 'post-1', views: 100, shares: 5, comments: 3 },
  { id: '2', title: 'Post 2', slug: 'post-2', views: 50, shares: 2, comments: 1 },
];

const dailyData: DailyData[] = [
  { date: 'Jan 20', views: 45, shares: 2, comments: 1, engagement: 3 },
  { date: 'Jan 21', views: 60, shares: 3, comments: 2, engagement: 5 },
  { date: 'Jan 22', views: 55, shares: 2, comments: 1, engagement: 3 },
];

describe('AnalyticsCharts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders charts with daily data from props', () => {
    render(<AnalyticsCharts posts={posts as any} dateRange="7" daily={dailyData} />);

    // Should show the Performance Trends title
    expect(screen.getByText('Performance Trends')).toBeInTheDocument();

    // Should show the tab labels
    expect(screen.getByText('Views')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Combined')).toBeInTheDocument();
  });

  it('shows empty state message when no data available', () => {
    const emptyDaily: DailyData[] = [
      { date: 'Jan 20', views: 0, shares: 0, comments: 0, engagement: 0 },
      { date: 'Jan 21', views: 0, shares: 0, comments: 0, engagement: 0 },
    ];

    render(<AnalyticsCharts posts={posts as any} dateRange="7" daily={emptyDaily} />);

    // Should show empty state message
    expect(screen.getByText('No daily tracking data available yet')).toBeInTheDocument();
    expect(screen.getByText(/Daily metrics will appear here/i)).toBeInTheDocument();
  });

  it('returns null when no posts provided', () => {
    const { container } = render(<AnalyticsCharts posts={[]} dateRange="7" daily={dailyData} />);

    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('handles empty daily data array gracefully', () => {
    render(<AnalyticsCharts posts={posts as any} dateRange="7" daily={[]} />);

    // Should show empty state when daily array is empty
    expect(screen.getByText('No daily tracking data available yet')).toBeInTheDocument();
  });
});

export {};
