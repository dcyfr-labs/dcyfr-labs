import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getValuePropositions } from "@/data/company-cv";
import { TYPOGRAPHY, SPACING, HOVER_EFFECTS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * ClientValueProps Component
 * 
 * Displays value propositions explaining why clients should
 * choose DCYFR Labs with clear benefits and CTAs.
 */
export function ClientValueProps() {
  const valueProps = getValuePropositions();

  return (
    <div className={SPACING.content}>
      <div className="text-center mb-12">
        <h2 className={TYPOGRAPHY.h1.standard}>Why Choose DCYFR Labs</h2>
        <p className={`${TYPOGRAPHY.description} mt-4 max-w-3xl mx-auto`}>
          We bring deep expertise, modern technology, and a security-first mindset
          to every project—delivering production-ready solutions that scale.
        </p>
      </div>

      <div className={SPACING.subsection}>
        {valueProps.map((prop, idx) => (
          <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h3 className={cn(TYPOGRAPHY.h2.standard, "mb-2")}>
                  {prop.title}
                </h3>
                <p className="text-muted-foreground">{prop.description}</p>
              </div>

              {/* Benefits List */}
              <ul className="space-y-2.5">
                {prop.benefits.map((benefit, benefitIdx) => (
                  <li
                    key={benefitIdx}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className={cn("p-8 mt-8 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 text-center")}>
        <h3 className={cn(TYPOGRAPHY.h2.standard, "mb-4")}>
          Ready to Build Something Secure & Scalable?
        </h3>
        { }
        <p className={cn(TYPOGRAPHY.description, "mb-6 max-w-2xl mx-auto")}>
          Let&apos;s discuss how DCYFR Labs can help you navigate the complex landscape
          of cyber architecture and modern web development.
        </p>
        <Button
          size="lg"
          asChild
          className={HOVER_EFFECTS.button}
        >
          <Link href="/contact">
            Get in Touch
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
