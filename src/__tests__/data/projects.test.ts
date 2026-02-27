import { describe, expect, it } from 'vitest';
import {
  projects,
  visibleProjects,
  featuredProjects,
  activeProjects,
  type Project,
  type ProjectStatus,
  type ProjectLink,
  type ProjectImage,
} from '@/data/projects';

describe('Projects Data', () => {
  describe('Data Structure Validation', () => {
    it('exports projects array', () => {
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('exports frozen projects array', () => {
      expect(Object.isFrozen(projects)).toBe(true);
    });

    it('has at least one project', () => {
      expect(projects.length).toBeGreaterThan(0);
    });

    it('all projects have required fields', () => {
      projects.forEach((project) => {
        expect(project.slug).toBeDefined();
        expect(project.title).toBeDefined();
        expect(project.description).toBeDefined();
        expect(project.status).toBeDefined();
        expect(project.links).toBeDefined();
        expect(Array.isArray(project.links)).toBe(true);
      });
    });

    it('all slugs are unique', () => {
      const slugs = projects.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('all slugs are lowercase with hyphens', () => {
      projects.forEach((project) => {
        expect(project.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  describe('Project Status', () => {
    it('all projects have valid status', () => {
      const validStatuses: ProjectStatus[] = ['active', 'in-progress', 'archived'];

      projects.forEach((project) => {
        expect(validStatuses).toContain(project.status);
      });
    });

    it('has active projects', () => {
      const active = projects.filter((p) => p.status === 'active');
      expect(active.length).toBeGreaterThan(0);
    });
  });

  describe('Project Links', () => {
    it('all project links have label and href', () => {
      projects.forEach((project) => {
        project.links.forEach((link) => {
          expect(link.label).toBeDefined();
          expect(link.href).toBeDefined();
          expect(typeof link.label).toBe('string');
          expect(typeof link.href).toBe('string');
        });
      });
    });

    it('all project link types are valid when specified', () => {
      const validTypes = ['demo', 'github', 'article', 'docs'];

      projects.forEach((project) => {
        project.links.forEach((link) => {
          if (link.type) {
            expect(validTypes).toContain(link.type);
          }
        });
      });
    });

    it('all project link hrefs are valid URLs or paths', () => {
      projects.forEach((project) => {
        project.links.forEach((link) => {
          expect(link.href).toBeTruthy();
          // Should be URL or start with /
          expect(
            link.href.startsWith('http') || link.href.startsWith('/') || link.href.startsWith('#')
          ).toBe(true);
        });
      });
    });
  });

  describe('Project Images', () => {
    it('validates image structure when present', () => {
      const projectsWithImages = projects.filter((p) => p.image);

      projectsWithImages.forEach((project) => {
        expect(project.image?.url).toBeDefined();
        expect(project.image?.alt).toBeDefined();
        expect(typeof project.image?.url).toBe('string');
        expect(typeof project.image?.alt).toBe('string');
      });
    });

    it('image positions are valid when specified', () => {
      const validPositions = ['center', 'top', 'bottom', 'left', 'right'];

      projects.forEach((project) => {
        if (project.image?.position) {
          expect(validPositions).toContain(project.image.position);
        }
      });
    });

    it('image URLs are valid paths', () => {
      const projectsWithImages = projects.filter((p) => p.image);

      projectsWithImages.forEach((project) => {
        expect(project.image?.url).toBeTruthy();
        expect(project.image?.url.startsWith('/') || project.image?.url.startsWith('http')).toBe(
          true
        );
      });
    });
  });

  describe('Project Tech and Tags', () => {
    it('tech is array when present', () => {
      const projectsWithTech = projects.filter((p) => p.tech);

      projectsWithTech.forEach((project) => {
        expect(Array.isArray(project.tech)).toBe(true);
        expect(project.tech!.length).toBeGreaterThan(0);
      });
    });

    it('tags is array when present', () => {
      const projectsWithTags = projects.filter((p) => p.tags);

      projectsWithTags.forEach((project) => {
        expect(Array.isArray(project.tags)).toBe(true);
        expect(project.tags!.length).toBeGreaterThan(0);
      });
    });

    it('tech items are strings', () => {
      const projectsWithTech = projects.filter((p) => p.tech);

      projectsWithTech.forEach((project) => {
        project.tech!.forEach((tech) => {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        });
      });
    });

    it('tag items are strings', () => {
      const projectsWithTags = projects.filter((p) => p.tags);

      projectsWithTags.forEach((project) => {
        project.tags!.forEach((tag) => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Project Highlights', () => {
    it('highlights is array when present', () => {
      const projectsWithHighlights = projects.filter((p) => p.highlights);

      projectsWithHighlights.forEach((project) => {
        expect(Array.isArray(project.highlights)).toBe(true);
        expect(project.highlights!.length).toBeGreaterThan(0);
      });
    });

    it('highlight items are strings', () => {
      const projectsWithHighlights = projects.filter((p) => p.highlights);

      projectsWithHighlights.forEach((project) => {
        project.highlights!.forEach((highlight) => {
          expect(typeof highlight).toBe('string');
          expect(highlight.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Filtered Collections', () => {
    it('exports visibleProjects', () => {
      expect(visibleProjects).toBeDefined();
      expect(Array.isArray(visibleProjects)).toBe(true);
      expect(Object.isFrozen(visibleProjects)).toBe(true);
    });

    it('visibleProjects excludes hidden projects', () => {
      visibleProjects.forEach((project) => {
        expect(project.hidden).not.toBe(true);
      });
    });

    it('exports featuredProjects', () => {
      expect(featuredProjects).toBeDefined();
      expect(Array.isArray(featuredProjects)).toBe(true);
      expect(Object.isFrozen(featuredProjects)).toBe(true);
    });

    it('featuredProjects are visible and featured', () => {
      featuredProjects.forEach((project) => {
        expect(project.featured).toBe(true);
        expect(project.hidden).not.toBe(true);
      });
    });

    it('exports activeProjects', () => {
      expect(activeProjects).toBeDefined();
      expect(Array.isArray(activeProjects)).toBe(true);
      expect(Object.isFrozen(activeProjects)).toBe(true);
    });

    it('activeProjects are visible and active', () => {
      activeProjects.forEach((project) => {
        expect(project.status).toBe('active');
        expect(project.hidden).not.toBe(true);
      });
    });

    it('featuredProjects is subset of visibleProjects', () => {
      featuredProjects.forEach((featured) => {
        expect(visibleProjects).toContainEqual(featured);
      });
    });

    it('activeProjects is subset of visibleProjects', () => {
      activeProjects.forEach((active) => {
        expect(visibleProjects).toContainEqual(active);
      });
    });
  });

  describe('Content Quality', () => {
    it('all titles are meaningful', () => {
      projects.forEach((project) => {
        expect(project.title.length).toBeGreaterThan(3);
      });
    });

    it('all descriptions are meaningful', () => {
      projects.forEach((project) => {
        expect(project.description.length).toBeGreaterThan(10);
      });
    });

    it('links array is always defined', () => {
      visibleProjects.forEach((project) => {
        expect(project.links).toBeDefined();
        expect(Array.isArray(project.links)).toBe(true);
      });
    });

    it('featured projects have at least one link', () => {
      featuredProjects.forEach((project) => {
        expect(project.links.length).toBeGreaterThan(0);
      });
    });

    it('featured projects have optional images', () => {
      featuredProjects.forEach((project) => {
        // Images are optional - if present, they must be valid
        if (project.image) {
          expect(project.image.url).toBeTruthy();
          expect(project.image.alt).toBeTruthy();
        }
        // No image is valid - card will render without background
      });
    });
  });

  describe('Type Safety', () => {
    it('satisfies Project type', () => {
      const project: Project = projects[0];
      expect(project).toBeDefined();
    });

    it('satisfies ProjectLink type', () => {
      const link: ProjectLink = projects[0].links[0];
      expect(link).toBeDefined();
    });

    it('satisfies ProjectStatus type', () => {
      const status: ProjectStatus = projects[0].status;
      expect(['active', 'in-progress', 'archived']).toContain(status);
    });

    it('satisfies ProjectImage type when present', () => {
      const projectWithImage = projects.find((p) => p.image);
      if (projectWithImage?.image) {
        const image: ProjectImage = projectWithImage.image;
        expect(image).toBeDefined();
      }
    });
  });

  describe('Real Content Validation', () => {
    it('has at least 2 projects', () => {
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    it('has "x64" project', () => {
      const x64Project = projects.find((p) => p.slug === 'x64');
      expect(x64Project).toBeDefined();
      expect(x64Project?.status).toBe('active');
    });

    it('has at least one active project', () => {
      expect(activeProjects.length).toBeGreaterThan(0);
    });

    it('hidden projects are excluded from visible', () => {
      const hiddenCount = projects.filter((p) => p.hidden).length;
      const visibleCount = visibleProjects.length;
      expect(projects.length).toBe(hiddenCount + visibleCount);
    });
  });
});
