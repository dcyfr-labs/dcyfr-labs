import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="hidden md:block border-t mt-16 site-footer">
      <div className={cn("mx-auto", "max-w-7xl", "px-4", "sm:px-6", "md:px-8", "h-16", "flex", "flex-col", "md:flex-row", "items-center", "justify-between", "gap-4", "md:gap-0", "text-sm", "py-4", "md:py-0")}>
        <p className="text-muted-foreground flex items-center gap-1 text-center md:text-left">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Drew <Logo width={12} height={12} className="opacity-70" />
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a href="/feed" className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1">
            Feed
          </a>
          <a href="/sitemap.xml" className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1.5 py-1">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
