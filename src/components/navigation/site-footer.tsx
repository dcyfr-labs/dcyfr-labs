import { SiteLogo } from "@/components/common/site-logo";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { NAVIGATION } from "@/lib/navigation-config";

export function SiteFooter() {
  return (
    <>
      {/* Mobile footer - minimalistic */}
      {/* <footer className="md:hidden mt-16 site-footer">
        <div className="mx-auto px-4 sm:px-8 h-16 flex items-center justify-center text-sm text-muted-foreground gap-2">
          <SiteLogo size="sm" showIcon={false} />
        </div> 
      </footer> */}

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
            "text-sm",
            "py-4",
            "md:py-0"
          )}
        >
          <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
            &copy; {new Date().getFullYear()}
            <SiteLogo size="sm" iconClassName="opacity-80" showIcon={false} />
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
            <a
              href="/sitemap.xml"
              className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1"
            >
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
