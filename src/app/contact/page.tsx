import type { Metadata } from "next";
import { getContactPageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import { headers } from "next/headers";
import { SPACING, PAGE_LAYOUT } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import dynamic from "next/dynamic";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { ContactForm, ContactFormErrorBoundary } from "@/components/common";

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
      <div className="space-y-10 md:space-y-14">
      <PageHero
        title="Contact Me"
        description="Whether you have questions, feedback, or collaboration ideas, feel free to reach out using the form below."
      />
      
      {/* Contact Form */}
      <section className={PAGE_LAYOUT.section.container}>
        <ScrollReveal animation="fade-up" delay={0}>
          <div className={SPACING.content}>
            <ContactFormErrorBoundary>
              <ContactForm />
            </ContactFormErrorBoundary>
          </div>
        </ScrollReveal>
      </section>
      </div>
    </PageLayout>
  );
}
