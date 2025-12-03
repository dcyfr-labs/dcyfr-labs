export type Experience = {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
};

export type Education = {
  degree: string;
  institution: string;
  duration?: string;
  highlights?: string[];
};

export type CertificationCategory = {
  provider: string;
  certifications: string[];
};

export type SkillCategory = {
  category: string;
  skills: string[];
};

export type Resume = {
  summary: string;
  shortSummary: string;
  experience: Experience[];
  education: Education[];
  certifications: CertificationCategory[];
  skills: SkillCategory[];
};

export const resume: Resume = {
  shortSummary: "Security architect with 5+ years leading security programs, incident response, and secure development practices for global organizations.",
  summary: "I'm a cybersecurity professional with over 5 years of experience leading security programs, incident response, and building secure development practices for global organizations. I specialize in cyber risk management, vulnerability management, and automating operational security. I'm passionate about mentoring the next generation of security professionals and sharing my knowledge through writing and community engagement.",
  experience: [
    {
      title: "Principal Security Engineer",
      company: "Monks",
      duration: "Jul 2023 → Present",
      responsibilities: [
        "Led audits to certify offices for ISO 27001, SOC2, TISAX, and TPN, ensuring compliance with industry standards.",
        "Implemented technical controls, reducing global vulnerabilities by 23% and enhancing security posture.",
        "Streamlined incident response processes, achieving a 35% reduction in global response times."
      ]
    },
    {
      title: "Security Engineering & Operations Lead",
      company: "Monks",
      duration: "Jul 2022 → Jul 2023",
      responsibilities: [
        "Enhanced operations and incident response programs, ensuring swift and effective response times.",
        "Developed policies and procedures for mergers and acquisitions, securing incoming integrations.",
        "Led threat hunting and vulnerability management projects to address security risks proactively."
      ]
    },
    {
      title: "Information Security Engineer",
      company: "Monks",
      duration: "Jul 2021 → Jul 2022",
      responsibilities: [
        "Developed security operations and engineering programs to enhance organizational security posture.",
        "Conducted technical audits, identifying vulnerabilities and prioritizing future security initiatives.",
        "Served as a Subject Matter Expert, providing insights and recommendations directly to the CISO."
      ]
    },
    {
      title: "Co-founder, VP, CTO, CISO",
      company: "Information Security Network, Inc.",
      duration: "Sep 2019 → Sep 2021",
      responsibilities: [
        "Served as VP on the Board of Directors, aligning IT and security objectives with nonprofit strategies.",
        "Led seminars and training events at BSides and Hack Pensacola, enhancing community engagement.",
        "Collaborated with local groups like DC850 to promote security awareness and education initiatives."
      ]
    },
    {
      title: "Security Operations Analyst II",
      company: "Creative Breakthroughs, Inc.",
      duration: "Dec 2020 → Jul 2021",
      responsibilities: [
        "Triaged and validated level one escalations, leading incident response for over 20 client contracts.",
        "Collaborated with engineering teams to resolve operational issues and enhance procedures.",
        "Developed tailored playbooks and documentation for diverse client environments."
      ]
    },
    {
      title: "IT Security Specialist",
      company: "Escambia County Commissioners Office",
      duration: "Mar 2020 → Dec 2020",
      responsibilities: [
        "Developed a comprehensive security awareness program, enhancing phishing detection by over 40%.",
        "Triaged alerts and conducted forensics and incident response for over 1k CJIS-certified systems.",
        "Applied CIS and NIST controls to bolster security for public and emergency support systems."
      ]
    }
  ],
  education: [
    {
      degree: "MS Information Security Engineering",
      institution: "SANS Technology Institute",
      duration: "Jan 2024 → Present",
      highlights: [
        "Defensible Security Architecture",
        "Hacking Techniques & Incident Response",
        "IT Security Planning, Policy, and Leadership",
        "Security Essentials"
      ]
    },
    {
      degree: "BAS Cybersecurity",
      institution: "Pensacola State College",
      duration: "Dec 2020",
      highlights: [
        "Computer Science Academic Scholar",
        "Cyber Defense Club Training Officer",
        "Capture the Flag Competition Lead",
        "National Technical Honors Society",
        "3x National Cyber League Gold Bracket Finalist"
      ]
    }
  ],
  certifications: [
    {
      provider: "GIAC",
      certifications: ["GDSA", "GSTRT", "GCIH", "GSEC"]
    },
    {
      provider: "CompTIA",
      certifications: ["CSIE", "CSAE", "CNVP", "CNSP", "CSAP", "CSIS", "CIOS", "SecurityX", "PenTest+", "CySA+", "Security+", "Network+", "A+", "ITF+"]
    },
    {
      provider: "ISC2",
      certifications: ["Candidate"]
    },
    {
      provider: "Mile2",
      certifications: ["C)ISSO", "C)PTE", "C)DRE", "C)DFE"]
    }
  ],
  skills: [
    {
      category: "Critical Skills",
      skills: [
        "Leadership", "Communication", "Analytical Skills", "Collaboration", "Customer Service", "Problem Solving", "Critical Thinking", "Adaptability", "Time Management", "Project Management", "Mentoring & Training", "Documentation", "Risk Assessment", "Policy Development"
      ]
    },
    {
      category: "Security Knowledge",
      skills: [
        "Risk Management", "Vulnerability Management", "Incident Response", "Threat Hunting", "Security Operations", "Cloud Security", "Application Security", "Network Security", "Identity & Access Management", "Data Protection", "Forensics", "Penetration Testing", "DevSecOps", "Compliance & Auditing", "Threat Analysis", "Security Auditing", "Security Awareness Training"
      ]
    },
    {
      category: "Frameworks & Standards",
      skills: [
        "NIST", "CSF", "SOC2", "ISO 27001", "ITIL", "LGPD", "STIGs", "OWASP", "NIST 800-53", "CCPA/CPA", "CIS Controls", "TISAX", "TPN", "CJIS", "GDPR"
      ]
    },
    {
      category: "Technologies & Tools",
      skills: [
        "Cloudflare", "Snyk", "Claude", "CrowdStrike", "Visual Studio Code", "Tenable", "Vercel", "Qualys", "ChatGPT", "Zscaler", "macOS", "Splunk", "Axiom", "AWS", "Nessus", "Palo Alto", "Azure", "Proofpoint", "Kali Linux", "VMware", "Wireshark", "SIEM", "Perplexity", "GitHub", "Carbon Black", "Burp Suite", "Unix", "Google Gemini", "Metasploit", "GCP", "Windows", "Google Workspace", "Postman", "Linux", "Microsoft Office 365", "Jira", "Slack", "Confluence", "Docker", "Terraform", "Kubernetes", "Ansible", "Jenkins", "Git", "CI/CD", "REST API"
      ]
    },
    {
      category: "Programming & Automation",
      skills: [
        "Python", "Next.js", "Bash", "PowerShell", "Git", "Node.js", "TypeScript", "Terraform", "YAML", "Docker", "Kubernetes", "SQL", "Ansible", "React", "JavaScript", "JSON", "Go", "Java", "HTML/CSS", "C/C++", "PHP"
      ]
    }
  ]
};

/**
 * Calculate years of experience from the earliest experience entry
 * @returns Number of years in cybersecurity
 */
export function getYearsOfExperience(): number {
  const firstExperience = resume.experience[resume.experience.length - 1];
  const startYear = parseInt(firstExperience.duration.match(/\d{4}/)?.[0] || "2021");
  return new Date().getFullYear() - startYear;
}

/**
 * Get the short summary with current years of experience
 * @returns Dynamic short summary string
 */
export function getShortSummary(): string {
  const years = getYearsOfExperience();
  return `Security architect with ${years}+ years leading security programs, incident response, and secure development practices for global organizations.`;
}

/**
 * Get the full summary with current years of experience
 * @returns Dynamic full summary string
 */
export function getSummary(): string {
  const years = getYearsOfExperience();
  return `I'm a cybersecurity professional with over ${years} years of experience leading security programs, incident response, and building secure development practices for global organizations. I specialize in cyber risk management, vulnerability management, and automating operational security. I'm passionate about mentoring the next generation of security professionals and sharing my knowledge through writing and community engagement.`;
}

export default resume;
