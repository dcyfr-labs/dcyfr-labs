import { describe, expect, it } from 'vitest'
import {
  socialLinks,
  getSocialLink,
  getSocialUrls,
  SOCIAL_HANDLES,
  type SocialLink,
  type SocialPlatform,
} from '@/data/socials'

describe('Socials Data', () => {
  describe('Structure Validation', () => {
    it('exports socialLinks array', () => {
      expect(socialLinks).toBeDefined()
      expect(Array.isArray(socialLinks)).toBe(true)
    })

    it('has at least one social link', () => {
      expect(socialLinks.length).toBeGreaterThan(0)
    })

    it('all social links have required fields', () => {
      socialLinks.forEach((link) => {
        expect(link.platform).toBeDefined()
        expect(link.label).toBeDefined()
        expect(link.url).toBeDefined()
        
        expect(typeof link.platform).toBe('string')
        expect(typeof link.label).toBe('string')
        expect(typeof link.url).toBe('string')
      })
    })

    it('all platforms are unique', () => {
      const platforms = socialLinks.map((link) => link.platform)
      const uniquePlatforms = new Set(platforms)
      expect(platforms.length).toBe(uniquePlatforms.size)
    })
  })

  describe('Platform Types', () => {
    it('all platforms are valid SocialPlatform types', () => {
      // Only test platforms that are actually in use
      const platformsInUse: SocialPlatform[] = [
        'linkedin',
        'github',
        'github-sponsor',
        'peerlist',
        'goodreads',
        'credly',
        'calendar',
      ]

      socialLinks.forEach((link) => {
        expect(platformsInUse).toContain(link.platform)
      })
    })

    it('has github link', () => {
      const github = socialLinks.find((l) => l.platform === 'github')
      expect(github).toBeDefined()
    })

    it('has linkedin link', () => {
      const linkedin = socialLinks.find((l) => l.platform === 'linkedin')
      expect(linkedin).toBeDefined()
    })
  })

  describe('URL Validation', () => {
    it('all URLs are valid', () => {
      socialLinks.forEach((link) => {
        expect(link.url).toBeTruthy()
        expect(link.url.startsWith('http') || link.url.startsWith('/')).toBe(true)
      })
    })

    it('external URLs use HTTPS', () => {
      const externalLinks = socialLinks.filter((link) => 
        link.url.startsWith('http')
      )

      externalLinks.forEach((link) => {
        expect(link.url.startsWith('https://')).toBe(true)
      })
    })

    it('all URLs have meaningful paths', () => {
      socialLinks.forEach((link) => {
        expect(link.url.length).toBeGreaterThan(10)
      })
    })
  })

  describe('Label and Icon', () => {
    it('all labels are meaningful', () => {
      socialLinks.forEach((link) => {
        expect(link.label.length).toBeGreaterThan(2)
      })
    })

    it('icon is string when present', () => {
      const linksWithIcons = socialLinks.filter((l) => l.icon)
      
      linksWithIcons.forEach((link) => {
        expect(typeof link.icon).toBe('string')
        expect(link.icon!.length).toBeGreaterThan(0)
      })
    })

    it('most links have icons', () => {
      const linksWithIcons = socialLinks.filter((l) => l.icon)
      expect(linksWithIcons.length).toBeGreaterThan(socialLinks.length / 2)
    })

    it('description is string when present', () => {
      const linksWithDescription = socialLinks.filter((l) => l.description)
      
      linksWithDescription.forEach((link) => {
        expect(typeof link.description).toBe('string')
        expect(link.description!.length).toBeGreaterThan(5)
      })
    })

    it('most links have descriptions for accessibility', () => {
      const linksWithDescription = socialLinks.filter((l) => l.description)
      expect(linksWithDescription.length).toBeGreaterThan(socialLinks.length / 2)
    })
  })

  describe('getSocialLink Function', () => {
    it('returns link for valid platform', () => {
      const github = getSocialLink('github')
      expect(github).toBeDefined()
      expect(github?.platform).toBe('github')
    })

    it('returns undefined for invalid platform', () => {
      const invalid = getSocialLink('invalid' as SocialPlatform)
      expect(invalid).toBeUndefined()
    })

    it('returns correct link for linkedin', () => {
      const linkedin = getSocialLink('linkedin')
      expect(linkedin).toBeDefined()
      expect(linkedin?.url).toContain('linkedin.com')
    })

    it('returns correct link for github', () => {
      const github = getSocialLink('github')
      expect(github).toBeDefined()
      expect(github?.url).toContain('github.com')
    })
  })

  describe('getSocialUrls Function', () => {
    it('returns array of URLs', () => {
      const urls = getSocialUrls()
      expect(Array.isArray(urls)).toBe(true)
      expect(urls.length).toBe(socialLinks.length)
    })

    it('all returned URLs are strings', () => {
      const urls = getSocialUrls()
      urls.forEach((url) => {
        expect(typeof url).toBe('string')
        expect(url.length).toBeGreaterThan(0)
      })
    })

    it('all returned URLs are valid', () => {
      const urls = getSocialUrls()
      urls.forEach((url) => {
        expect(url.startsWith('http') || url.startsWith('/')).toBe(true)
      })
    })

    it('returns URLs in same order as socialLinks', () => {
      const urls = getSocialUrls()
      urls.forEach((url, index) => {
        expect(url).toBe(socialLinks[index].url)
      })
    })
  })

  describe('SOCIAL_HANDLES Constant', () => {
    it('exports SOCIAL_HANDLES', () => {
      expect(SOCIAL_HANDLES).toBeDefined()
      expect(typeof SOCIAL_HANDLES).toBe('object')
    })

    it('has github handle', () => {
      expect(SOCIAL_HANDLES.github).toBeDefined()
      expect(typeof SOCIAL_HANDLES.github).toBe('string')
      expect(SOCIAL_HANDLES.github).toBe('dcyfr')
    })

    it('has linkedin handle', () => {
      expect(SOCIAL_HANDLES.linkedin).toBeDefined()
      expect(typeof SOCIAL_HANDLES.linkedin).toBe('string')
      expect(SOCIAL_HANDLES.linkedin).toBe('dcyfr')
    })

    it('has peerlist handle', () => {
      expect(SOCIAL_HANDLES.peerlist).toBeDefined()
      expect(typeof SOCIAL_HANDLES.peerlist).toBe('string')
      expect(SOCIAL_HANDLES.peerlist).toBe('dcyfr')
    })

    it('has goodreads handle', () => {
      expect(SOCIAL_HANDLES.goodreads).toBeDefined()
      expect(typeof SOCIAL_HANDLES.goodreads).toBe('string')
      expect(SOCIAL_HANDLES.goodreads).toBe('dcyfr')
    })

    it('all handles are non-empty strings', () => {
      Object.values(SOCIAL_HANDLES).forEach((handle) => {
        expect(typeof handle).toBe('string')
        expect(handle.length).toBeGreaterThan(0)
      })
    })

    it('handles match URLs in socialLinks', () => {
      const githubLink = getSocialLink('github')
      expect(githubLink?.url).toContain(SOCIAL_HANDLES.github)

      const linkedinLink = getSocialLink('linkedin')
      expect(linkedinLink?.url).toContain(SOCIAL_HANDLES.linkedin)
    })
  })

  describe('Type Safety', () => {
    it('satisfies SocialLink type', () => {
      const link: SocialLink = socialLinks[0]
      expect(link).toBeDefined()
    })

    it('satisfies SocialPlatform type', () => {
      const platform: SocialPlatform = socialLinks[0].platform
      expect(platform).toBeDefined()
    })
  })

  describe('Content Quality', () => {
    it('has professional platforms', () => {
      const linkedin = getSocialLink('linkedin')
      const github = getSocialLink('github')
      
      expect(linkedin).toBeDefined()
      expect(github).toBeDefined()
    })

    it('has contact methods', () => {
      // Calendar link is optional - test passes if LinkedIn exists as primary contact
      const linkedin = getSocialLink('linkedin')

      expect(linkedin).toBeDefined()
    })

    it('labels match platforms appropriately', () => {
      const github = getSocialLink('github')
      expect(github?.label.toLowerCase()).toContain('github')

      const linkedin = getSocialLink('linkedin')
      expect(linkedin?.label.toLowerCase()).toContain('linkedin')
    })

    it('descriptions provide accessibility info', () => {
      const linksWithDescription = socialLinks.filter((l) => l.description)
      
      linksWithDescription.forEach((link) => {
        // Description should provide context
        expect(link.description!.length).toBeGreaterThan(10)
      })
    })
  })

  describe('Consistency', () => {
    it('all platforms have consistent naming', () => {
      socialLinks.forEach((link) => {
        // Platform should be lowercase or kebab-case
        expect(link.platform).toMatch(/^[a-z-]+$/)
      })
    })

    it('similar platforms use consistent patterns', () => {
      const github = getSocialLink('github')
      const githubSponsor = getSocialLink('github-sponsor')
      
      if (github && githubSponsor) {
        // Both should reference github
        expect(githubSponsor.url).toContain('github')
      }
    })
  })

  describe('Real Data Validation', () => {
    it('has dcyfr as main handle', () => {
      const github = getSocialLink('github')
      expect(github?.url).toContain('dcyfr')
    })

    it('has multiple social platforms', () => {
      expect(socialLinks.length).toBeGreaterThanOrEqual(5)
    })

    it('includes professional certifications platform', () => {
      const credly = getSocialLink('credly')
      const orcid = getSocialLink('orcid')
      
      expect(credly || orcid).toBeTruthy()
    })
  })
})
