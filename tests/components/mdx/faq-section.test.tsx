import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQSection } from '@/components/mdx/faq-section';

describe('FAQSection', () => {
  it('sanitizes answer HTML before rendering', async () => {
    const user = userEvent.setup();

    render(
      <FAQSection
        items={[
          {
            question: 'Is this safe?',
            answer:
              '<p>Safe <strong>content</strong></p><img src="x" onerror="alert(1)" /><script>alert(2)</script>',
          },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /is this safe\?/i }));

    const answerRegion = document.getElementById('faq-answer-0');
    const sanitizedContainer = answerRegion?.querySelector('.prose');

    expect(sanitizedContainer).toBeTruthy();
    expect(sanitizedContainer?.innerHTML).toContain('<strong>content</strong>');
    expect(sanitizedContainer?.innerHTML).not.toContain('<script');
    expect(sanitizedContainer?.innerHTML).not.toContain('onerror=');
  });
});
