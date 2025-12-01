import { SiteLogo } from "@/components/common/site-logo";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

export function SiteFooter() {
  return (
    <>
      {/* Mobile footer - minimalistic */}
      <footer className="md:hidden border-t mt-16 site-footer">
        <div className="mx-auto px-4 sm:px-8 h-16 flex items-center justify-center text-sm text-muted-foreground gap-2">
          {/* <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span> */}
          <SiteLogo size="sm" iconClassName="opacity-80" />
        </div>
      </footer>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t mt-16 site-footer">
        <div
          className={cn(
            "mx-auto",
            CONTAINER_WIDTHS.archive,
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
          <p className="text-muted-foreground flex items-center gap-2 text-center md:text-left">
            {/* &copy;{" "}
            <span suppressHydrationWarning>{new Date().getFullYear()}</span> */}
            <SiteLogo size="sm" iconClassName="opacity-80" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="/activity"
              className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1"
            >
              Activity
            </a>
            <a
              href="/contact"
              className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1"
            >
              Contact
            </a>
            <a
              href="/feed"
              className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1"
            >
              Feed
            </a>
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
