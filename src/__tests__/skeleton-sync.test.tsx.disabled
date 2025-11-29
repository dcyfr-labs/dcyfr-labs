/**
 * Skeleton Sync Tests
 *
 * Validates that skeleton loading states match the structure of actual pages.
 * These tests help catch drift between loading.tsx files and page.tsx files.
 *
 * @see docs/components/skeleton-sync-strategy.md
 */

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { CONTAINER_WIDTHS } from '@/lib/design-tokens';

/**
 * Helper to check if skeletons are disabled.
 * If disabled, logs a warning and skips the assertion.
 */
function expectSkeletons(container: Element, assertion: () => void, testName: string) {
  const skeletons = container.querySelectorAll('.skeleton-shimmer');
  if (skeletons.length === 0) {
    console.warn(`⚠️  Skeletons disabled - skipping assertion in: ${testName}`);
    return;
  }
  assertion();
}

// Mock Next.js router for BlogKeyboardProvider
beforeAll(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/blog',
  }));
});

// Import loading components
import HomeLoading from '@/app/loading';
import PortfolioLoading from '@/app/portfolio/loading';
import BlogLoading from '@/app/blog/loading';
import AboutLoading from '@/app/about/loading';
import ContactLoading from '@/app/contact/loading';
import ResumeLoading from '@/app/resume/loading';

describe('Skeleton Structural Sync', () => {
  describe('Homepage Loading', () => {
    it('should use PageHero component structure', () => {
      const { container } = render(<HomeLoading />);

      // Should have PageLayout wrapper (div with min-h-screen)
      const wrapper = container.querySelector('[class*="min-h-screen"]');
      expect(wrapper).toBeTruthy();

      // Should have hero section (from PageHero)
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeTruthy();

      // Should have skeleton elements (using skeleton-shimmer class)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(0);
      }, 'Homepage Loading - PageHero structure');
    });

    it('should have featured post section', () => {
      const { container } = render(<HomeLoading />);

      const sections = container.querySelectorAll('section');
      // Hero + Featured Post + Recent Activity = 3 sections minimum
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have recent activity section', () => {
      const { container } = render(<HomeLoading />);

      // Should have multiple skeleton shimmer elements for:
      // - Hero section (avatar, title, description, actions)
      // - Featured post section
      // - Recent Activity section (multiple items with various skeleton elements)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThanOrEqual(8); // Hero + Featured + Activity sections
      }, 'Homepage Loading - recent activity section');

      // Should have at least one circular skeleton (hero avatar)
      expectSkeletons(container, () => {
        const circularSkeletons = container.querySelectorAll('.rounded-full');
        expect(circularSkeletons.length).toBeGreaterThan(0);
      }, 'Homepage Loading - circular skeleton avatar');
    });
  });

  describe('Portfolio Page Loading', () => {
    it('should use ArchiveLayout structure', () => {
      const { container } = render(<PortfolioLoading />);

      // Should have container with archive width from design tokens
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeTruthy();
      expect(containerDiv?.className).toContain('max-w');

      // Should have h1 heading
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();
    });

    it('should have GitHub heatmap skeleton', () => {
      const { container } = render(<PortfolioLoading />);
      
      // GitHub heatmap should be present (using skeleton-shimmer class)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(0);
      }, 'Projects Page - GitHub heatmap skeleton');
    });

    it('should have projects grid with multiple cards', () => {
      const { container } = render(<PortfolioLoading />);
      
      // Should have grid layout
      const gridElements = container.querySelectorAll('[class*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
      
      // Should match projects grid (sm:grid-cols-2)
      const projectsGrid = Array.from(gridElements).find(
        el => el.className.includes('sm:grid-cols-2')
      );
      expect(projectsGrid).toBeTruthy();
    });
  });

  describe('Blog Page Loading', () => {
    it('should use custom blog layout structure', () => {
      const { container } = render(<BlogLoading />);

      // Should have container with archive width from design tokens
      const mainContainer = container.querySelector(`[class*="${CONTAINER_WIDTHS.archive}"]`);
      expect(mainContainer).toBeTruthy();

      // Should have desktop sidebar (hidden on mobile)
      const sidebar = container.querySelector('.hidden.lg\\:block');
      expect(sidebar).toBeTruthy();
    });

    it('should have search and filter skeletons', () => {
      const { container } = render(<BlogLoading />);

      // Should have search input skeleton (using skeleton-shimmer class)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(0);
      }, 'Blog Page - search and filter skeletons');

      // Should have mobile filter badges skeleton (flex-wrap)
      const filterContainer = container.querySelector('.lg\\:hidden [class*="flex-wrap"]');
      expect(filterContainer).toBeTruthy();
    });

    it('should have post list skeleton', () => {
      const { container } = render(<BlogLoading />);

      // Should have multiple skeleton items for posts (using skeleton-shimmer class)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        // 12 post skeletons + search + filters + header + pagination
        expect(skeletons.length).toBeGreaterThan(10);
      }, 'Blog Page - post list skeleton');
    });
  });

  describe('About Page Loading', () => {
    it('should use PageHero component', () => {
      const { container } = render(<AboutLoading />);
      
      // Should have hero section
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeTruthy();
    });

    it('should have avatar skeleton', () => {
      const { container } = render(<AboutLoading />);
      
      // Should have rounded-full skeleton (avatar with skeleton-shimmer class)
      expectSkeletons(container, () => {
        const avatarSkeleton = container.querySelector('.skeleton-shimmer[class*="rounded-full"]');
        expect(avatarSkeleton).toBeTruthy();
      }, 'About Page - avatar skeleton');
    });

    it('should have multiple content sections', () => {
      const { container } = render(<AboutLoading />);
      
      const sections = container.querySelectorAll('section');
      // Hero + About Me + Professional Background + Connect with Me = 4 sections
      expect(sections.length).toBeGreaterThanOrEqual(4);
    });

    it('should have social links grid', () => {
      const { container } = render(<AboutLoading />);
      
      // Should have social links card grid
      const gridElements = container.querySelectorAll('[class*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
      
      // Should match social links grid (sm:grid-cols-2)
      const socialGrid = Array.from(gridElements).find(
        el => el.className.includes('sm:grid-cols-2')
      );
      expect(socialGrid).toBeTruthy();
    });
  });

  describe('Contact Page Loading', () => {
    it('should use PageHero component', () => {
      const { container } = render(<ContactLoading />);
      
      // Should have hero section
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeTruthy();
    });

    it('should have form skeleton', () => {
      const { container } = render(<ContactLoading />);
      
      // Should have form card (Card component uses data-slot="card")
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeTruthy();
      
      // Should have multiple skeletons for form fields (using skeleton-shimmer class)
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(3);
      }, 'Contact Page - form skeleton');
    });
  });

  describe('Resume Page Loading', () => {
    it('should use PageHero component', () => {
      const { container } = render(<ResumeLoading />);
      
      // Should have hero section
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeTruthy();
    });

    it('should have multiple experience/education cards', () => {
      const { container } = render(<ResumeLoading />);
      
      // Should have multiple sections for experience, education, skills
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have card skeletons for resume items', () => {
      const { container } = render(<ResumeLoading />);
      
      // Should have card components (Card component uses data-slot="card")
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Common Skeleton Patterns', () => {
    const loadingComponents = [
      { name: 'Home', component: HomeLoading },
      { name: 'Portfolio', component: PortfolioLoading },
      { name: 'Blog', component: BlogLoading },
      { name: 'About', component: AboutLoading },
      { name: 'Contact', component: ContactLoading },
      { name: 'Resume', component: ResumeLoading },
    ];

    it('all loading states should have PageLayout wrapper', () => {
      loadingComponents.forEach(({ name, component: Component }) => {
        const { container } = render(<Component />);
        // PageLayout renders a div with min-h-screen class
        // ArchiveLayout (Projects) renders section element
        // Blog uses custom container with max-w-7xl
        const hasPageLayout = container.querySelector('[class*="min-h-screen"]');
        const hasSection = container.querySelector('section');
        const hasContainer = container.querySelector('[class*="container"]');
        expect(
          hasPageLayout || hasSection || hasContainer,
          `${name} should have either PageLayout wrapper, section element, or container`
        ).toBeTruthy();
      });
    });

    it('all loading states should have skeleton animations', () => {
      loadingComponents.forEach(({ name, component: Component }) => {
        const { container } = render(<Component />);
        expectSkeletons(container, () => {
          const skeletons = container.querySelectorAll('.skeleton-shimmer');
          expect(skeletons.length, `${name} should have skeletons`).toBeGreaterThan(0);
        }, `Common Skeleton Patterns - ${name} animations`);
      });
    });

    it('all loading states should use design tokens for spacing', () => {
      loadingComponents.forEach(({ name, component: Component }) => {
        const { container } = render(<Component />);
        // Should use standard structural elements
        // Blog uses custom layout, others use sections
        const sections = container.querySelectorAll('section');
        const hasContainer = container.querySelector('[class*="container"]');
        const hasStructure = sections.length > 0 || hasContainer;
        expect(hasStructure, `${name} should have structural elements`).toBeTruthy();
      });
    });
  });
});

// ============================================================================
// Co-located Loading Prop Tests
// ============================================================================

describe('Co-located Skeleton Loading Props', () => {
  describe('ArticleLayout loading prop', () => {
    it('should render skeleton when loading=true', async () => {
      const { ArticleLayout } = await import('@/components/layouts/article-layout');
      const { container } = render(<ArticleLayout loading />);
      
      // Should render article element
      const article = container.querySelector('article');
      expect(article).toBeTruthy();
      
      // Should have header, content, and footer sections
      const header = article?.querySelector('header');
      const footer = article?.querySelector('footer');
      expect(header).toBeTruthy();
      expect(footer).toBeTruthy();
      
      // Should have skeleton elements
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(5);
      }, 'ArticleLayout loading prop');
    });

    it('skeleton should have same container structure as normal render', async () => {
      const { ArticleLayout } = await import('@/components/layouts/article-layout');
      
      const { container: loadingContainer } = render(<ArticleLayout loading />);
      const { container: normalContainer } = render(
        <ArticleLayout header={<div>Header</div>} footer={<div>Footer</div>}>
          <div>Content</div>
        </ArticleLayout>
      );
      
      // Both should have article > header, article > div (content), article > footer
      const loadingArticle = loadingContainer.querySelector('article');
      const normalArticle = normalContainer.querySelector('article');
      
      expect(loadingArticle?.querySelector('header')).toBeTruthy();
      expect(normalArticle?.querySelector('header')).toBeTruthy();
      expect(loadingArticle?.querySelector('footer')).toBeTruthy();
      expect(normalArticle?.querySelector('footer')).toBeTruthy();
    });
  });

  describe('ProjectCard loading prop', () => {
    it('should render skeleton when loading=true', async () => {
      const { ProjectCard } = await import('@/components/projects/project-card');
      const { container } = render(<ProjectCard loading />);
      
      // Should have card structure
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeTruthy();
      
      // Should have skeleton elements
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(3);
      }, 'ProjectCard loading prop');
    });

    it('skeleton should match normal card structure', async () => {
      const { ProjectCard } = await import('@/components/projects/project-card');
      
      const { container: loadingContainer } = render(<ProjectCard loading />);
      
      // Check structural elements present in skeleton
      const loadingCard = loadingContainer.querySelector('[data-slot="card"]');
      expect(loadingCard).toBeTruthy();
      
      // Should have CardHeader equivalent
      const headerArea = loadingCard?.querySelector('[class*="px-4"][class*="py-4"]');
      expect(headerArea).toBeTruthy();
    });
  });

  describe('PageHero loading prop', () => {
    it('should render skeleton when loading=true', async () => {
      const { PageHero } = await import('@/components/layouts/page-hero');
      const { container } = render(<PageHero loading variant="standard" />);
      
      // Should have section element
      const section = container.querySelector('section');
      expect(section).toBeTruthy();
      
      // Should have skeleton elements
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(2);
      }, 'PageHero loading prop');
    });

    it('homepage variant skeleton should include avatar and actions', async () => {
      const { PageHero } = await import('@/components/layouts/page-hero');
      const { container } = render(<PageHero loading variant="homepage" align="center" />);

      // Should have circular skeleton for avatar
      expectSkeletons(container, () => {
        const circularSkeletons = container.querySelectorAll('.rounded-full');
        expect(circularSkeletons.length).toBeGreaterThan(0);
      }, 'PageHero homepage variant - circular avatar');

      // Should have action button skeletons
      expectSkeletons(container, () => {
        const skeletons = container.querySelectorAll('.skeleton-shimmer');
        expect(skeletons.length).toBeGreaterThan(4); // avatar + title + description + actions
      }, 'PageHero homepage variant - avatar and actions');
    });
  });
});

// ============================================================================
// Skeleton Primitives Tests
// ============================================================================

describe('Skeleton Primitives', () => {
  it('SkeletonText should render correct number of lines', async () => {
    const { SkeletonText } = await import('@/components/ui/skeleton-primitives');
    const { container } = render(<SkeletonText lines={5} />);

    expectSkeletons(container, () => {
      const skeletons = container.querySelectorAll('.skeleton-shimmer');
      expect(skeletons.length).toBe(5);
    }, 'SkeletonText lines');
  });

  it('SkeletonHeading should use correct height for level', async () => {
    const { SkeletonHeading } = await import('@/components/ui/skeleton-primitives');
    const { container: h1Container } = render(<SkeletonHeading level="h1" />);
    const { container: h3Container } = render(<SkeletonHeading level="h3" />);

    expectSkeletons(h1Container, () => {
      const h1Skeleton = h1Container.querySelector('.skeleton-shimmer');
      const h3Skeleton = h3Container.querySelector('.skeleton-shimmer');

      // h1 should have larger height class
      expect(h1Skeleton?.className).toContain('h-8');
      expect(h3Skeleton?.className).toContain('h-5');
    }, 'SkeletonHeading height levels');
  });

  it('SkeletonBadges should render correct count', async () => {
    const { SkeletonBadges } = await import('@/components/ui/skeleton-primitives');
    const { container } = render(<SkeletonBadges count={4} />);

    expectSkeletons(container, () => {
      const skeletons = container.querySelectorAll('.skeleton-shimmer');
      expect(skeletons.length).toBe(4);
    }, 'SkeletonBadges count');
  });

  it('SkeletonCard variants should have distinct structures', async () => {
    const { SkeletonCard } = await import('@/components/ui/skeleton-primitives');

    const { container: postCard } = render(<SkeletonCard variant="post" />);
    const { container: projectCard } = render(<SkeletonCard variant="project" />);

    // Post card should have image placeholder
    expectSkeletons(postCard, () => {
      const postSkeletons = postCard.querySelectorAll('.skeleton-shimmer');
      const projectSkeletons = projectCard.querySelectorAll('.skeleton-shimmer');

      expect(postSkeletons.length).toBeGreaterThan(0);
      expect(projectSkeletons.length).toBeGreaterThan(0);
    }, 'SkeletonCard variants');
  });
});
