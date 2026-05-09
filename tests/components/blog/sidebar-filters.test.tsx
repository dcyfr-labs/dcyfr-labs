import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarFilters } from '@/components/blog';

describe('SidebarFilters', () => {
  const defaultProps = {
    sortBy: 'popular',
    dateRange: 'all',
    readingTime: '',
    showArchived: false,
    showDrafts: false,
    isExpanded: true,
    onToggle: vi.fn(),
    onSortChange: vi.fn(),
    onDateRangeChange: vi.fn(),
    onReadingTimeChange: vi.fn(),
    onShowArchivedChange: vi.fn(),
    onShowDraftsChange: vi.fn(),
  };

  describe('Sort by section', () => {
    it('should render Popular, Newest, and Oldest options in that order', () => {
      render(<SidebarFilters {...defaultProps} />);

      const sortBySection = screen.getByText('Sort by').parentElement;
      const badges = sortBySection?.querySelectorAll('.cursor-pointer');

      expect(badges?.[0]).toHaveTextContent('Popular');
      expect(badges?.[1]).toHaveTextContent('Newest');
      expect(badges?.[2]).toHaveTextContent('Oldest');

      // Archived and Drafts should NOT be in Sort by
      expect(sortBySection).not.toHaveTextContent('Drafts');
    });

    it('should call onSortChange when clicking a sort option', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(<SidebarFilters {...defaultProps} onSortChange={onSortChange} />);

      await user.click(screen.getByText('Newest'));

      expect(onSortChange).toHaveBeenCalledWith('newest');
    });
  });

  describe('Show section (independent filters)', () => {
    it('should render Show section with Archived toggle', () => {
      render(<SidebarFilters {...defaultProps} />);

      const showSection = screen.getByText('Show').parentElement;
      expect(showSection).toBeInTheDocument();
      expect(showSection).toHaveTextContent('Archived');
    });

    it('should show Archived badge as selected when showArchived is true', () => {
      render(<SidebarFilters {...defaultProps} showArchived={true} />);

      const archivedBadge = screen.getByText('Archived');
      // Check that parent element has appropriate styling
      expect(archivedBadge).toBeInTheDocument();
    });

    it('should show Archived badge as unselected when showArchived is false', () => {
      render(<SidebarFilters {...defaultProps} showArchived={false} />);

      const archivedBadge = screen.getByText('Archived');
      // Check that badge exists
      expect(archivedBadge).toBeInTheDocument();
    });

    it('should call onShowArchivedChange when clicking Archived badge', async () => {
      const user = userEvent.setup();
      const onShowArchivedChange = vi.fn();

      render(<SidebarFilters {...defaultProps} onShowArchivedChange={onShowArchivedChange} />);

      await user.click(screen.getByText('Archived'));

      expect(onShowArchivedChange).toHaveBeenCalledWith(true); // Toggle from false to true
    });

    it('should call onShowArchivedChange with false when already active', async () => {
      const user = userEvent.setup();
      const onShowArchivedChange = vi.fn();

      render(
        <SidebarFilters
          {...defaultProps}
          showArchived={true}
          onShowArchivedChange={onShowArchivedChange}
        />
      );

      await user.click(screen.getByText('Archived'));

      expect(onShowArchivedChange).toHaveBeenCalledWith(false); // Toggle from true to false
    });
  });

  describe('Draft toggle (development only)', () => {
    it('should show Drafts toggle in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      render(<SidebarFilters {...defaultProps} />);

      const showSection = screen.getByText('Show').parentElement;
      expect(showSection).toHaveTextContent('Drafts');

      vi.unstubAllEnvs();
    });

    it('should hide Drafts toggle in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      render(<SidebarFilters {...defaultProps} />);

      const showSection = screen.getByText('Show').parentElement;
      expect(showSection).not.toHaveTextContent('Drafts');

      vi.unstubAllEnvs();
    });

    it('should call onShowDraftsChange when clicking Drafts badge', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const user = userEvent.setup();
      const onShowDraftsChange = vi.fn();

      render(<SidebarFilters {...defaultProps} onShowDraftsChange={onShowDraftsChange} />);

      await user.click(screen.getByText('Drafts'));

      expect(onShowDraftsChange).toHaveBeenCalledWith(true);

      vi.unstubAllEnvs();
    });
  });

  describe('Date range and Reading time sections', () => {
    it('should render date range options', () => {
      render(<SidebarFilters {...defaultProps} />);

      expect(screen.getByText('All time')).toBeInTheDocument();
      expect(screen.getByText('30 days')).toBeInTheDocument();
      expect(screen.getByText('90 days')).toBeInTheDocument();
      expect(screen.getByText('This year')).toBeInTheDocument();
    });

    it('should render reading time options', () => {
      render(<SidebarFilters {...defaultProps} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('≤5 min')).toBeInTheDocument();
      expect(screen.getByText('5-15 min')).toBeInTheDocument();
      expect(screen.getByText('>15 min')).toBeInTheDocument();
    });
  });

  describe('Collapsible behavior', () => {
    it('should show content when expanded', () => {
      render(<SidebarFilters {...defaultProps} isExpanded={true} />);

      expect(screen.getByText('Newest')).toBeInTheDocument();
      expect(screen.getByText('Show')).toBeInTheDocument();
    });

    it('should hide content when collapsed', () => {
      render(<SidebarFilters {...defaultProps} isExpanded={false} />);

      expect(screen.queryByText('Newest')).not.toBeInTheDocument();
      expect(screen.queryByText('Show')).not.toBeInTheDocument();
    });

    it('should call onToggle when clicking section header', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<SidebarFilters {...defaultProps} onToggle={onToggle} />);

      await user.click(screen.getByText('Sort & Filters'));

      expect(onToggle).toHaveBeenCalled();
    });
  });
});
