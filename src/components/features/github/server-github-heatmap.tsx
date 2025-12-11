/**
 * Server GitHub Heatmap Component
 * 
 * Server-side rendered GitHub contribution heatmap that fetches data
 * directly from Redis cache without exposing public API endpoints.
 * This is a secure alternative to the client-side GitHubHeatmap.
 */

import { ExternalLink, GitCommit, Calendar, Zap, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CalendarHeatmap from "react-calendar-heatmap";
import { GitHubHeatmapSkeleton } from "@/components/common";
import { getGitHubContributions, type ContributionResponse } from "@/lib/github-data";
import { TYPOGRAPHY } from "@/lib/design-tokens";

// Import styles for react-calendar-heatmap
import "react-calendar-heatmap/dist/styles.css";

// ============================================================================
// TYPES
// ============================================================================

interface ServerGitHubHeatmapProps {
  username?: string;
  showWarning?: boolean;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

interface ActivityStats {
  busiestDay: { date: string; count: number } | null;
  averagePerDay: number;
  totalDaysActive: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate streak statistics from contribution data
 */
function calculateStreaks(contributions: ContributionResponse['contributions']): StreakStats {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Sort contributions by date (newest first)
  const sortedContributions = [...contributions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate current streak (from today backwards)
  for (const contrib of sortedContributions) {
    if (contrib.count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const contrib of contributions) {
    if (contrib.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return { currentStreak, longestStreak };
}

/**
 * Calculate activity statistics
 */
function calculateActivityStats(contributions: ContributionResponse['contributions']): ActivityStats {
  const activeDays = contributions.filter(day => day.count > 0);
  const totalDaysActive = activeDays.length;
  const averagePerDay = contributions.reduce((sum, day) => sum + day.count, 0) / 365;
  
  const busiestDay = contributions.reduce((max, day) => 
    day.count > (max?.count || 0) ? day : max, 
    null as { date: string; count: number } | null
  );
  
  return {
    busiestDay,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    totalDaysActive
  };
}

/**
 * Format date for tooltip display
 */
function formatTooltipDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Server-rendered GitHub contribution heatmap
 * 
 * Fetches data from Redis cache during server-side rendering,
 * eliminating the need for public API endpoints.
 */
export async function ServerGitHubHeatmap({ 
  username = "dcyfr",
  showWarning = true 
}: ServerGitHubHeatmapProps) {
  try {
    // Fetch data server-side from Redis cache
    const data = await getGitHubContributions(username);
    
    // Calculate statistics
    const streaks = calculateStreaks(data.contributions);
    const activityStats = calculateActivityStats(data.contributions);
    
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {/* Header */}
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
          
          {/* Warning Banner */}
          {showWarning && data.warning && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ {data.warning}
              </p>
            </div>
          )}
          
          {/* Heatmap */}
          <div className="w-full overflow-x-auto">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={data.contributions}
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
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
              ]}
              showOutOfRangeDays={true}
              gutterSize={4}
            />
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-900"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-800"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-700"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-600"></div>
            </div>
            <span>More</span>
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-muted/50 rounded-lg p-3 border">
              <GitCommit className="w-4 h-4 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="font-semibold">{data.totalContributions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">contributions</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 border">
              <Calendar className="w-4 h-4 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              <div className="text-xs text-muted-foreground mb-1">Active</div>
              <div className="font-semibold">{activityStats.totalDaysActive}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 border">
              <Zap className="w-4 h-4 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              <div className="text-xs text-muted-foreground mb-1">Current</div>
              <div className="font-semibold">{streaks.currentStreak}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 border">
              <TrendingUp className="w-4 h-4 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              <div className="text-xs text-muted-foreground mb-1">Best</div>
              <div className="font-semibold">{activityStats.busiestDay?.count || 0}</div>
              <div className="text-xs text-muted-foreground">in one day</div>
            </div>
          </div>
          
          {/* Footer Badges */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {data.totalContributions.toLocaleString()} contributions in the last year
              </Badge>
              {process.env.NODE_ENV === 'development' && (
                <Badge variant="outline" className="text-xs">
                  Cache: {data.source}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
    
  } catch (error) {
    console.error('[ServerGitHubHeatmap] Failed to load data:', error);
    
    // Return skeleton on error to prevent page crashes
    return <GitHubHeatmapSkeleton />;
  }
}