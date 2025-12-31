import { SiteLogo } from "@/components/common";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { NAVIGATION } from "@/lib/navigation-config";

export function SiteFooter() {
  return (
    <>
      {/* Mobile footer - hidden on mobile since bottom nav is used */}
      <footer className="hidden md:hidden mt-8 site-footer border-t pb-2">
        <div className="mx-auto px-4 sm:px-8 h-16 flex items-center justify-center text-[clamp(0.875rem,1vw+0.75rem,1rem)] text-muted-foreground gap-2">
          <SiteLogo size="md" />
        </div>
      </footer>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t mt-16 site-footer">
        <div
          className={cn(
            "mx-auto",
            CONTAINER_WIDTHS.dashboard,
            "px-4",
            "sm:px-8",
            "md:px-8",
            "h-16",
            "flex",
            "flex-col",
            "md:flex-row",
            "items-center",
            "justify-between",
            "gap-4",
            "md:gap-0",
            "text-[clamp(0.875rem,1vw+0.75rem,1rem)]",
            "py-4",
            "md:py-0"
          )}
        >
          <div className="flex items-center justify-center text-[clamp(0.875rem,1vw+0.75rem,1rem)] text-muted-foreground gap-2">
            &copy; {new Date().getFullYear()}
            <SiteLogo size="sm" iconClassName="opacity-80" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {NAVIGATION.footer.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
