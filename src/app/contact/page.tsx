import type { Metadata } from "next";
import { getContactPageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import { headers } from "next/headers";
import { PAGE_LAYOUT, TYPOGRAPHY } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import dynamic from "next/dynamic";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { ContactForm, ContactFormErrorBoundary, SmoothScrollToHash } from "@/components/common";
import { ContactMethods, ContactSocialLinks } from "@/components/contact";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "Contact";
const pageDescription = "Get in touch for inquiries, collaborations, or feedback.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/contact",
});

export default async function ContactPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // JSON-LD structured data for contact page
  const jsonLd = getContactPageSchema(pageDescription);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />
      <div className="space-y-10 md:space-y-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section id="hero">
          <PageHero
            title="Contact Us"
            description="Whether you have questions, feedback, or collaboration ideas, we're here to help. Choose your preferred way to connect."
          />
        </section>

        {/* Contact Form */}
        <section id="contact-form" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="text-center mb-8">
              <h2 className={TYPOGRAPHY.h2.featured}>Send a Message</h2>
              <p className="text-muted-foreground mt-2">
                Fill out the form below and we&apos;ll get back to you as soon
                as possible
              </p>
            </div>
            <ContactFormErrorBoundary>
              <ContactForm />
            </ContactFormErrorBoundary>
          </ScrollReveal>
        </section>

        {/* Contact Methods - Primary options */}
        <section id="contact-methods" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <ContactMethods />
          </ScrollReveal>
        </section>

        {/* Social Links - All platforms */}
        <section id="social-links" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <ContactSocialLinks />
          </ScrollReveal>
        </section>
      </div>
    </PageLayout>
  );
}
