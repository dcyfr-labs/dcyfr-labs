import { render, screen } from '@testing-library/react';
import { ContextClue } from '../context-clue';

describe('ContextClue Component', () => {
  it('renders children content correctly', () => {
    const testContent = 'This provides important background information.';
    
    render(
      <ContextClue>{testContent}</ContextClue>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText('Context:')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ContextClue>Test context content</ContextClue>
    );

    const container = screen.getByRole('complementary');
    expect(container).toHaveAttribute('aria-label', 'Context information');
  });

  it('renders info icon', () => {
    const { container } = render(
      <ContextClue>Test content</ContextClue>
    );

    // Icon should be hidden from screen readers
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'my-custom-class';
    
    render(
      <ContextClue className={customClass}>Test content</ContextClue>
    );

    expect(screen.getByRole('complementary')).toHaveClass(customClass);
  });

  it('handles nested content correctly', () => {
    render(
      <ContextClue>
        This is <strong>important</strong> context with <em>emphasis</em>.
      </ContextClue>
    );

    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('emphasis')).toBeInTheDocument();
  });
});