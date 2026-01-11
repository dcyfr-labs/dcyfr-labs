/**
 * Feed Dropdown Component
 *
 * Dropdown menu for subscribing to RSS, Atom, and JSON feeds.
 * Used on blog, work, and activity archive pages.
 *
 * @example
 * ```tsx
 * <FeedDropdown feedType="blog" />
 * <FeedDropdown feedType="work" />
 * <FeedDropdown feedType="activity" />
 * ```
 */

import { Rss } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedDropdownProps {
  feedType: "blog" | "work" | "activity";
}

const feedConfigs = {
  blog: {
    rss: "/blog/rss.xml",
    atom: "/blog/feed",
    json: "/blog/feed.json",
    label: "blog",
  },
  work: {
    rss: "/work/rss.xml",
    atom: "/work/feed",
    json: "/work/feed.json",
    label: "projects",
  },
  activity: {
    rss: "/activity/rss.xml",
    atom: "/activity/feed",
    json: "/activity/feed.json",
    label: "activity",
  },
};

export function FeedDropdown({ feedType }: FeedDropdownProps) {
  const config = feedConfigs[feedType];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border/50 hover:border-border hover:bg-muted/30 text-sm">
        <Rss className="w-4 h-4" aria-hidden="true" />
        Subscribe
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={config.rss}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Rss className="w-4 h-4 mr-2" />
            RSS
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={config.atom}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Rss className="w-4 h-4 mr-2" />
            Atom
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={config.json}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Rss className="w-4 h-4 mr-2" />
            JSON
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
