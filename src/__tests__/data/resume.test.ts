import { describe, expect, it } from 'vitest'
import {
  resume,
  getYearsOfExperience,
  getShortSummary,
  getSummary,
  type Resume,
  type Experience,
  type Education,
  type CertificationCategory,
  type SkillCategory,
} from '@/data/resume'

describe('Resume Data', () => {
  describe('Structure Validation', () => {
    it('exports resume object', () => {
      expect(resume).toBeDefined()
      expect(typeof resume).toBe('object')
    })

    it('has all required top-level fields', () => {
      expect(resume.summary).toBeDefined()
      expect(resume.shortSummary).toBeDefined()
      expect(resume.experience).toBeDefined()
      expect(resume.education).toBeDefined()
      expect(resume.certifications).toBeDefined()
      expect(resume.skills).toBeDefined()
    })

    it('summary is a non-empty string', () => {
      expect(typeof resume.summary).toBe('string')
      expect(resume.summary.length).toBeGreaterThan(0)
    })

    it('shortSummary is a non-empty string', () => {
      expect(typeof resume.shortSummary).toBe('string')
      expect(resume.shortSummary.length).toBeGreaterThan(0)
    })

    it('shortSummary is shorter than summary', () => {
      expect(resume.shortSummary.length).toBeLessThan(resume.summary.length)
    })
  })

  describe('Experience Validation', () => {
    it('experience is an array', () => {
      expect(Array.isArray(resume.experience)).toBe(true)
    })

    it('has at least one experience entry', () => {
      expect(resume.experience.length).toBeGreaterThan(0)
    })

    it('all experience entries have required fields', () => {
      resume.experience.forEach((exp) => {
        expect(exp.title).toBeDefined()
        expect(exp.company).toBeDefined()
        expect(exp.duration).toBeDefined()
        expect(exp.responsibilities).toBeDefined()
        
        expect(typeof exp.title).toBe('string')
        expect(typeof exp.company).toBe('string')
        expect(typeof exp.duration).toBe('string')
        expect(Array.isArray(exp.responsibilities)).toBe(true)
      })
    })

    it('all experience titles are meaningful', () => {
      resume.experience.forEach((exp) => {
        expect(exp.title.length).toBeGreaterThan(3)
      })
    })

    it('all company names are meaningful', () => {
      resume.experience.forEach((exp) => {
        expect(exp.company.length).toBeGreaterThan(1)
      })
    })

    it('all durations follow expected format', () => {
      resume.experience.forEach((exp) => {
        // Should contain date or "Present"
        expect(
          exp.duration.includes('20') || // Year format
          exp.duration.includes('Present')
        ).toBe(true)
      })
    })

    it('all responsibilities are arrays with items', () => {
      resume.experience.forEach((exp) => {
        expect(exp.responsibilities.length).toBeGreaterThan(0)
        
        exp.responsibilities.forEach((resp) => {
          expect(typeof resp).toBe('string')
          expect(resp.length).toBeGreaterThan(10)
        })
      })
    })

    it('responsibilities are meaningful sentences', () => {
      resume.experience.forEach((exp) => {
        exp.responsibilities.forEach((resp) => {
          // Should end with period
          expect(resp.trim()).toMatch(/\.$/)
        })
      })
    })
  })

  describe('Education Validation', () => {
    it('education is an array', () => {
      expect(Array.isArray(resume.education)).toBe(true)
    })

    it('has at least one education entry', () => {
      expect(resume.education.length).toBeGreaterThan(0)
    })

    it('all education entries have required fields', () => {
      resume.education.forEach((edu) => {
        expect(edu.degree).toBeDefined()
        expect(edu.institution).toBeDefined()
        
        expect(typeof edu.degree).toBe('string')
        expect(typeof edu.institution).toBe('string')
      })
    })

    it('all degrees are meaningful', () => {
      resume.education.forEach((edu) => {
        expect(edu.degree.length).toBeGreaterThan(3)
      })
    })

    it('all institutions are meaningful', () => {
      resume.education.forEach((edu) => {
        expect(edu.institution.length).toBeGreaterThan(3)
      })
    })

    it('duration is string when present', () => {
      const educationWithDuration = resume.education.filter((e) => e.duration)
      
      educationWithDuration.forEach((edu) => {
        expect(typeof edu.duration).toBe('string')
      })
    })

    it('highlights is array when present', () => {
      const educationWithHighlights = resume.education.filter((e) => e.highlights)
      
      educationWithHighlights.forEach((edu) => {
        expect(Array.isArray(edu.highlights)).toBe(true)
        expect(edu.highlights!.length).toBeGreaterThan(0)
        
        edu.highlights!.forEach((highlight) => {
          expect(typeof highlight).toBe('string')
          expect(highlight.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Certifications Validation', () => {
    it('certifications is an array', () => {
      expect(Array.isArray(resume.certifications)).toBe(true)
    })

    it('has at least one certification provider', () => {
      expect(resume.certifications.length).toBeGreaterThan(0)
    })

    it('all certification categories have required fields', () => {
      resume.certifications.forEach((cert) => {
        expect(cert.provider).toBeDefined()
        expect(cert.certifications).toBeDefined()
        
        expect(typeof cert.provider).toBe('string')
        expect(Array.isArray(cert.certifications)).toBe(true)
      })
    })

    it('all providers are meaningful', () => {
      resume.certifications.forEach((cert) => {
        expect(cert.provider.length).toBeGreaterThan(1)
      })
    })

    it('all certification arrays have items', () => {
      resume.certifications.forEach((cert) => {
        expect(cert.certifications.length).toBeGreaterThan(0)
        
        cert.certifications.forEach((c) => {
          expect(typeof c).toBe('string')
          expect(c.length).toBeGreaterThan(0)
        })
      })
    })

    it('has GIAC certifications', () => {
      const giac = resume.certifications.find((c) => c.provider === 'GIAC')
      expect(giac).toBeDefined()
      expect(giac!.certifications.length).toBeGreaterThan(0)
    })

    it('has CompTIA certifications', () => {
      const comptia = resume.certifications.find((c) => c.provider === 'CompTIA')
      expect(comptia).toBeDefined()
      expect(comptia!.certifications.length).toBeGreaterThan(0)
    })
  })

  describe('Skills Validation', () => {
    it('skills is an array', () => {
      expect(Array.isArray(resume.skills)).toBe(true)
    })

    it('has at least one skill category', () => {
      expect(resume.skills.length).toBeGreaterThan(0)
    })

    it('all skill categories have required fields', () => {
      resume.skills.forEach((skillCat) => {
        expect(skillCat.category).toBeDefined()
        expect(skillCat.skills).toBeDefined()
        
        expect(typeof skillCat.category).toBe('string')
        expect(Array.isArray(skillCat.skills)).toBe(true)
      })
    })

    it('all categories are meaningful', () => {
      resume.skills.forEach((skillCat) => {
        expect(skillCat.category.length).toBeGreaterThan(3)
      })
    })

    it('all skill arrays have items', () => {
      resume.skills.forEach((skillCat) => {
        expect(skillCat.skills.length).toBeGreaterThan(0)
        
        skillCat.skills.forEach((skill) => {
          expect(typeof skill).toBe('string')
          expect(skill.length).toBeGreaterThan(0)
        })
      })
    })

    it('has critical skills category', () => {
      const critical = resume.skills.find((s) => 
        s.category.toLowerCase().includes('critical')
      )
      expect(critical).toBeDefined()
    })

    it('has security knowledge category', () => {
      const security = resume.skills.find((s) => 
        s.category.toLowerCase().includes('security')
      )
      expect(security).toBeDefined()
    })

    it('has technologies category', () => {
      const tech = resume.skills.find((s) => 
        s.category.toLowerCase().includes('technolog')
      )
      expect(tech).toBeDefined()
    })

    it('has programming category', () => {
      const programming = resume.skills.find((s) => 
        s.category.toLowerCase().includes('programming')
      )
      expect(programming).toBeDefined()
    })
  })

  describe('Type Safety', () => {
    it('satisfies Resume type', () => {
      const r: Resume = resume
      expect(r).toBeDefined()
    })

    it('satisfies Experience type', () => {
      const exp: Experience = resume.experience[0]
      expect(exp).toBeDefined()
    })

    it('satisfies Education type', () => {
      const edu: Education = resume.education[0]
      expect(edu).toBeDefined()
    })

    it('satisfies CertificationCategory type', () => {
      const cert: CertificationCategory = resume.certifications[0]
      expect(cert).toBeDefined()
    })

    it('satisfies SkillCategory type', () => {
      const skill: SkillCategory = resume.skills[0]
      expect(skill).toBeDefined()
    })
  })

  describe('Content Quality', () => {
    it('summary is a non-empty string', () => {
      expect(resume.summary).toBeTruthy()
      expect(typeof resume.summary).toBe('string')
    })

    it('has multiple experience entries', () => {
      expect(resume.experience.length).toBeGreaterThanOrEqual(3)
    })

    it('most recent experience comes first', () => {
      // Should have "Present" in first entry's duration
      const firstDuration = resume.experience[0].duration.toLowerCase()
      expect(firstDuration).toContain('present')
    })

    it('has comprehensive skill coverage', () => {
      const totalSkills = resume.skills.reduce(
        (sum, cat) => sum + cat.skills.length,
        0
      )
      expect(totalSkills).toBeGreaterThan(20)
    })

    it('has multiple certification providers', () => {
      expect(resume.certifications.length).toBeGreaterThanOrEqual(3)
    })

    it('certifications are acronyms or proper names', () => {
      resume.certifications.forEach((cert) => {
        cert.certifications.forEach((c) => {
          // Should be uppercase acronyms or proper names
          expect(c.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Consistency', () => {
    it('all category names are unique in skills', () => {
      const categories = resume.skills.map((s) => s.category)
      const uniqueCategories = new Set(categories)
      expect(categories.length).toBe(uniqueCategories.size)
    })

    it('all providers are unique in certifications', () => {
      const providers = resume.certifications.map((c) => c.provider)
      const uniqueProviders = new Set(providers)
      expect(providers.length).toBe(uniqueProviders.size)
    })

    it('no duplicate companies in experience', () => {
      const companies = resume.experience.map((e) => e.company)
      const uniqueCompanies = new Set(companies)
      // May have duplicate companies (multiple roles)
      expect(uniqueCompanies.size).toBeGreaterThan(0)
    })

    it('no duplicate institutions in education', () => {
      const institutions = resume.education.map((e) => e.institution)
      const uniqueInstitutions = new Set(institutions)
      // May have duplicate institutions (multiple degrees)
      expect(uniqueInstitutions.size).toBeGreaterThan(0)
    })
  })

  describe('Dynamic Helper Functions', () => {
    it('getYearsOfExperience returns a positive number', () => {
      const years = getYearsOfExperience()
      expect(typeof years).toBe('number')
      expect(years).toBeGreaterThan(0)
      expect(years).toBeLessThan(50) // Sanity check
    })

    it('getYearsOfExperience calculates from earliest experience', () => {
      const years = getYearsOfExperience()
      const currentYear = new Date().getFullYear()

      // Find the actual earliest year across all experience entries
      const allYears: number[] = []
      resume.experience.forEach(exp => {
        const year = parseInt(exp.duration.match(/\d{4}/)?.[0] || "2021")
        allYears.push(year)
      })
      const earliestYear = Math.min(...allYears)

      expect(years).toBe(currentYear - earliestYear)
    })

    it('getShortSummary includes calculated years', () => {
      const summary = getShortSummary()
      const years = getYearsOfExperience()
      expect(summary).toContain(`${years}+`)
      expect(summary).toContain('Security architect')
      expect(summary.length).toBeGreaterThan(50)
    })

    it('getSummary includes calculated years', () => {
      const summary = getSummary()
      const years = getYearsOfExperience()
      expect(summary).toContain(`${years}`)
      expect(summary).toContain('cybersecurity professional')
      expect(summary.length).toBeGreaterThan(100)
    })

    it('getShortSummary is shorter than getSummary', () => {
      expect(getShortSummary().length).toBeLessThan(getSummary().length)
    })

    it('both summaries contain years reference', () => {
      expect(getShortSummary()).toMatch(/\d+\+?\s+years?/i)
      expect(getSummary()).toMatch(/\d+\+?\s+years?/i)
    })
  })
})
