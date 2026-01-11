import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VercelAnalytics } from "@/types/analytics";

interface VercelInsightsProps {
  vercel?: VercelAnalytics | null | undefined;
  lastSynced?: string | null;
}

export function VercelInsights({ vercel, lastSynced }: VercelInsightsProps) {
  if (!vercel) return null;

  const topPages = vercel.topPages || [];
  const topReferrers = vercel.topReferrers || [];
  const topDevices = vercel.topDevices || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                className={cn(
                  TYPOGRAPHY.label.standard,
                  "flex items-center gap-2"
                )}
              >
                Vercel Insights
              </CardTitle>
              <CardDescription className="text-xs">
                Top traffic by pages, referrers, and devices
              </CardDescription>
            </div>
            {lastSynced && (
              <Badge variant="outline" className="text-xs">
                Last: {new Date(lastSynced).toLocaleString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div>
            <h3 className={TYPOGRAPHY.label.small}>Top Pages</h3>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              {topPages.slice(0, 5).map((p) => (
                <li key={p.path} className="flex items-center justify-between">
                  <Link
                    href={p.url || p.path}
                    className="hover:underline break-words pr-2"
                  >
                    {p.path}
                  </Link>
                  <span className={cn("ml-2", TYPOGRAPHY.label.small)}>
                    {p.views}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={TYPOGRAPHY.label.small}>Top Referrers</h3>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              {topReferrers.slice(0, 5).map((r) => (
                <li
                  key={r.referrer}
                  className="flex items-center justify-between"
                >
                  <span className="break-words pr-2">{r.referrer}</span>
                  <span className={cn("ml-2", TYPOGRAPHY.label.small)}>
                    {r.views}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={TYPOGRAPHY.label.small}>Top Devices</h3>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              {topDevices.slice(0, 5).map((d) => (
                <li
                  key={d.device}
                  className="flex items-center justify-between"
                >
                  <span className="break-words pr-2">{d.device}</span>
                  <span className={cn("ml-2", TYPOGRAPHY.label.small)}>
                    {d.views}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VercelInsights;
