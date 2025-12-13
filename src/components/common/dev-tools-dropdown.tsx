"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

export default function DevToolsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Badge
        variant="destructive"
        className="cursor-pointer hover:bg-destructive/80 transition-colors gap-1 px-2.5"
        onClick={() => setOpen((s) => !s)}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((s) => !s);
          }
        }}
      >
        Dev Tools
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Badge>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card p-2 shadow-lg z-50">
          <nav className="flex flex-col">
            <Link
              href="/dev/docs"
              className="px-3 py-2 text-sm hover:bg-muted rounded"
              onClick={() => setOpen(false)}
              prefetch={false}
            >
              Docs
            </Link>
            <Link
              href="/dev/analytics"
              className="px-3 py-2 text-sm hover:bg-muted rounded"
              onClick={() => setOpen(false)}
              prefetch={false}
            >
              Analytics
            </Link>
            <Link
              href="/dev/maintenance"
              className="px-3 py-2 text-sm hover:bg-muted rounded"
              onClick={() => setOpen(false)}
              prefetch={false}
            >
              Maintenance
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
