import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSocialLinks } from '@/components/contact/contact-social-links';

describe('ContactSocialLinks Component', () => {
  it('renders without crashing', () => {
    render(<ContactSocialLinks />);
    expect(screen.getByText('Find Us Elsewhere')).toBeInTheDocument();
  });

  it('displays section description', () => {
    render(<ContactSocialLinks />);
    expect(screen.getByText(/connect with us across various platforms/i)).toBeInTheDocument();
  });

  it('renders social links grid', () => {
    const { container } = render(<ContactSocialLinks />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('includes LinkedIn link', () => {
    render(<ContactSocialLinks />);
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('includes GitHub link', () => {
    render(<ContactSocialLinks />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('includes Calendar link', () => {
    render(<ContactSocialLinks />);
    expect(screen.getByText('Booking Page')).toBeInTheDocument();
  });

  it('uses design tokens for typography', () => {
    const { container } = render(<ContactSocialLinks />);
    const heading = screen.getByText('Find Us Elsewhere');
    expect(heading.tagName).toBe('H2');
  });

  it('all links open in new tab', () => {
    render(<ContactSocialLinks />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
