import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SectionShare } from '@/components/blog/rivet/interactive/section-share';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/blog/test-post',
}));

// Mock site config
vi.mock('@/lib/site-config', () => ({
  SITE_URL: 'https://example.com',
}));

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
});

// Mock navigator.clipboard
const mockWriteText = vi.fn();

describe('SectionShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);

    // Mock navigator.clipboard before each test
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: mockWriteText,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders all three share buttons', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      expect(screen.getByLabelText(/share "test section" on twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/share "test section" on linkedin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/copy link to "test section"/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SectionShare
          sectionId="test-section"
          sectionTitle="Test Section"
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('has proper group role for accessibility', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const group = screen.getByRole('group', { name: /share this section/i });
      expect(group).toBeInTheDocument();
    });
  });

  describe('Twitter Share', () => {
    it('opens Twitter share dialog with correct URL', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const twitterButton = screen.getByLabelText(/share "test section" on twitter/i);
      fireEvent.click(twitterButton);

      expect(mockOpen).toHaveBeenCalledTimes(1);
      const calledUrl = mockOpen.mock.calls[0][0];
      expect(calledUrl).toContain('twitter.com/intent/tweet');
      expect(calledUrl).toContain(
        encodeURIComponent('https://example.com/blog/test-post#test-section')
      );
      expect(calledUrl).toContain(encodeURIComponent('Check out "Test Section"'));
    });

    it('opens Twitter in new window with security options', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const twitterButton = screen.getByLabelText(/share "test section" on twitter/i);
      fireEvent.click(twitterButton);

      expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer');
    });
  });

  describe('LinkedIn Share', () => {
    it('opens LinkedIn share dialog with correct URL', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const linkedInButton = screen.getByLabelText(/share "test section" on linkedin/i);
      fireEvent.click(linkedInButton);

      expect(mockOpen).toHaveBeenCalledTimes(1);
      const calledUrl = mockOpen.mock.calls[0][0];
      expect(calledUrl).toContain('linkedin.com/sharing/share-offsite');
      expect(calledUrl).toContain(
        encodeURIComponent('https://example.com/blog/test-post#test-section')
      );
    });

    it('opens LinkedIn in new window with security options', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const linkedInButton = screen.getByLabelText(/share "test section" on linkedin/i);
      fireEvent.click(linkedInButton);

      expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer');
    });
  });

  describe('Copy Link', () => {
    it('copies section URL to clipboard', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link to "test section"/i);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(1);
        expect(mockWriteText).toHaveBeenCalledWith(
          'https://example.com/blog/test-post#test-section'
        );
      });
    });

    it('shows success message after copying', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link to "test section"/i);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('changes button aria-label when copied', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link to "test section"/i);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/link copied!/i)).toBeInTheDocument();
      });
    });

    it('hides success message after 2 seconds', async () => {
      vi.useFakeTimers();

      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link to "test section"/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(screen.getByText('Copied!')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    it('handles clipboard errors gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));

      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link to "test section"/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(consoleWarn).toHaveBeenCalled();
      // Should not show success message
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });
  });

  describe('URL Generation', () => {
    it('generates correct URL with section hash', async () => {
      render(<SectionShare sectionId="asi01-goal-hijack" sectionTitle="Agent Goal Hijack" />);

      const copyButton = screen.getByLabelText(/copy link/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/blog/test-post#asi01-goal-hijack'
      );
    });

    it('handles special characters in section ID', async () => {
      render(
        <SectionShare sectionId="section-with-special-chars-123" sectionTitle="Special Section" />
      );

      const copyButton = screen.getByLabelText(/copy link/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/blog/test-post#section-with-special-chars-123'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper button types', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('has descriptive aria-labels for all buttons', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      expect(screen.getByLabelText(/share "test section" on twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/share "test section" on linkedin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/copy link to "test section"/i)).toBeInTheDocument();
    });

    it('has live region for copy success message', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      const message = screen.getByRole('status');
      expect(message).toHaveTextContent('Copied!');
      expect(message).toHaveAttribute('aria-live', 'polite');
    });

    it('has focus visible styles on buttons', () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('focus-visible');
      });
    });
  });

  describe('Visual States', () => {
    it('shows checkmark icon when copied', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link/i);

      // Should show link icon initially
      const linkIcon = copyButton.querySelector("svg path[d*='M10 13']");
      expect(linkIcon).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(copyButton);
      });

      // Should show checkmark icon after copy
      const checkIcon = copyButton.querySelector("svg polyline[points*='20 6']");
      expect(checkIcon).toBeInTheDocument();
    });

    it('applies success styling when copied', async () => {
      render(<SectionShare sectionId="test-section" sectionTitle="Test Section" />);

      const copyButton = screen.getByLabelText(/copy link/i);

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(copyButton.className).toContain('text-success');
    });
  });
});
