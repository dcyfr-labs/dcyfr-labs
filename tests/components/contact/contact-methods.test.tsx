import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactMethods } from '@/components/contact';

describe('ContactMethods Component', () => {
  it('renders without crashing', () => {
    render(<ContactMethods />);
    expect(screen.getByText('Other Ways to Connect')).toBeInTheDocument();
  });

  it('displays email contact method', () => {
    render(<ContactMethods />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Send us a direct email')).toBeInTheDocument();
  });

  it('displays LinkedIn contact method', () => {
    render(<ContactMethods />);
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('displays GitHub contact method', () => {
    render(<ContactMethods />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('displays Calendar contact method', () => {
    render(<ContactMethods />);
    expect(screen.getByText('Booking Page')).toBeInTheDocument();
  });

  it('renders email link with mailto protocol', () => {
    render(<ContactMethods />);
    const emailLink = screen.getByRole('link', { name: /email/i });
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('renders external links with proper attributes', () => {
    render(<ContactMethods />);
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays exactly 4 contact methods', () => {
    render(<ContactMethods />);
    const links = screen.getAllByRole('link');
    // Email, LinkedIn, GitHub, Calendar
    expect(links).toHaveLength(4);
  });

  it('uses design tokens for styling', () => {
    const { container } = render(<ContactMethods />);
    // Check that the component has proper grid structure
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('gap-4');
  });
});
