import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServiceCategories } from "@/data/company-cv";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { Shield, Code, Globe, Brain, ChevronRight } from "lucide-react";

/**
 * ServiceOfferings Component
 * 
 * Displays DCYFR Labs service categories with detailed offerings
 * and deliverables for each service.
 */
export function ServiceOfferings() {
  const services = getServiceCategories();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield":
        return Shield;
      case "code":
        return Code;
      case "globe":
        return Globe;
      case "brain":
        return Brain;
      default:
        return Shield;
    }
  };

  return (
    <div className={SPACING.content}>
      <div className="text-center mb-12">
        <h2 className={TYPOGRAPHY.h1.standard}>Service Offerings</h2>
        <p className={`${TYPOGRAPHY.description} mt-4 max-w-3xl mx-auto`}>
          Comprehensive cyber architecture and development services tailored to your
          business needs, from security design to AI integration.
        </p>
      </div>

      <div className="space-y-12">
        {services.map((category, categoryIdx) => {
          const IconComponent = getIcon(category.icon);
          
          return (
            <div key={categoryIdx}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <h3 className={TYPOGRAPHY.h2.standard}>{category.category}</h3>
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {category.services.map((service, serviceIdx) => (
                  <Card key={serviceIdx} className="p-8 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Service Header */}
                      <div>
                        <h4 className={`${TYPOGRAPHY.h3.standard} mb-2`}>
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <p className={`${TYPOGRAPHY.label.small} mb-2`}>Key Deliverables:</p>
                        <ul className="space-y-1.5">
                          {service.deliverables.map((deliverable, delIdx) => (
                            <li
                              key={delIdx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
