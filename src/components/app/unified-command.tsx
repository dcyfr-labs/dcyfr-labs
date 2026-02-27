/**
 * Unified Command Interface
 *
 * Combines search, navigation, and actions in a single modern command palette.
 * Inspired by VS Code's unified command palette with content-aware sections.
 *
 * Features:
 * - Instant post search with Fuse.js
 * - Navigation shortcuts (Home, Blog, Work, etc.)
 * - Action commands (theme switching)
 * - Continue Reading suggestions
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Recent searches
 * - Responsive design
 *
 * Triggered by: / (forward slash - universal across all OS and keyboards)
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import Fuse from 'fuse.js';
import {
  Search,
  Clock,
  Tag,
  BookOpen,
  Calendar,
  Home,
  Moon,
  Sun,
  Monitor,
  User,
  Briefcase,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY, SPACING, Z_INDEX, CONTENT_HIERARCHY } from '@/lib/design-tokens';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useReadingProgressList } from '@/hooks/use-reading-progress';
import { useSearch } from '@/components/search';
import { NAVIGATION } from '@/lib/navigation-config';
import { CATEGORIES } from '@/lib/post-categories';
import type { SearchIndex, SearchablePost, SearchableProject } from '@/lib/search';
import { fuseOptions, projectFuseOptions } from '@/lib/search';

export interface UnifiedCommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Action command configuration
 */
interface ActionCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  group?: 'main' | 'work' | 'blog' | 'site';
  onSelect: () => void;
}

export function UnifiedCommand(props?: UnifiedCommandProps) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props || {};

  // Get context from SearchProvider for global search state
  const { open: searchProviderOpen, setOpen: setSearchProviderOpen } = useSearch();

  // Support both controlled mode (from props) and uncontrolled mode (from SearchProvider)
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;

  // Determine which open state to use
  // Priority: props > SearchProvider > internal state
  let open: boolean;
  if (isControlled) {
    open = controlledOpen;
  } else {
    open = searchProviderOpen || internalOpen;
  }

  const onOpenChange = useCallback(
    (value: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(value);
      } else {
        // Update both SearchProvider and internal state
        setSearchProviderOpen(value);
        setInternalOpen(value);
      }
    },
    [isControlled, controlledOnOpenChange, setSearchProviderOpen]
  );

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchablePost> | null>(null);
  const [projectFuse, setProjectFuse] = useState<Fuse<SearchableProject> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('dcyfr-recent-searches');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [selectedTags] = useState<string[]>([]);

  // Get reading progress for "Continue Reading"
  const { inProgress } = useReadingProgressList({
    limit: 3,
    minProgress: 5,
    maxProgress: 95,
  });

  // Register / shortcut (universal search)
  useKeyboardShortcut([
    {
      key: '/',
      callback: () => onOpenChange(!open),
      preventInInput: true,
      description: 'Open unified command palette',
    },
  ]);

  // Load search index
  useEffect(() => {
    if (open && !searchIndex) {
      fetch('/search-index.json')
        .then((res) => res.json())
        .then((data: SearchIndex) => {
          setSearchIndex(data);
          setFuse(new Fuse(data.posts, fuseOptions));
          if (data.projects?.length) {
            setProjectFuse(new Fuse(data.projects, projectFuseOptions));
          }
        })
        .catch((err) => console.error('[Command] Failed to load search index:', err));
    }
  }, [open, searchIndex]);

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  // Prevent arrow keys from scrolling the page when modal is open
  useEffect(() => {
    if (!open) return;

    const preventArrowScroll = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventArrowScroll);
    return () => document.removeEventListener('keydown', preventArrowScroll);
  }, [open]);

  // Force focus on input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Save search to history
  const saveSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem('dcyfr-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('dcyfr-recent-searches');
  }, []);

  // Search posts
  const searchResults = useMemo(() => {
    if (!fuse || !search.trim()) return [];

    const fuseResults = fuse.search(search);
    let filtered = fuseResults.map((r) => r.item);

    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)));
    }

    return filtered.slice(0, 8);
  }, [fuse, search, selectedTags]);

  // Search projects
  const projectResults = useMemo(() => {
    if (!projectFuse || !search.trim()) return [];
    return projectFuse
      .search(search)
      .map((r) => r.item)
      .slice(0, 5);
  }, [projectFuse, search]);

  // Comprehensive navigation commands — all sections auto-derived from config
  const navCommands: ActionCommand[] = [
    // Primary nav (main pages)
    ...NAVIGATION.primary.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      icon: item.icon || Home,
      group: 'main' as const,
      keywords: [item.label.toLowerCase(), item.href.slice(1)],
      onSelect: () => {
        router.push(item.href);
        onOpenChange(false);
      },
    })),
    // Work category pages (auto from NAVIGATION.work)
    ...NAVIGATION.work.map((item) => ({
      id: `work-${item.href}`,
      label: item.label,
      icon: Briefcase,
      group: 'work' as const,
      keywords: ['work', 'portfolio', item.label.toLowerCase()],
      onSelect: () => {
        router.push(item.href);
        onOpenChange(false);
      },
    })),
    // Blog section pages (auto from NAVIGATION.blog)
    ...NAVIGATION.blog.map((item) => ({
      id: `blog-${item.href}`,
      label: item.label,
      icon: BookOpen,
      group: 'blog' as const,
      keywords: ['blog', item.label.toLowerCase()],
      onSelect: () => {
        router.push(item.href);
        onOpenChange(false);
      },
    })),
    // Blog category filter pages (auto from CATEGORIES — deduped by label)
    ...(() => {
      const seen = new Set<string>();
      const result: ActionCommand[] = [];
      for (const cat of CATEGORIES) {
        if (seen.has(cat.label)) continue;
        seen.add(cat.label);
        result.push({
          id: `blog-cat-${cat.id}`,
          label: cat.label,
          icon: Tag,
          group: 'blog' as const,
          keywords: ['blog', 'category', cat.label.toLowerCase(), cat.id.toLowerCase()],
          onSelect: () => {
            router.push(`/blog?category=${cat.id}`);
            onOpenChange(false);
          },
        });
      }
      return result;
    })(),
    // Footer / site pages
    ...NAVIGATION.footer.map((item) => ({
      id: `site-${item.href}`,
      label: item.label,
      icon: Globe,
      group: 'site' as const,
      keywords: [item.label.toLowerCase(), item.href.replace(/^\//, '')],
      onSelect: () => {
        if (item.href === '/sitemap.xml' || item.href.startsWith('http')) {
          window.open(item.href, '_blank');
        } else {
          router.push(item.href);
        }
        onOpenChange(false);
      },
    })),
  ];

  // Action commands (theme switching)
  const actionCommands: ActionCommand[] = [
    {
      id: 'action-light-theme',
      label: 'Light Theme',
      icon: Sun,
      keywords: ['theme', 'light'],
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('theme', 'light');
        onOpenChange(false);
      },
    },
    {
      id: 'action-dark-theme',
      label: 'Dark Theme',
      icon: Moon,
      keywords: ['theme', 'dark'],
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        onOpenChange(false);
      },
    },
    {
      id: 'action-system-theme',
      label: 'System Theme',
      icon: Monitor,
      keywords: ['theme', 'system', 'auto'],
      onSelect: () => {
        const html = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.classList.remove('light', 'dark');
        html.classList.add(prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', 'system');
        onOpenChange(false);
      },
    },
  ];

  // Filter commands by search
  const filteredNavCommands = navCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords?.some((kw) => kw.includes(search.toLowerCase()))
  );

  const filteredActionCommands = actionCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords?.some((kw) => kw.includes(search.toLowerCase()))
  );

  const filteredContinueReading = inProgress.filter((article) =>
    article.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Determine what to show
  const hasSearchQuery = search.trim().length > 0;
  const hasResults =
    searchResults.length > 0 ||
    projectResults.length > 0 ||
    filteredNavCommands.length > 0 ||
    filteredActionCommands.length > 0 ||
    filteredContinueReading.length > 0;

  // Group nav commands by section for browse mode (no search query)
  const mainNavCmds = navCommands.filter((c) => c.group === 'main');
  const workNavCmds = navCommands.filter((c) => c.group === 'work');
  const blogNavCmds = navCommands.filter((c) => c.group === 'blog');
  const siteNavCmds = navCommands.filter((c) => c.group === 'site');

  // Collapsible browse sections — all collapsed by default
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(['main', 'work', 'blog', 'site'])
  );

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  // Reset collapsed state each time the palette opens
  useEffect(() => {
    if (open) setCollapsedSections(new Set(['main', 'work', 'blog', 'site']));
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${Z_INDEX.overlay} bg-background/80 backdrop-blur-sm pointer-events-auto`}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100%-3rem)] sm:w-[calc(100%-6rem)] max-w-2xl',
          'max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)]',
          'flex flex-col overflow-hidden',
          'pointer-events-auto'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className={cn(
            'rounded-xl border border-border shadow-2xl',
            'bg-muted/80 dark:bg-muted/40',
            'overflow-hidden flex-1 min-h-0 flex flex-col'
          )}
          value=""
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border/50 px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Search commands..."
              autoFocus
              className={cn(
                'flex h-14 w-full bg-transparent py-3 text-base outline-none',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              Esc
            </kbd>
          </div>

          <Command.List className="flex-1 overflow-y-auto p-2">
            {/* Loading State */}
            {!searchIndex && (
              <Command.Loading>
                <div className={cn('space-y-3 p-4', SPACING.content)}>
                  {/* Header skeleton */}
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20 animate-pulse" />
                    <div className="h-4 flex-1 rounded bg-muted-foreground/20 animate-pulse" />
                  </div>

                  {/* Content skeletons */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={SPACING.compact}>
                      <div
                        className="h-3 w-3/4 rounded bg-muted-foreground/15 animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                      <div
                        className="h-3 w-1/2 rounded bg-muted-foreground/10 animate-pulse"
                        style={{ animationDelay: `${i * 150 + 75}ms` }}
                      />
                    </div>
                  ))}

                  {/* Helpful text */}
                  <div className="text-center text-xs text-muted-foreground pt-2">
                    Preparing search index...
                  </div>
                </div>
              </Command.Loading>
            )}

            {/* Empty State */}
            {searchIndex && !hasSearchQuery && recentSearches.length === 0 && (
              <Command.Empty>
                <div className={cn('text-center space-y-3', SPACING.content, 'py-8')}>
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <div>
                    <p className="text-sm text-foreground/70 mb-1">
                      Search posts, navigate, or switch theme
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try typing &quot;react&quot; or &quot;dark theme&quot;
                    </p>
                  </div>
                </div>
              </Command.Empty>
            )}

            {/* Recent Searches (when no search query) */}
            {!hasSearchQuery && recentSearches.length > 0 && (
              <Command.Group heading="Recent Searches">
                {recentSearches.map((query) => (
                  <Command.Item
                    key={query}
                    onSelect={() => setSearch(query)}
                    className={cn(
                      'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{query}</span>
                  </Command.Item>
                ))}
                <button
                  onClick={clearRecent}
                  className="w-full text-left px-3 py-2 text-xs text-primary/60 dark:text-muted-foreground hover:text-primary dark:hover:text-foreground"
                >
                  Clear recent searches
                </button>
              </Command.Group>
            )}

            {/* Continue Reading */}
            {!hasSearchQuery && filteredContinueReading.length === 0 && inProgress.length > 0 && (
              <Command.Group heading="Continue Reading">
                {inProgress.map((article) => (
                  <Command.Item
                    key={article.articleId}
                    onSelect={() => {
                      router.push(`/blog/${article.articleId}`);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <BookOpen className="h-4 w-4 text-primary/60" />
                    <div className="flex-1 min-w-0">
                      <div className={CONTENT_HIERARCHY.primary.content}>{article.title}</div>
                      <div className={cn(CONTENT_HIERARCHY.subtle.content, 'text-xs')}>
                        {Math.round(article.progress)}% complete
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* No-query navigation browse — collapsible sections */}
            {!hasSearchQuery &&
              (
                [
                  { key: 'main', label: 'Navigation', cmds: mainNavCmds },
                  { key: 'work', label: 'Work', cmds: workNavCmds },
                  { key: 'blog', label: 'Blog', cmds: blogNavCmds },
                  { key: 'site', label: 'Site', cmds: siteNavCmds },
                ] as const
              ).map(({ key, label, cmds }) =>
                cmds.length > 0 ? (
                  <div key={key} role="group">
                    <button
                      onClick={() => toggleSection(key)}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-1.5 rounded-md',
                        'text-xs font-semibold text-muted-foreground uppercase tracking-wide',
                        'hover:text-foreground hover:bg-accent/30 transition-colors cursor-pointer'
                      )}
                    >
                      <span>{label}</span>
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 transition-transform duration-150',
                          collapsedSections.has(key) ? '-rotate-90' : 'rotate-0'
                        )}
                      />
                    </button>
                    {!collapsedSections.has(key) &&
                      cmds.map((cmd) => {
                        const Icon = cmd.icon;
                        return (
                          <Command.Item
                            key={cmd.id}
                            onSelect={cmd.onSelect}
                            className={cn(
                              'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                              'aria-selected:bg-accent aria-selected:text-accent-foreground',
                              'hover:bg-accent/50 transition-colors'
                            )}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{cmd.label}</span>
                          </Command.Item>
                        );
                      })}
                  </div>
                ) : null
              )}

            {/* Search Results - Blog Posts */}
            {hasSearchQuery && searchResults.length > 0 && (
              <Command.Group heading={`Posts (${searchResults.length})`}>
                {searchResults.map((post) => (
                  <Command.Item
                    key={post.id}
                    onSelect={() => {
                      saveSearch(search);
                      router.push(post.url);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-3',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{post.title}</h4>
                      <span className="text-xs text-primary/60 dark:text-muted-foreground whitespace-nowrap">
                        {post.readingTime} min
                      </span>
                    </div>
                    <p className="text-sm text-primary/70 dark:text-muted-foreground line-clamp-1">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-primary/60 dark:text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-primary/60 dark:text-muted-foreground" />
                          <span className="text-xs text-primary/60 dark:text-muted-foreground">
                            {post.tags.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Projects */}
            {hasSearchQuery && projectResults.length > 0 && (
              <Command.Group heading={`Projects (${projectResults.length})`}>
                {projectResults.map((project) => (
                  <Command.Item
                    key={project.slug}
                    onSelect={() => {
                      saveSearch(search);
                      router.push(project.url);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-3',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{project.title}</h4>
                      <span className="text-xs text-primary/60 dark:text-muted-foreground whitespace-nowrap capitalize">
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-primary/70 dark:text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-primary/60 dark:text-muted-foreground" />
                        <span className="text-xs text-primary/60 dark:text-muted-foreground capitalize">
                          {project.category}
                        </span>
                      </div>
                      {project.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-primary/60 dark:text-muted-foreground" />
                          <span className="text-xs text-primary/60 dark:text-muted-foreground">
                            {project.tags.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Navigation search results (query mode — flat, all sections combined) */}
            {hasSearchQuery && filteredNavCommands.length > 0 && (
              <Command.Group heading="Navigate">
                {filteredNavCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={cmd.onSelect}
                      className={cn(
                        'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                        'aria-selected:bg-accent aria-selected:text-accent-foreground',
                        'hover:bg-accent/50 transition-colors'
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{cmd.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Action Commands - Only show when searching */}
            {hasSearchQuery && filteredActionCommands.length > 0 && (
              <Command.Group heading="Appearance">
                {filteredActionCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={cmd.onSelect}
                      className={cn(
                        'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                        'aria-selected:bg-accent aria-selected:text-accent-foreground',
                        'hover:bg-accent/50 transition-colors'
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{cmd.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* No Results */}
            {hasSearchQuery && !hasResults && searchIndex && (
              <Command.Empty>
                <div className={cn('text-center', SPACING.content)}>
                  <p className="text-sm text-muted-foreground mb-2">
                    No results found for &quot;{search}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try different keywords or browse{' '}
                    <button
                      onClick={() => {
                        onOpenChange(false);
                        router.push('/blog');
                      }}
                      className="text-primary hover:underline"
                    >
                      all posts
                    </button>
                  </p>
                </div>
              </Command.Empty>
            )}
          </Command.List>

          {/* Footer Hints */}
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-xs text-muted-foreground bg-muted/30">
            <span>Navigate with ↑↓ arrows</span>
            <span className="hidden sm:inline">Press Enter to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
