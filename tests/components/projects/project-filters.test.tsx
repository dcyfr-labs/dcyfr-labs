import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectFilters } from '@/components/projects';
import type { ReadonlyURLSearchParams } from 'next/navigation';

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParamsData: Record<string, string> = {};

const createMockSearchParams = (): ReadonlyURLSearchParams => {
  const params = new URLSearchParams(mockSearchParamsData);
  return params as unknown as ReadonlyURLSearchParams;
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => createMockSearchParams(),
}));

// Mock shared filter components
vi.mock('@/components/common/filters', async () => {
  const actual = await vi.importActual('@/components/common/filters');
  return {
    ...actual,
    FilterSearchInput: ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (v: string) => void;
      placeholder: string;
    }) => (
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ),
    FilterBadges: ({
      items,
      selected,
      onToggle,
      displayMap,
      caseInsensitive,
    }: {
      items: string[];
      selected: string[];
      onToggle: (item: string) => void;
      displayMap?: Record<string, string>;
      caseInsensitive?: boolean;
    }) => {
      const isSelected = (item: string) => {
        if (caseInsensitive) {
          return selected.some((s) => s.toLowerCase() === item.toLowerCase());
        }
        return selected.includes(item);
      };
      const getLabel = (item: string) => displayMap?.[item] ?? item;
      return (
        <div data-testid="filter-badges">
          {items.map((item) => (
            <button
              key={item}
              data-testid={`badge-${item}`}
              data-selected={isSelected(item)}
              onClick={() => onToggle(item)}
            >
              {getLabel(item)}
            </button>
          ))}
        </div>
      );
    },
    FilterClearButton: ({ onClear, visible }: { onClear: () => void; visible: boolean }) =>
      visible ? (
        <button data-testid="clear-all-button" onClick={onClear}>
          Clear all
        </button>
      ) : null,
  };
});

// Helper to expand the collapsible filter section
const expandFilters = () => {
  const filtersButton = screen.getByRole('button', { name: /filters/i });
  fireEvent.click(filtersButton);
};

describe('ProjectFilters Component', () => {
  const defaultProps = {
    selectedTags: [],
    selectedTech: [],
    status: null,
    techList: ['react', 'nextjs', 'typescript'],
    tagList: ['web', 'mobile', 'api'],
    query: '',
    sortBy: 'newest',
    totalResults: 10,
    hasActiveFilters: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsData = {};
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render status filter badges', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      expect(screen.getByTestId('badge-active')).toBeInTheDocument();
      expect(screen.getByTestId('badge-in-progress')).toBeInTheDocument();
      expect(screen.getByTestId('badge-archived')).toBeInTheDocument();
    });

    it('should render sort filter badges', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      expect(screen.getByTestId('badge-newest')).toBeInTheDocument();
      expect(screen.getByTestId('badge-oldest')).toBeInTheDocument();
      expect(screen.getByTestId('badge-alpha')).toBeInTheDocument();
    });

    it('should render technology tags as badges', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      // Tech items are now part of tags
      expect(screen.getByTestId('badge-react')).toBeInTheDocument();
      expect(screen.getByTestId('badge-nextjs')).toBeInTheDocument();
      expect(screen.getByTestId('badge-typescript')).toBeInTheDocument();
    });

    it('should render category/tech badges', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      // ProjectFilters now renders tech badges (not categories)
      expect(screen.getByTestId('badge-react')).toBeInTheDocument();
      expect(screen.getByTestId('badge-nextjs')).toBeInTheDocument();
      expect(screen.getByTestId('badge-typescript')).toBeInTheDocument();
    });

    it('should render tag badges', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      expect(screen.getByTestId('badge-web')).toBeInTheDocument();
      expect(screen.getByTestId('badge-mobile')).toBeInTheDocument();
      expect(screen.getByTestId('badge-api')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search value on input', () => {
      render(<ProjectFilters {...defaultProps} query="test" />);
      const input = screen.getByTestId('search-input') as HTMLInputElement;
      expect(input.value).toBe('test');
    });

    it('should handle search input changes', () => {
      render(<ProjectFilters {...defaultProps} />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'new search' } });
      expect((input as HTMLInputElement).value).toBe('new search');
    });
  });

  describe('Tech Filter', () => {
    it('should show selected tech badges', () => {
      render(<ProjectFilters {...defaultProps} selectedTech={['react']} />);
      expandFilters();
      const reactBadge = screen.getByTestId('badge-react');
      expect(reactBadge).toHaveAttribute('data-selected', 'true');
    });

    it('should toggle tech selection on badge click', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      const reactBadge = screen.getByTestId('badge-react');
      fireEvent.click(reactBadge);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Tag Filter', () => {
    it('should show selected tag badges', () => {
      render(<ProjectFilters {...defaultProps} selectedTags={['web', 'api']} />);
      expandFilters();
      const webBadge = screen.getByTestId('badge-web');
      const apiBadge = screen.getByTestId('badge-api');
      expect(webBadge).toHaveAttribute('data-selected', 'true');
      expect(apiBadge).toHaveAttribute('data-selected', 'true');
    });

    it('should toggle tag selection on badge click', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      const webBadge = screen.getByTestId('badge-web');
      fireEvent.click(webBadge);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Status Filter', () => {
    it('should mark the current status badge as selected', () => {
      render(<ProjectFilters {...defaultProps} status="active" />);
      expandFilters();
      expect(screen.getByTestId('badge-active')).toHaveAttribute('data-selected', 'true');
    });

    it('should handle status change on badge click', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      fireEvent.click(screen.getByTestId('badge-in-progress'));
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Sort Filter', () => {
    it('should mark the current sort badge as selected', () => {
      render(<ProjectFilters {...defaultProps} sortBy="oldest" />);
      expandFilters();
      expect(screen.getByTestId('badge-oldest')).toHaveAttribute('data-selected', 'true');
    });

    it('should handle sort change on badge click', () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      fireEvent.click(screen.getByTestId('badge-alpha'));
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Clear All Functionality', () => {
    it('should show clear button when filters are active', () => {
      render(<ProjectFilters {...defaultProps} selectedTags={['web']} />);
      expect(screen.getByTestId('clear-all-button')).toBeInTheDocument();
    });

    it('should hide clear button when no filters are active', () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.queryByTestId('clear-all-button')).not.toBeInTheDocument();
    });

    it('should call clearAll when clear button is clicked', () => {
      render(<ProjectFilters {...defaultProps} query="test" selectedTags={['web']} />);
      const clearButton = screen.getByTestId('clear-all-button');
      fireEvent.click(clearButton);
      expect(mockPush).toHaveBeenCalledWith('/work');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tag list', () => {
      render(<ProjectFilters {...defaultProps} tagList={[]} />);
      expect(screen.queryByTestId('badge-web')).not.toBeInTheDocument();
    });

    it('should handle empty tech list', () => {
      render(<ProjectFilters {...defaultProps} techList={[]} />);
      expect(screen.queryByTestId('badge-react')).not.toBeInTheDocument();
    });

    it('should handle multiple active filters', () => {
      render(
        <ProjectFilters
          {...defaultProps}
          selectedTags={['web', 'api']}
          selectedTech={['react']}
          query="test"
          hasActiveFilters={true}
        />
      );
      expect(screen.getByTestId('clear-all-button')).toBeInTheDocument();
    });
  });
});
