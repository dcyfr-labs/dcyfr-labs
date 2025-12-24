import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCompanyOverview } from "@/data/company-cv";
import { TYPOGRAPHY, SPACING, PAGE_LAYOUT } from "@/lib/design-tokens";
import { Building2, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CompanyOverview Component
 * 
 * Hero section displaying DCYFR Labs company information, mission,
 * and key differentiators.
 */
export function CompanyOverview() {
  const overview = getCompanyOverview();

  return (
    <div className={SPACING.content}>
      {/* Company Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className={TYPOGRAPHY.h1.hero}>{overview.name}</h1>
        <p className={`${TYPOGRAPHY.h3.standard} text-muted-foreground`}>
          {overview.tagline}
        </p>
        
        {/* Company Details */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Est. {overview.established}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{overview.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Professional Services</span>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <Card className="p-4 mb-8 bg-gradient-to-br from-background to-muted/20">
        <h2 className={cn(TYPOGRAPHY.h3.standard, "mb-3")}>Mission</h2>
        <p className={cn(TYPOGRAPHY.description, "text-foreground/90")}>
          {overview.mission}
        </p>
      </Card>

      {/* Key Differentiators */}
      <div>
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-6`}>What Sets Us Apart</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {overview.differentiators.map((diff, idx) => (
            <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-2 flex items-center gap-2`}>
                <span className="text-primary text-xl">✓</span>
                {diff.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {diff.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
