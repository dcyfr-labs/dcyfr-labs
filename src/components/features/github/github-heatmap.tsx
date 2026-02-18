"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import CalendarHeatmap from "react-calendar-heatmap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ExternalLink,
  Flame,
  TrendingUp,
  Calendar,
  Target,
  FolderGit2,
  Star,
  GitFork,
} from "lucide-react";
import { GitHubHeatmapSkeleton } from "@/components/common";
import { sanitizeUrl, cn } from "@/lib/utils";
import { TYPOGRAPHY, SEMANTIC_COLORS, SPACING } from "@/lib/design-tokens";
import "react-calendar-heatmap/dist/styles.css";

/**
 * Represents a single day's contribution data from GitHub API
 * @typedef {Object} ContributionDay
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} count - Number of contributions on this date
 */
interface ContributionDay {
  date: string;
  count: number;
}

/**
 * Represents a pinned repository
 * @typedef {Object} PinnedRepository
 * @property {string} name - Repository name
 * @property {string | null} description - Repository description
 * @property {string} url - Repository URL
 * @property {number} stargazerCount - Number of stars
 * @property {number} forkCount - Number of forks
 * @property {Object | null} primaryLanguage - Primary programming language
 * @property {string} primaryLanguage.name - Language name
 * @property {string} primaryLanguage.color - Language color hex code
 */
interface PinnedRepository {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

/**
 * API response structure for GitHub contributions data
 * @typedef {Object} ContributionResponse
 * @property {ContributionDay[]} contributions - Array of contribution data for the past year
 * @property {number} [totalContributions] - Total contributions in the time period
 * @property {number} [totalRepositories] - Total public repositories
 * @property {PinnedRepository[]} [pinnedRepositories] - Pinned repositories
 * @property {string} [warning] - Optional warning message (e.g., "Using cached data")
 * @property {string} [source] - Data source indicator ("server-cache", "api", "fallback")
 */
interface ContributionResponse {
  contributions: ContributionDay[];
  totalContributions?: number;
  totalRepositories?: number;
  pinnedRepositories?: PinnedRepository[];
  warning?: string;
  source?: string;
}

/**
 * Props for the GitHubHeatmap component
 * @typedef {Object} GitHubHeatmapProps
 * @property {string} [username="dcyfr"] - GitHub username to fetch contributions for
 */
interface GitHubHeatmapProps {
  username?: string;
}

const DEFAULT_GITHUB_USERNAME = "dcyfr";

/**
 * Calculate streak statistics from contribution data
 */
interface CurrentStreakState {
  count: number;
  lastDate: Date | null;
  ended: boolean;
}

/** Advance the current-streak counter for one contribution day */
function advanceCurrentStreak(
  state: CurrentStreakState,
  contribDate: Date,
  isFirst: boolean,
  today: Date,
  yesterday: Date
): void {
  if (state.ended) return;

  if (isFirst && (contribDate.getTime() === today.getTime() || contribDate.getTime() === yesterday.getTime())) {
    state.count++;
    state.lastDate = contribDate;
    return;
  }

  if (state.count > 0 && state.lastDate) {
    const dayDiff = Math.floor(
      (state.lastDate.getTime() - contribDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayDiff === 1) {
      state.count++;
      state.lastDate = contribDate;
    } else {
      state.ended = true;
    }
  }
}

function calculateStreaks(contributions: ContributionDay[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (contributions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort by date descending (most recent first)
  const sorted = [...contributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const streak: CurrentStreakState = { count: 0, lastDate: null, ended: false };
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < sorted.length; i++) {
    const contribDate = new Date(sorted[i].date);
    contribDate.setHours(0, 0, 0, 0);

    if (sorted[i].count > 0) {
      advanceCurrentStreak(streak, contribDate, i === 0, today, yesterday);
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak: streak.count, longestStreak: Math.max(longestStreak, streak.count) };
}

/**
 * Calculate activity statistics
 */
function calculateActivityStats(contributions: ContributionDay[]): {
  busiestDay: { date: string; count: number } | null;
  averagePerDay: number;
  totalDaysActive: number;
} {
  if (contributions.length === 0) {
    return { busiestDay: null, averagePerDay: 0, totalDaysActive: 0 };
  }

  const busiestDay = contributions.reduce(
    (max, day) => (day.count > (max?.count || 0) ? day : max),
    contributions[0]
  );

  const totalContributions = contributions.reduce(
    (sum, day) => sum + day.count,
    0
  );
  const averagePerDay = totalContributions / contributions.length;
  const totalDaysActive = contributions.filter((day) => day.count > 0).length;

  return {
    busiestDay: busiestDay.count > 0 ? busiestDay : null,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    totalDaysActive,
  };
}

/**
 * Format date for tooltip display
 */
function formatTooltipDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * GitHubHeatmap Component
 *
 * Displays a GitHub contribution activity heatmap for the past year.
 * Fetches data from the `/api/github-contributions` endpoint which handles:
 * - Server-side caching (1-hour cache with 1-minute fallback)
 * - Rate limiting (10 requests/minute per IP)
 * - Graceful fallback with sample data if GitHub API is unavailable
 *
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating this component's structure, also update:
 * - src/components/github-heatmap-skeleton.tsx
 *
 * Key structural elements that must match:
 * - Card: p-6 padding
 * - Header section: flex justify-between with title + username link
 * - Statistics Grid: grid-cols-2 md:grid-cols-4, gap-3
 *   - 4 stat cards: bg-muted/50, rounded-lg, p-3, border
 *   - Each card: icon + label + value + unit
 * - Heatmap section: overflow-x-auto with inline-flex
 *   - 53 weeks × 7 days grid structure
 * - Footer: flex justify-between with contributions summary + date range
 *
 * @component
 * @param {GitHubHeatmapProps} props - Component props
 * @param {string} [props.username="dcyfr"] - GitHub username to fetch contributions for
 *
 * @returns {React.ReactElement} Calendar heatmap visualization with statistics
 *
 * @example
 * // Display default user's contributions
 * <GitHubHeatmap />
 *
 * @example
 * // Display specific user's contributions
 * <GitHubHeatmap username="torvalds" />
 *
 * @note This component is wrapped with `GitHubHeatmapErrorBoundary` in production.
 * If the component throws an error, the error boundary displays a fallback UI.
 *
 * @note Loading state displays a skeleton loader to prevent layout shift (CLS).
 *
 * @performance Uses react-calendar-heatmap for efficient rendering of 365+ cells.
 *
 * @see {@link /docs/components/github-heatmap.md} for detailed documentation
 * @see {@link /docs/components/skeleton-sync-strategy.md} for skeleton sync guidelines
 */
export function GitHubHeatmap({
  username = DEFAULT_GITHUB_USERNAME,
}: GitHubHeatmapProps) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalRepositories, setTotalRepositories] = useState<number>(0);
  const [pinnedRepositories, setPinnedRepositories] = useState<
    PinnedRepository[]
  >([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          `/api/github-contributions?username=${username}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch contributions: ${response.status}`);
        }

        const data: ContributionResponse = await response.json();

        setContributions(data.contributions || []);
        setTotalContributions(
          data.totalContributions || data.contributions?.length || 0
        );
        setTotalRepositories(data.totalRepositories || 0);
        setPinnedRepositories(data.pinnedRepositories || []);
        setWarning(data.warning || null);
        setSource(data.source || null);
      } catch (err) {
        // Throw error to be caught by error boundary
        throw new Error(
          err instanceof Error
            ? err.message
            : "Failed to load GitHub contributions"
        );
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadData();
  }, [username]);

  // Calculate statistics
  const streaks = useMemo(
    () => calculateStreaks(contributions),
    [contributions]
  );
  const activityStats = useMemo(
    () => calculateActivityStats(contributions),
    [contributions]
  );

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  if (loading) {
    return <GitHubHeatmapSkeleton />;
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="p-4">
          <div className={SPACING.content}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className={TYPOGRAPHY.h3.standard}>GitHub Activity</h3>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <span>@{username}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>

            {activityStats.busiestDay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-sm text-muted-foreground flex items-center gap-1.5"
              >
                <Target className="h-4 w-4 shrink-0" />
                <span>
                  Busiest day:{" "}
                  <span className="font-medium text-foreground">
                    {formatTooltipDate(activityStats.busiestDay.date)}
                  </span>{" "}
                  with{" "}
                  <span className="font-medium text-foreground">
                    {activityStats.busiestDay.count} contributions
                  </span>
                </span>
              </motion.div>
            )}

            {/* Heatmap Grid */}
            <div className={SPACING.content}>
              <div className="overflow-x-auto">
                <CalendarHeatmap
                  startDate={startDate}
                  endDate={endDate}
                  values={contributions}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return "color-empty";
                    }
                    if (value.count < 3) {
                      return "color-scale-1";
                    }
                    if (value.count < 6) {
                      return "color-scale-2";
                    }
                    if (value.count < 9) {
                      return "color-scale-3";
                    }
                    return "color-scale-4";
                  }}
                  showWeekdayLabels={false}
                  showMonthLabels={true}
                  monthLabels={[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ]}
                  showOutOfRangeDays={true}
                  gutterSize={4}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2.5 h-2.5 bg-muted rounded-sm border border-border"
                      whileHover={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.75_0_0)] dark:bg-[oklch(0.35_0_0)]"
                      whileHover={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.58_0_0)] dark:bg-[oklch(0.48_0_0)]"
                      whileHover={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.45_0_0)] dark:bg-[oklch(0.60_0_0)]"
                      whileHover={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.32_0_0)] dark:bg-[oklch(0.72_0_0)]"
                      whileHover={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                  </div>
                  <span>More</span>
                </div>

                <div className="flex items-center gap-2">
                  {totalContributions > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {totalContributions.toLocaleString()} contributions
                    </Badge>
                  )}

                  {process.env.NODE_ENV === "development" &&
                    source === "server-cache" && (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        cached
                      </Badge>
                    )}
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {/* Repositories Card */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <FolderGit2
                    className="w-4 h-4 text-semantic-cyan"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Repositories
                  </span>
                </div>
                <div className={TYPOGRAPHY.display.stat}>
                  {totalRepositories}
                </div>
                <div className="text-xs text-muted-foreground">public</div>
              </div>

              {/* Active Days Card */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {/* Icon color for statistics visualization */}
                  <Calendar
                    className="w-4 h-4 text-semantic-blue"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Active Days
                  </span>
                </div>
                <div className={TYPOGRAPHY.display.stat}>
                  {activityStats.totalDaysActive}
                </div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>

              {/* Daily Average Card */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {/* Icon color for statistics visualization */}
                  <TrendingUp
                    className="w-4 h-4 text-semantic-purple"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Daily Average
                  </span>
                </div>
                <div className={TYPOGRAPHY.display.stat}>
                  {activityStats.averagePerDay}
                </div>
                <div className="text-xs text-muted-foreground">
                  contributions
                </div>
              </div>

              {/* Longest Streak Card */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {/* Icon color for statistics visualization */}
                  <TrendingUp
                    className="w-4 h-4 text-success-light"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Longest Streak
                  </span>
                </div>
                <div className={TYPOGRAPHY.display.stat}>
                  {streaks.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>

              {/* Streaks and Stats Cards 
              <div className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line no-restricted-syntax -- Icon accent color */}
              {/* <Flame
                    className="w-4 h-4 text-semantic-orange"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Current Streak
                  </span> 
                </div>
                <div className={TYPOGRAPHY.display.stat}>
                  {streaks.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">days</div>
              </div> */}
            </motion.div>

            {/* Pinned Repositories */}
            {pinnedRepositories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pinnedRepositories.map((repo) => (
                    <motion.a
                      key={repo.name}
                      href={sanitizeUrl(repo.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors group"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <div className={SPACING.compact}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderGit2
                              className="w-4 h-4 text-muted-foreground shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {repo.name}
                            </span>
                          </div>
                          <ExternalLink
                            className="w-3 h-3 text-muted-foreground shrink-0"
                            aria-hidden="true"
                          />
                        </div>

                        {repo.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {repo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {repo.primaryLanguage && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-border"
                                style={{
                                  backgroundColor: repo.primaryLanguage.color,
                                }}
                                aria-hidden="true"
                              />
                              <span>{repo.primaryLanguage.name}</span>
                            </div>
                          )}

                          {repo.stargazerCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" aria-hidden="true" />
                              <span>{repo.stargazerCount}</span>
                            </div>
                          )}

                          {repo.forkCount > 0 && (
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" aria-hidden="true" />
                              <span>{repo.forkCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
