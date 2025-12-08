import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroOverlay, BlogPostHeroOverlay, ProjectHeroOverlay } from '@/components/common/hero-overlay';

describe('HeroOverlay Component', () => {
  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<HeroOverlay />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should render with aria-hidden attribute for accessibility', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have pointer-events-none class to not interfere with content', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('pointer-events-none');
    });
  });

  describe('Variants', () => {
    it('should render with blog variant', () => {
      const { container } = render(<HeroOverlay variant="blog" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toBeTruthy();
    });

    it('should render with project variant', () => {
      const { container } = render(<HeroOverlay variant="project" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toBeTruthy();
    });

    it('should render with default variant', () => {
      const { container } = render(<HeroOverlay variant="default" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toBeTruthy();
    });
  });

  describe('Directions', () => {
    it('should render with top direction', () => {
      const { container } = render(<HeroOverlay direction="top" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('top-0');
      expect(overlay.className).toContain('inset-x-0');
    });

    it('should render with bottom direction', () => {
      const { container } = render(<HeroOverlay direction="bottom" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('bottom-0');
      expect(overlay.className).toContain('inset-x-0');
    });

    it('should render with full direction', () => {
      const { container } = render(<HeroOverlay direction="full" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('inset-0');
    });
  });

  describe('Intensity Levels', () => {
    it('should render with light intensity', () => {
      const { container } = render(<HeroOverlay intensity="light" direction="top" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('h-24');
    });

    it('should render with medium intensity (default)', () => {
      const { container } = render(<HeroOverlay intensity="medium" direction="top" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('h-32');
    });

    it('should render with strong intensity', () => {
      const { container } = render(<HeroOverlay intensity="strong" direction="top" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('h-40');
    });

    it('should vary intensity height based on direction', () => {
      const topLight = render(<HeroOverlay intensity="light" direction="top" />).container.firstChild as HTMLElement;
      const topMedium = render(<HeroOverlay intensity="medium" direction="top" />).container.firstChild as HTMLElement;
      const topStrong = render(<HeroOverlay intensity="strong" direction="top" />).container.firstChild as HTMLElement;

      expect(topLight.className).toContain('h-24');
      expect(topMedium.className).toContain('h-32');
      expect(topStrong.className).toContain('h-40');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<HeroOverlay className="custom-class" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('custom-class');
    });

    it('should accept custom zIndex', () => {
      const { container } = render(<HeroOverlay zIndex={20} />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.style.zIndex).toBe('20');
    });

    it('should default to zIndex 10', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.style.zIndex).toBe('10');
    });
  });

  describe('Composite Components', () => {
    it('BlogPostHeroOverlay should render two overlays (top and bottom)', () => {
      const { container } = render(<BlogPostHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      expect(overlays.length).toBe(2);
    });

    it('BlogPostHeroOverlay should apply blog variant to both overlays', () => {
      const { container } = render(<BlogPostHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      // Both should have blog-specific classes
      expect(overlays[0].className).toBeTruthy();
      expect(overlays[1].className).toBeTruthy();
    });

    it('ProjectHeroOverlay should render two overlays (top and bottom)', () => {
      const { container } = render(<ProjectHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      expect(overlays.length).toBe(2);
    });

    it('ProjectHeroOverlay should apply project variant to both overlays', () => {
      const { container } = render(<ProjectHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      // Both should have project-specific classes
      expect(overlays[0].className).toBeTruthy();
      expect(overlays[1].className).toBeTruthy();
    });

    it('BlogPostHeroOverlay should accept custom intensity', () => {
      const { container } = render(<BlogPostHeroOverlay intensity="strong" />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      // First overlay (top) should be strong intensity
      expect(overlays[0].className).toContain('h-40');
    });

    it('ProjectHeroOverlay should accept custom intensity', () => {
      const { container } = render(<ProjectHeroOverlay intensity="light" />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      // First overlay (top) should be light intensity
      expect(overlays[0].className).toContain('h-24');
    });

    it('BlogPostHeroOverlay should have different intensities for top and bottom', () => {
      const { container } = render(<BlogPostHeroOverlay intensity="strong" />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      // Top should be strong (h-40)
      expect(overlays[0].className).toContain('h-40');
      // Bottom should be light (h-20)
      expect(overlays[1].className).toContain('h-20');
    });
  });

  describe('Default Props', () => {
    it('should use default variant when none provided', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toBeTruthy();
    });

    it('should use default direction when none provided', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('top-0');
    });

    it('should use default intensity when none provided', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('h-32');
    });
  });

  describe('CSS Classes', () => {
    it('should include absolute positioning', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('absolute');
    });

    it('should include full-width positioning for horizontal overlays', () => {
      const { container: topContainer } = render(<HeroOverlay direction="top" />);
      const topOverlay = topContainer.firstChild as HTMLElement;
      expect(topOverlay.className).toContain('inset-x-0');

      const { container: bottomContainer } = render(<HeroOverlay direction="bottom" />);
      const bottomOverlay = bottomContainer.firstChild as HTMLElement;
      expect(bottomOverlay.className).toContain('inset-x-0');
    });

    it('should include full inset positioning for full overlays', () => {
      const { container } = render(<HeroOverlay direction="full" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('inset-0');
    });
  });

  describe('Accessibility', () => {
    it('should be invisible to screen readers', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not interfere with interactive elements', () => {
      const { container } = render(<HeroOverlay />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('pointer-events-none');
    });

    it('BlogPostHeroOverlay overlays should be hidden from screen readers', () => {
      const { container } = render(<BlogPostHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      overlays.forEach((overlay) => {
        expect(overlay.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('ProjectHeroOverlay overlays should be hidden from screen readers', () => {
      const { container } = render(<ProjectHeroOverlay />);
      const overlays = container.querySelectorAll('[aria-hidden="true"]');
      overlays.forEach((overlay) => {
        expect(overlay.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Variant + Direction Combinations', () => {
    it('should handle blog + top combination', () => {
      const { container } = render(<HeroOverlay variant="blog" direction="top" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('top-0');
      expect(overlay.className).toContain('inset-x-0');
    });

    it('should handle project + bottom combination', () => {
      const { container } = render(<HeroOverlay variant="project" direction="bottom" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('bottom-0');
      expect(overlay.className).toContain('inset-x-0');
    });

    it('should handle default + full combination', () => {
      const { container } = render(<HeroOverlay variant="default" direction="full" />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('inset-0');
    });
  });

  describe('All Combinations (Sanity Check)', () => {
    const variants = ['blog', 'project', 'default'] as const;
    const directions = ['top', 'bottom', 'full'] as const;
    const intensities = ['light', 'medium', 'strong'] as const;

    variants.forEach((variant) => {
      directions.forEach((direction) => {
        intensities.forEach((intensity) => {
          it(`should render ${variant}/${direction}/${intensity} without error`, () => {
            const { container } = render(
              <HeroOverlay
                variant={variant}
                direction={direction}
                intensity={intensity}
              />
            );
            expect(container.firstChild).toBeTruthy();
            const overlay = container.firstChild as HTMLElement;
            expect(overlay.className).toBeTruthy();
            expect(overlay.getAttribute('aria-hidden')).toBe('true');
          });
        });
      });
    });
  });
});
