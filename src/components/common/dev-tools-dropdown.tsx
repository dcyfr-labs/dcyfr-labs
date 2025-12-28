"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { NAVIGATION } from "@/lib/navigation-config";
import { useDropdown } from "@/hooks/use-dropdown";
import { cn } from "@/lib/utils";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

export default function DevToolsDropdown() {
  const dropdown = useDropdown();

  /* eslint-disable react-hooks/refs -- dropdown.ref/isOpen/toggle are hook return values, not ref.current access */
  return (
    <div ref={dropdown.ref} className="relative">
      <Badge
        variant="outline"
        className={cn("cursor-pointer transition-colors gap-1 px-2.5 hover:opacity-90", SEMANTIC_COLORS.accent.pink.badge)}
        onClick={dropdown.toggle}
        role="button"
        aria-haspopup="menu"
        aria-expanded={dropdown.isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dropdown.toggle();
          }
        }}
      >
        Dev Tools
        <ChevronDown
          className={`h-3 w-3 transition-transform ${dropdown.isOpen ? "rotate-180" : ""}`}
        />
      </Badge>

      {dropdown.isOpen && (
        <div {...dropdown.contentProps} className="absolute right-0 mt-2 w-48 rounded-md border bg-card p-2 shadow-lg z-50">
          <nav className="flex flex-col">
            {NAVIGATION.devTools.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm hover:bg-muted rounded"
                onClick={dropdown.close}
                prefetch={false}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
  /* eslint-enable react-hooks/refs */
}
