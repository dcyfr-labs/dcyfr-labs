import Link from 'next/link';
import { HOVER_EFFECTS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { FocusAreaCard } from './focus-area-card';

/**
 * About dcyfr.aiponent
 *
 * Describes DCYFR Labs as a virtual partnership focused on cyber architecture,
 * security, and innovation. Highlights the mission, three content pillars,
 * and principles that guide the work.
 */
export function AboutDcyfrLabs() {
  const focusAreas = [
    {
      title: 'Development & Architecture',
      description:
        'Production-grade architecture decisions, server-first rendering, and building systems that scale. We share real experiences from real projects, complete with trade-offs and lessons learned.',
      linkUrl: '/blog?category=Web',
      linkText: 'Explore development articles',
    },
    {
      title: 'Cybersecurity & Defense',
      description:
        'Defense-in-depth strategies, practical security hardening, and analysis of real threats and defenses. Security as an enabler, not a bottleneck.',
      linkUrl: '/blog?category=DevSecOps',
      linkText: 'Explore security articles',
    },
    {
      title: 'AI & Automation',
      description:
        'Augmentation over replacement. We explore practical AI workflows, human-centric automation, and how AI can enhance (not replace) human expertise and creativity.',
      linkUrl: '/blog?category=ai',
      linkText: 'Explore AI articles',
    },
  ];

  return (
    <div className="prose prose-slate dark:prose-invert">
      <p>
        DCYFR Labs is a virtual partnership dedicated to building secure, innovative solutions for
        the modern web. We focus on cyber architecture and design, helping organizations navigate
        the complex landscape of emerging technologies while maintaining robust security postures.
      </p>

      <h3>Our Philosophy</h3>
      <p className="italic">
        &ldquo;Security isn&apos;t about saying no, it&apos;s about enabling innovation with
        confidence.&rdquo;
      </p>
      <p className="text-muted-foreground">
        We believe in building resilient systems that empower teams to move fast without
        compromising on security. Our approach is practical, human-centric, and focused on
        real-world constraints rather than theoretical perfection.
      </p>

      <h3>What We Focus On</h3>
      <div className={SPACING.subsection}>
        {focusAreas.map((area, idx) => (
          <FocusAreaCard
            key={idx}
            title={area.title}
            description={area.description}
            linkUrl={area.linkUrl}
            linkText={area.linkText}
          />
        ))}
      </div>

      <h3>How We Work</h3>
      <ul className="list-disc">
        <li>
          <strong>Real projects, real constraints:</strong> We share from actual experience, not
          ivory tower theory
        </li>
        <li>
          <strong>Practical over academic:</strong> Solutions that work in production matter more
          than perfect architecture diagrams
        </li>
        <li>
          <strong>Transparent trade-offs:</strong> Every decision has costs—we discuss them openly
        </li>
        <li>
          <strong>Open source contributions:</strong> We give back to the community that enables our
          work
        </li>
        <li>
          <strong>Continuous learning:</strong> Technology evolves, and so do we
        </li>
      </ul>

      <p>
        Through our{' '}
        <Link href="/blog" className={`underline ${HOVER_EFFECTS.link}`}>
          blog
        </Link>{' '}
        and{' '}
        <Link href="/work" className={`underline ${HOVER_EFFECTS.link}`}>
          projects
        </Link>
        , we share knowledge, insights, and practical guidance for building secure, scalable systems
        in the age of AI and cloud-native infrastructure.
      </p>
    </div>
  );
}
