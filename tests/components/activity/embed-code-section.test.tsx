import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbedCodeSection } from '@/components/activity/EmbedCodeSection';

describe('EmbedCodeSection', () => {
  it('renders a "Show Embed Code" toggle with the generator hidden by default', () => {
    render(<EmbedCodeSection />);

    expect(screen.getByRole('button', { name: /show embed code/i })).toBeInTheDocument();
    expect(screen.queryByText('Embed Activity Feed')).not.toBeInTheDocument();
  });

  it('reveals the embed generator when the toggle is clicked', () => {
    render(<EmbedCodeSection />);

    fireEvent.click(screen.getByRole('button', { name: /show embed code/i }));

    expect(screen.getByText('Embed Activity Feed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide embed code/i })).toBeInTheDocument();
  });

  it('hides the embed generator when toggled off again', () => {
    render(<EmbedCodeSection />);

    fireEvent.click(screen.getByRole('button', { name: /show embed code/i }));
    expect(screen.getByText('Embed Activity Feed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide embed code/i }));
    expect(screen.queryByText('Embed Activity Feed')).not.toBeInTheDocument();
  });

  it('exposes the toggle as a disclosure control via aria-expanded', () => {
    render(<EmbedCodeSection />);

    const toggle = screen.getByRole('button', { name: /show embed code/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /hide embed code/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
