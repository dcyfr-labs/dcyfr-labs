'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
] as const;

export interface ThemeSwitcherProps {
  /** Size of the trigger button. Defaults to "icon". */
  size?: 'icon' | 'sm' | 'default';
  /** Visual variant of the trigger button. Defaults to "ghost". */
  variant?: 'ghost' | 'outline' | 'secondary';
  /** Optional className on the trigger. */
  className?: string;
}

/**
 * Theme switcher dropdown — Light / Dark / System.
 *
 * Uses `next-themes` — consumer app must wrap in `<ThemeProvider>` with
 * `attribute="class"` for this to apply themes correctly.
 *
 * The trigger icon reflects the **resolved** theme (not the persisted value)
 * so system-mode renders the current OS preference.
 */
export function ThemeSwitcher({ size = 'icon', variant = 'ghost', className }: ThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR/CSR mismatch: render a neutral icon until mounted.
  const current = mounted ? (resolvedTheme ?? 'light') : 'light';
  const TriggerIcon = current === 'dark' ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} aria-label="Toggle theme">
          <TriggerIcon className="size-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            data-active={theme === value || undefined}
            className="gap-2"
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{label}</span>
            {theme === value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
