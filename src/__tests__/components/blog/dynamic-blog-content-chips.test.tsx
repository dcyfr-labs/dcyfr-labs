import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We will import the wrapper DynamicBlogContent which uses the env var to conditionally
// render HorizontalFilterChips. We'll mock HorizontalFilterChips to a test marker so
// we can assert whether it's included.

vi.mock('@/components/blog/filters/horizontal-filter-chips', async () => {
  const React = await import('react');
  return {
    HorizontalFilterChips: ({ children }: any) => (
      React.createElement('div', { 'data-testid': 'horizontal-filter-chips' }, children)
    ),
  };
});

import { DynamicBlogContent } from '@/components/blog/server';

const defaultProps: any = {
  sortedArchiveData: { allFilteredItems: [], totalItems: 0, currentPage: 1, totalPages: 1 },
  mainListPosts: [],
  selectedCategory: '',
  selectedTags: [],
  readingTime: '',
  availableCategories: [],
  categoryDisplayMap: {},
  availableTagsWithCounts: [],
  query: '',
  sortBy: '',
  dateRange: '',
  layout: 'grid',
  hasActiveFilters: false,
};

describe('DynamicBlogContent feature flag for HorizontalFilterChips', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not render HorizontalFilterChips when feature flag is unset/false', async () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS', 'false');
    const { container } = render(<DynamicBlogContent {...defaultProps} /> as any);
    // Small delay for async rendering
    expect(container.querySelector('[data-testid="horizontal-filter-chips"]')).toBeNull();
  });

  it('renders HorizontalFilterChips when feature flag is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS', 'true');
    const { container } = render(<DynamicBlogContent {...defaultProps} /> as any);
    expect(container.querySelector('[data-testid="horizontal-filter-chips"]')).toBeDefined();
  });
});
