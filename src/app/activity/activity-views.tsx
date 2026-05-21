'use client';

import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { ActivityHeatmapCalendar } from '@/components/activity/ActivityHeatmapCalendar';
import type { ActivityItem } from '@/lib/activity';
import { ActivityPageClient, type SerializedActivity } from './activity-client';

interface ActivityViewsProps {
  activities: SerializedActivity[];
}

export function ActivityViews({ activities }: ActivityViewsProps) {
  const deserializedActivities = useMemo<ActivityItem[]>(
    () => activities.map((activity) => ({ ...activity, timestamp: new Date(activity.timestamp) })),
    [activities]
  );

  return (
    <Tabs defaultValue="timeline">
      <div
        className={cn(
          CONTAINER_WIDTHS.standard,
          'mx-auto',
          CONTAINER_PADDING,
          'flex justify-center pt-8'
        )}
      >
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="timeline">
        <ActivityPageClient activities={activities} />
      </TabsContent>

      <TabsContent value="heatmap">
        <div className={cn(CONTAINER_WIDTHS.standard, 'mx-auto', CONTAINER_PADDING, 'py-12')}>
          <ActivityHeatmapCalendar activities={deserializedActivities} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
