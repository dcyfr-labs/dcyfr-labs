import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AnalyticsCharts } from './analytics-charts';

// Minimal post data to render the component
const posts = [
  { id: '1', title: 'Post 1', slug: 'post-1' },
];

describe('AnalyticsCharts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NEXT_PUBLIC_ADMIN_API_KEY', 'test-public-key');
  });

  it('logs the error and shows message when fetch returns non-ok response', async () => {
    const serverError = { message: 'Server error' };

    // Mock fetch to return a non-ok response with a JSON body
    const fetchMock = vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(serverError), statusText: 'Internal Server Error' }));
    (global as any).fetch = fetchMock;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AnalyticsCharts posts={posts as any} dateRange="7" />);

    await waitFor(() => {
      // The component should display the error message in CardDescription
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });

    // Ensure console.error was called with our prefix and the server error message
    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];
    expect(String(callArgs[0])).toContain('Failed to fetch daily analytics');
    expect(String(callArgs[1])).toContain('Server error');

    // Verify we sent Authorization header when API key is configured
    // The component reads NEXT_PUBLIC_ADMIN_API_KEY from process.env at runtime
    // In tests, this will be undefined unless set; set it here to assert header
    vi.stubEnv('NEXT_PUBLIC_ADMIN_API_KEY', 'test-public-key');

    // Re-render to trigger a new fetch with the env var
    render(<AnalyticsCharts posts={posts as any} dateRange="7" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Find the fetch call that requested the daily endpoint and assert the header was present
    const dailyCall = fetchMock.mock.calls.find((call: any[]) => String(call[0]).includes('/api/analytics/daily'));
    expect(dailyCall).toBeDefined();
    const dailyInit = dailyCall![1];
    expect(dailyInit).toBeDefined();
    expect((dailyInit.headers as any).Authorization).toBe('Bearer test-public-key');
  });

  it('displays unauthorized message when API returns 401', async () => {
    const unauthorized = { error: 'Unauthorized', message: 'Valid API key required. Use Authorization header with Bearer token.' };

    const fetchMock = vi.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve(unauthorized), statusText: 'Unauthorized' }));
    (global as any).fetch = fetchMock;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AnalyticsCharts posts={posts as any} dateRange="7" />);

    await waitFor(() => {
      expect(screen.getByText(/Valid API key required/i)).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];
    expect(String(callArgs[0])).toContain('Failed to fetch daily analytics');
    expect(String(callArgs[1])).toContain('Valid API key required');
  });
});

export {};
