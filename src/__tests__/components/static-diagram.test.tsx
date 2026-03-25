import { render, screen } from '@testing-library/react';
import { StaticDiagram } from '@/components/StaticDiagram';

describe('StaticDiagram', () => {
  it('renders an iframe with the given src', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    const iframe = screen.getByTitle('Diagram');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', '/diagrams/auth-flow-v1.html');
  });

  it('uses custom title on the iframe', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" title="Auth Flow" />);
    expect(screen.getByTitle('Auth Flow')).toBeInTheDocument();
  });

  it('sets aria-label to alt when provided', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" alt="OAuth 2.0 authentication flow" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('aria-label', 'OAuth 2.0 authentication flow');
  });

  it('falls back aria-label to title when alt is absent', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" title="My Diagram" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('aria-label', 'My Diagram');
  });

  it('renders figcaption when alt is provided', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" alt="The authentication flow" />);
    expect(screen.getByText('The authentication flow')).toBeInTheDocument();
  });

  it('does not render figcaption when alt is absent', () => {
    const { container } = render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('wraps output in a <figure> element', () => {
    const { container } = render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    expect(container.querySelector('figure')).toBeInTheDocument();
  });

  it('applies custom className to figure', () => {
    const { container } = render(
      <StaticDiagram src="/diagrams/auth-flow-v1.html" className="my-custom" />
    );
    expect(container.querySelector('figure')).toHaveClass('my-custom');
  });

  it('uses lazy loading on the iframe', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });

  it('applies sandbox attribute for security', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('sandbox');
  });

  it('defaults width to 100%', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('width', '100%');
  });

  it('accepts custom width and height', () => {
    render(<StaticDiagram src="/diagrams/auth-flow-v1.html" width="800" height="450" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('width', '800');
    expect(iframe).toHaveAttribute('height', '450');
  });
});
