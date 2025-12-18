'use client';

import { useState } from 'react';
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS, CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LinkedInStats, 
  LinkedInDrafts, 
  LinkedInPosting, 
  LinkedInTimeline, 
  LinkedInTokenStatus 
} from '@/components/admin';
import { BarChart, FileText, Send, Clock, Settings, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

/**
 * Social Media Management Dashboard
 * 
 * Main component that orchestrates social media management functionality across platforms:
 * - Analytics and engagement statistics
 * - Draft post creation and management
 * - Remote posting capabilities  
 * - Timeline view of published content
 * - Platform-specific settings and authentication
 * 
 * Currently supports LinkedIn with framework for future platform expansion.
 */
export function SocialManager() {
  const [activeTab, setActiveTab] = useState('stats');
  const [activePlatform, setActivePlatform] = useState('linkedin');

  const platforms = [
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      status: 'active',
      color: 'text-primary' // Uses design system primary color
    },
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: Twitter, 
      status: 'coming-soon',
      color: 'text-muted-foreground' // Uses design system muted text
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      status: 'coming-soon',
      color: 'text-muted-foreground' // Uses design system muted text
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      status: 'coming-soon',
      color: 'text-muted-foreground' // Uses design system muted text
    }
  ];

  const activePlatformData = platforms.find(p => p.id === activePlatform);

  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.dashboard} ${CONTAINER_PADDING} ${CONTAINER_VERTICAL_PADDING} flex flex-col gap-10`}>
      {/* Header */}
      <div className="text-center">
        <h1 className={TYPOGRAPHY.h1.standard}>Social Media Management</h1>
        <p className={`${TYPOGRAPHY.description} max-w-2xl mx-auto mt-4`}>
          Comprehensive social media management dashboard for analytics, content creation, and posting automation across multiple platforms.
        </p>
      </div>

      {/* Platform Selection */}
      <Card className="p-8">
        <h2 className={`${TYPOGRAPHY.h3.standard} mb-4`}>Select Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isActive = platform.id === activePlatform;
            const isComingSoon = platform.status === 'coming-soon';
            
            return (
              <button
                key={platform.id}
                onClick={() => !isComingSoon && setActivePlatform(platform.id)}
                disabled={isComingSoon}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 
                  ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  ${isComingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-muted">
                    <Icon className={`h-6 w-6 ${platform.color}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-sm">{platform.name}</h3>
                    {isComingSoon && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Coming Soon
                      </Badge>
                    )}
                    {isActive && platform.status === 'active' && (
                      <Badge variant="default" className="text-xs mt-1">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Platform-specific content - currently only LinkedIn */}
      {activePlatform === 'linkedin' && (
        <>
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

            <TabsContent value="stats" className={SPACING.content}>
              <LinkedInStats />
            </TabsContent>

            <TabsContent value="drafts" className={SPACING.content}>
              <LinkedInDrafts />
            </TabsContent>

            <TabsContent value="posting" className={SPACING.content}>
              <LinkedInPosting />
            </TabsContent>

            <TabsContent value="timeline" className={SPACING.subsection}>
              <LinkedInTimeline />
            </TabsContent>

            <TabsContent value="settings" className={SPACING.subsection}>
              <SocialSettingsTab platform={activePlatformData} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Coming Soon message for other platforms */}
      {activePlatform !== 'linkedin' && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              {activePlatformData?.icon && (
                <activePlatformData.icon className={`h-8 w-8 ${activePlatformData.color}`} />
              )}
            </div>
            <div>
              <h3 className={TYPOGRAPHY.h3.standard}>{activePlatformData?.name} Integration</h3>
              <p className="text-muted-foreground mt-2">
                {activePlatformData?.name} integration is coming soon. Currently, we support LinkedIn with plans to expand to additional platforms.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Settings Tab Component for Social Media Platform Configuration
 */
function SocialSettingsTab({ platform }: { platform: any }) {
  const handleReauthProfile = () => {
    // Navigate to LinkedIn profile OAuth flow
    const authUrl = '/api/auth/linkedin/authorize';
    console.log('🔐 Opening LinkedIn OpenID authentication...');
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  const handleReauthPosting = () => {
    // Navigate to LinkedIn posting OAuth flow  
    const authUrl = '/api/auth/linkedin/posting/authorize';
    console.log('📝 Opening LinkedIn posting authentication...');
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  const handleTestConnection = async () => {
    try {
      console.log('🔍 Testing LinkedIn connection...');
      const response = await fetch('/api/linkedin/test-connection');
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Connection test successful!');
        console.log('✅ LinkedIn connection test passed:', result);
      } else {
        alert(`❌ Connection test failed: ${result.error}`);
        console.error('❌ LinkedIn connection test failed:', result);
      }
    } catch (error) {
      const errorMessage = 'Connection test failed: Network error';
      alert(`❌ ${errorMessage}`);
      console.error('❌ LinkedIn connection test error:', error);
    }
  };

  return (
    <Card className="p-8">
      <div className={SPACING.content}>
        <div className="text-center">
          <h3 className={`${TYPOGRAPHY.h3.standard} flex items-center justify-center gap-2`}>
            {platform?.icon && <platform.icon className="h-5 w-5" />}
            {platform?.name} Settings & Configuration
          </h3>
          <p className="text-muted-foreground mt-2">
            Manage authentication, API settings, and preferences for {platform?.name}.
          </p>
        </div>

        <div className={SPACING.subsection}>
          <div>
            <h4 className={TYPOGRAPHY.label.standard}>Authentication Management</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {platform?.id === 'linkedin' 
                ? "LinkedIn authentication uses OAuth 2.0 with separate tokens for profile access and posting capabilities."
                : "Authentication setup will be available when this platform integration is complete."
              }
            </p>
            
            {platform?.id === 'linkedin' && (
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleReauthProfile}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Re-authenticate Profile Access
                </button>
                <button 
                  onClick={handleReauthPosting}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Re-authenticate Posting Access
                </button>
                <button 
                  onClick={handleTestConnection}
                  className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Test Connection
                </button>
              </div>
            )}
          </div>

          <div>
            <h4 className={TYPOGRAPHY.label.standard}>API Configuration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              API settings are managed through environment variables for security.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-mono">
                {platform?.id === 'linkedin' 
                  ? "Check your .env.local file for LINKEDIN_* configuration options."
                  : `Check your .env.local file for ${platform?.name.toUpperCase()}_* configuration options when available.`
                }
              </p>
            </div>
          </div>

          <div>
            <h4 className={TYPOGRAPHY.label.standard}>Platform Status</h4>
            <div className="flex items-center gap-3">
              <Badge className={platform?.status === 'active' 
                ? SEMANTIC_COLORS.status.success 
                : SEMANTIC_COLORS.status.warning
              }>
                {platform?.status === 'active' 
                  ? `${platform?.name} integration is active and ready to use`
                  : `${platform?.name} integration is in development`
                }
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}