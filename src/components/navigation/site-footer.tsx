import { cn } from '@/lib/utils';
import { CONTAINER_WIDTHS, NAVIGATION_HEIGHT } from '@/lib/design-tokens';
import { NAVIGATION } from '@/lib/navigation-config';

export function SiteFooter() {
  return (
    <>
      {/* Mobile footer - hidden on mobile since bottom nav is used */}
      <footer className="hidden md:hidden mt-8 site-footer border-t pb-2">
        <div
          className={cn(
            'mx-auto px-4 sm:px-8',
            NAVIGATION_HEIGHT,
            'flex items-center justify-center text-[clamp(0.875rem,1vw+0.75rem,1rem)] text-muted-foreground gap-2'
          )}
        >
          &copy; {new Date().getFullYear()} DCYFR Labs
        </div>
      </footer>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t mt-16 site-footer">
        <div
          className={cn(
            'mx-auto',
            CONTAINER_WIDTHS.dashboard,
            'px-4',
            'md:px-8',
            'lg:px-8',
            NAVIGATION_HEIGHT,
            'flex',
            'flex-col',
            'lg:flex-row',
            'items-center',
            'justify-between',
            'gap-4',
            'lg:gap-0',
            'text-[clamp(0.875rem,1vw+0.75rem,1rem)]',
            'py-4',
            'lg:py-0'
          )}
        >
          <div className="flex items-center justify-center text-[clamp(0.875rem,1vw+0.75rem,1rem)] text-muted-foreground gap-2">
            &copy; {new Date().getFullYear()} DCYFR Labs
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4 pb-4 lg:pb-0">
            {NAVIGATION.footer.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1 sm:px-1.5 py-1 text-[clamp(0.75rem,0.9vw+0.625rem,0.875rem)]"
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
