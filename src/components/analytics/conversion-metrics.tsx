/**
 * Conversion Metrics Component
 * 
 * Displays conversion tracking goals and funnels on the analytics dashboard.
 * Shows progress toward monthly targets for consulting leads, LinkedIn connections,
 * blog engagement, and other business objectives.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, DashboardStat } from "@/components/dashboard";
import { Mail, Linkedin, Eye, Github, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConversionMetricsProps {
  /** Average blog post completion rate (%) */
  completionRate?: number;
  /** Average scroll depth (%) */
  avgScrollDepth?: number;
  /** Total posts viewed */
  totalPostsViewed?: number;
}

/**
 * Conversion metrics section showing business objectives and progress
 * 
 * Note: This component displays target metrics from the conversion tracking strategy.
 * Actual data integration with Vercel Analytics custom events will be implemented
 * once CTAs are enabled and events start flowing.
 * 
 * @example
 * ```tsx
 * <ConversionMetrics
 *   completionRate={62}
 *   avgScrollDepth={68}
 *   totalPostsViewed={1234}
 * />
 * ```
 */
export function ConversionMetrics({
  completionRate = 0,
  avgScrollDepth = 0,
  totalPostsViewed = 0,
}: ConversionMetricsProps) {
  // Monthly targets from conversion tracking strategy
  const targets = {
    consultingLeads: { current: 0, target: 5, unit: "leads" },
    linkedInConnections: { current: 0, target: 10, unit: "connections" },
    jobOpportunities: { current: 0, target: 3, unit: "opportunities" },
    blogEngagement: { current: completionRate, target: 60, unit: "%" },
    githubClicks: { current: 0, target: 20, unit: "clicks" },
  };

  // Calculate progress percentages
  const getProgress = (current: number, target: number) => 
    Math.min(Math.round((current / target) * 100), 100);

  // Get status badge
  const getStatusBadge = (current: number, target: number) => {
    const progress = getProgress(current, target);
    if (progress >= 100) return <Badge variant="default" className="bg-green-600">On Track</Badge>;
    if (progress >= 50) return <Badge variant="default" className="bg-yellow-600">In Progress</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Conversion Goals Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Goals
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Monthly targets and progress toward business objectives
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              November 2025
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Conversion Metrics */}
      <DashboardStats columns={3}>
        <DashboardStat
          label="Consulting Leads"
          value={targets.consultingLeads.current}
          secondaryValue={`Target: ${targets.consultingLeads.target}/month`}
          icon={Mail}
          trend="neutral"
        />
        
        <DashboardStat
          label="LinkedIn Connections"
          value={targets.linkedInConnections.current}
          secondaryValue={`Target: ${targets.linkedInConnections.target}/month`}
          icon={Linkedin}
          trend="neutral"
        />
        
        <DashboardStat
          label="Blog Engagement"
          value={`${completionRate}%`}
          secondaryValue={`Target: ${targets.blogEngagement.target}%`}
          icon={Eye}
          trend={completionRate >= targets.blogEngagement.target ? "up" : "neutral"}
        />
      </DashboardStats>

      {/* Conversion Funnels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversion Funnels</CardTitle>
          <CardDescription className="text-xs">
            Track user journeys from awareness to conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Funnel 1: Organic Search → Blog → Contact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Organic Search → Blog → Contact</span>
              {getStatusBadge(targets.consultingLeads.current, targets.consultingLeads.target)}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground pl-4 border-l-2 border-muted">
              <div className="flex justify-between">
                <span>1. Blog Post Views</span>
                <span className="font-medium">{totalPostsViewed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>2. Deep Engagement (50%+ read)</span>
                <span className="font-medium">~{Math.round(totalPostsViewed * (completionRate / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>3. Contact Form Submissions</span>
                <span className="font-medium text-primary">{targets.consultingLeads.current}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-muted">
                <span className="font-medium">Conversion Rate</span>
                <span className="font-medium">
                  {totalPostsViewed > 0 
                    ? `${((targets.consultingLeads.current / totalPostsViewed) * 100).toFixed(2)}%` 
                    : '0%'}
                  <span className="text-muted-foreground ml-1">(Target: 2%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Funnel 2: Social Media → Homepage → LinkedIn */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Social Media → Homepage → LinkedIn</span>
              {getStatusBadge(targets.linkedInConnections.current, targets.linkedInConnections.target)}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground pl-4 border-l-2 border-muted">
              <div className="flex justify-between">
                <span>1. Homepage Visits</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span>2. LinkedIn Profile Clicks</span>
                <span className="font-medium text-primary">{targets.linkedInConnections.current}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-muted">
                <span className="font-medium">Click-Through Rate</span>
                <span className="font-medium">
                  -
                  <span className="text-muted-foreground ml-1">(Target: 15%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Funnel 3: Direct → Projects → GitHub → Contact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Direct → Projects → GitHub → Contact</span>
              {getStatusBadge(targets.githubClicks.current, targets.githubClicks.target)}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground pl-4 border-l-2 border-muted">
              <div className="flex justify-between">
                <span>1. Projects Page Visits</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span>2. GitHub Repository Clicks</span>
                <span className="font-medium">{targets.githubClicks.current}</span>
              </div>
              <div className="flex justify-between">
                <span>3. Return to Contact</span>
                <span className="font-medium text-primary">-</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-muted">
                <span className="font-medium">Return Conversion Rate</span>
                <span className="font-medium">
                  -
                  <span className="text-muted-foreground ml-1">(Target: 5%)</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress Bars */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly Goal Progress</CardTitle>
          <CardDescription className="text-xs">
            Progress toward November 2025 targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consulting Leads */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Consulting Inquiries</span>
              <span className="text-muted-foreground">
                {targets.consultingLeads.current} / {targets.consultingLeads.target}
              </span>
            </div>
            <Progress 
              value={getProgress(targets.consultingLeads.current, targets.consultingLeads.target)} 
              className="h-2"
            />
          </div>

          {/* LinkedIn Connections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">LinkedIn Connections</span>
              <span className="text-muted-foreground">
                {targets.linkedInConnections.current} / {targets.linkedInConnections.target}
              </span>
            </div>
            <Progress 
              value={getProgress(targets.linkedInConnections.current, targets.linkedInConnections.target)} 
              className="h-2"
            />
          </div>

          {/* Job Opportunities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Job/Speaking Opportunities</span>
              <span className="text-muted-foreground">
                {targets.jobOpportunities.current} / {targets.jobOpportunities.target}
              </span>
            </div>
            <Progress 
              value={getProgress(targets.jobOpportunities.current, targets.jobOpportunities.target)} 
              className="h-2"
            />
          </div>

          {/* Blog Engagement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Blog Completion Rate</span>
              <span className="text-muted-foreground">
                {targets.blogEngagement.current}% / {targets.blogEngagement.target}%
              </span>
            </div>
            <Progress 
              value={getProgress(targets.blogEngagement.current, targets.blogEngagement.target)} 
              className="h-2"
            />
          </div>

          {/* GitHub Clicks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">GitHub Repository Clicks</span>
              <span className="text-muted-foreground">
                {targets.githubClicks.current} / {targets.githubClicks.target}
              </span>
            </div>
            <Progress 
              value={getProgress(targets.githubClicks.current, targets.githubClicks.target)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Implementation Note */}
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Conversion Tracking Implementation</p>
              <p className="text-xs text-muted-foreground">
                CTAs and event tracking are implemented but currently hidden. Enable CTAs in blog posts, 
                projects page, and about page to start collecting conversion data. Events will automatically 
                flow to Vercel Analytics and populate these metrics.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Scroll Depth: Active</Badge>
                <Badge variant="outline" className="text-xs">CTAs: Hidden</Badge>
                <Badge variant="outline" className="text-xs">Events: Ready</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
