import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentProfileCard } from '@/components/about/agent-profile-card';
import { AgentProfilesSection } from '@/components/about/agent-profiles-section';
import {
  AGENT_PROFILES,
  AGENT_CATEGORY_LABELS,
  getProfilesByCategory,
  type AgentProfile,
} from '@/lib/agent-profiles';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockProfileWithDocs: AgentProfile = {
  id: 'test-agent',
  name: 'Test Agent',
  role: 'Test Specialist',
  description: 'An agent used for testing purposes.',
  capabilities: ['Unit Testing', 'Integration Testing', 'Mocking'],
  category: 'quality',
  docsUrl: 'https://github.com/dcyfr/test-agent',
};

const mockProfileNoDocs: AgentProfile = {
  id: 'no-docs-agent',
  name: 'No Docs Agent',
  role: 'Documentation-Free Specialist',
  description: 'An agent without documentation links.',
  capabilities: ['Capability A', 'Capability B'],
  category: 'engineering',
};

// ---------------------------------------------------------------------------
// AgentProfileCard unit tests
// ---------------------------------------------------------------------------

describe('AgentProfileCard', () => {
  it('renders the agent name', () => {
    render(<AgentProfileCard profile={mockProfileWithDocs} />);
    expect(screen.getByText('Test Agent')).toBeDefined();
  });

  it('renders the agent role', () => {
    render(<AgentProfileCard profile={mockProfileWithDocs} />);
    expect(screen.getByText('Test Specialist')).toBeDefined();
  });

  it('renders the description', () => {
    render(<AgentProfileCard profile={mockProfileWithDocs} />);
    expect(screen.getByText('An agent used for testing purposes.')).toBeDefined();
  });

  it('renders all capability badges', () => {
    render(<AgentProfileCard profile={mockProfileWithDocs} />);
    expect(screen.getByText('Unit Testing')).toBeDefined();
    expect(screen.getByText('Integration Testing')).toBeDefined();
    expect(screen.getByText('Mocking')).toBeDefined();
  });

  it('renders the docs link when docsUrl is provided', () => {
    render(<AgentProfileCard profile={mockProfileWithDocs} />);
    const link = screen.getByRole('link', { name: /view test agent documentation/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://github.com/dcyfr/test-agent');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not render a docs link when docsUrl is absent', () => {
    render(<AgentProfileCard profile={mockProfileNoDocs} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('applies the correct data-testid attribute', () => {
    const { container } = render(<AgentProfileCard profile={mockProfileWithDocs} />);
    expect(container.querySelector('[data-testid="agent-profile-card-test-agent"]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// AgentProfilesSection integration tests
// ---------------------------------------------------------------------------

describe('AgentProfilesSection', () => {
  it('renders the section heading', () => {
    render(<AgentProfilesSection />);
    expect(screen.getByRole('heading', { name: 'Our AI Agent Team' })).toBeDefined();
  });

  it('renders the section description', () => {
    render(<AgentProfilesSection />);
    expect(screen.getByText(/specialised AI agents/i)).toBeDefined();
  });

  it('renders a heading for each non-empty category', () => {
    render(<AgentProfilesSection />);
    const categories = (['framework', 'engineering', 'quality', 'operations'] as const).filter(
      (cat) => getProfilesByCategory(cat).length > 0
    );
    for (const cat of categories) {
      expect(screen.getByText(AGENT_CATEGORY_LABELS[cat])).toBeDefined();
    }
  });

  it('renders a card for every agent profile', () => {
    render(<AgentProfilesSection />);
    for (const profile of AGENT_PROFILES) {
      expect(screen.getByText(profile.name)).toBeDefined();
    }
  });

  it('sets the correct data-testid on the section wrapper', () => {
    const { container } = render(<AgentProfilesSection />);
    expect(container.querySelector('[data-testid="agent-profiles-section"]')).toBeTruthy();
  });

  it('section is labelled by the heading for accessibility', () => {
    const { container } = render(<AgentProfilesSection />);
    const section = container.querySelector('[aria-labelledby="agent-profiles-heading"]');
    expect(section).toBeTruthy();
    const heading = container.querySelector('#agent-profiles-heading');
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toBe('Our AI Agent Team');
  });
});

// ---------------------------------------------------------------------------
// AGENT_PROFILES data integrity tests
// ---------------------------------------------------------------------------

describe('AGENT_PROFILES data', () => {
  it('contains at least one profile', () => {
    expect(AGENT_PROFILES.length).toBeGreaterThan(0);
  });

  it('all profiles have required fields', () => {
    for (const profile of AGENT_PROFILES) {
      expect(typeof profile.id).toBe('string');
      expect(profile.id.length).toBeGreaterThan(0);
      expect(typeof profile.name).toBe('string');
      expect(profile.name.length).toBeGreaterThan(0);
      expect(typeof profile.role).toBe('string');
      expect(typeof profile.description).toBe('string');
      expect(Array.isArray(profile.capabilities)).toBe(true);
      expect(profile.capabilities.length).toBeGreaterThan(0);
      expect(['framework', 'engineering', 'quality', 'operations']).toContain(profile.category);
    }
  });

  it('all profile ids are unique', () => {
    const ids = AGENT_PROFILES.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('getProfilesByCategory returns only profiles matching the category', () => {
    const engineering = getProfilesByCategory('engineering');
    expect(engineering.every((p) => p.category === 'engineering')).toBe(true);
  });

  it('AGENT_CATEGORY_LABELS covers all four categories', () => {
    const keys = Object.keys(AGENT_CATEGORY_LABELS);
    expect(keys).toContain('framework');
    expect(keys).toContain('engineering');
    expect(keys).toContain('quality');
    expect(keys).toContain('operations');
  });
});
