'use client';

import { useState } from 'react';
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LinkedInStats, 
  LinkedInDrafts, 
  LinkedInPosting, 
  LinkedInTimeline, 
  LinkedInTokenStatus 
} from '@/components/admin';
import { BarChart, FileText, Send, Clock, Settings } from 'lucide-react';

/**
 * LinkedIn Social Media Management Dashboard
 * 
 * Main component that orchestrates LinkedIn management functionality:
 * - Analytics and engagement statistics
 * - Draft post creation and management
 * - Remote posting capabilities  
 * - Timeline view of published content
 * - Token status and authentication management
 */
export function LinkedInManager() {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`} style={{ display: 'flex', flexDirection: 'column', gap: SPACING.subsection }}>
      {/* Header */}
      <div className="text-center">
        <h1 className={TYPOGRAPHY.h1.standard}>LinkedIn Management</h1>
        <p className={`mt-2 text-muted-foreground max-w-2xl mx-auto`}>
          Comprehensive LinkedIn social media management dashboard for analytics, content creation, and posting automation.
        </p>
      </div>

      {/* Authentication Status */}
      <LinkedInTokenStatus />

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Drafts</span>
          </TabsTrigger>
          <TabsTrigger value="posting" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Posting</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
          <LinkedInStats />
        </TabsContent>

        <TabsContent value="drafts" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
          <LinkedInDrafts />
        </TabsContent>

        <TabsContent value="posting" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
          <LinkedInPosting />
        </TabsContent>

        <TabsContent value="timeline" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.subsection }}>
          <LinkedInTimeline />
        </TabsContent>

        <TabsContent value="settings" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.subsection }}>
          <div className="text-center py-12">
            <h3 className={TYPOGRAPHY.h3.standard}>Settings & Configuration</h3>
            <p className="text-muted-foreground mt-2">
              LinkedIn authentication and API settings are managed through environment variables.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Check your .env.local file for LINKEDIN_* configuration options.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}