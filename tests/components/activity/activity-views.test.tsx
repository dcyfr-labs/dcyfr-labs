import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityViews } from '@/app/activity/activity-views';

describe('ActivityViews', () => {
  it('renders Timeline and Heatmap tabs', () => {
    render(<ActivityViews activities={[]} />);

    expect(screen.getByRole('tab', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Heatmap' })).toBeInTheDocument();
  });

  it('defaults to the Timeline tab with the heatmap not shown', () => {
    render(<ActivityViews activities={[]} />);

    expect(screen.getByRole('tab', { name: 'Timeline' })).toHaveAttribute('data-state', 'active');
    expect(screen.queryByText('Activity Heatmap')).not.toBeInTheDocument();
  });

  it('reveals the heatmap when the Heatmap tab is selected', async () => {
    const user = userEvent.setup();
    render(<ActivityViews activities={[]} />);

    await user.click(screen.getByRole('tab', { name: 'Heatmap' }));

    expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
  });
});
