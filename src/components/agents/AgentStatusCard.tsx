import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentType, AgentStats, ProviderHealth } from "@/lib/agents";
import { CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react";

interface AgentStatusCardProps {
  agent: AgentType;
  stats: AgentStats;
  health?: ProviderHealth;
}

const agentConfig: Record<
  AgentType,
  { name: string; color: string; description: string }
> = {
  claude: {
    name: "Claude Code",
    color: "bg-blue-500",
    description: "Primary (200K context)",
  },
  copilot: {
    name: "GitHub Copilot",
    color: "bg-green-500",
    description: "Secondary (real-time)",
  },
  groq: {
    name: "Groq (Free)",
    color: "bg-purple-500",
    description: "Fallback (cost-effective)",
  },
  ollama: {
    name: "Ollama (Local)",
    color: "bg-orange-500",
    description: "Offline capable",
  },
};

export function AgentStatusCard({
  agent,
  stats,
  health,
}: AgentStatusCardProps) {
  const config = agentConfig[agent];
  const usagePercent =
    stats.totalSessions > 0
      ? (stats.totalSessions /
          Object.values(stats).reduce(
            (sum: number, s: any) =>
              sum +
              (typeof s === "object" && "totalSessions" in s
                ? s.totalSessions
                : 0),
            0
          )) *
          100 || 0
      : 0;

  const isAvailable = health?.available ?? true;
  const successRate =
    stats.totalSessions > 0
      ? (stats.outcomes.success / stats.totalSessions) * 100
      : 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Color indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{config.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          {isAvailable ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Usage Badge */}
        <div>
          <Badge variant={usagePercent > 0 ? "default" : "secondary"}>
            {usagePercent.toFixed(0)}% usage
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Sessions
            </div>
            <div className="font-semibold">{stats.totalSessions}</div>
          </div>

          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Success
            </div>
            <div className="font-semibold">{successRate.toFixed(0)}%</div>
          </div>

          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Cost
            </div>
            <div className="font-semibold">
              ${stats.cost.totalCost.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Quality</div>
            <div className="font-semibold">
              {(stats.quality.averageTokenCompliance * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Health Info */}
        {health && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            {isAvailable ? (
              <span>
                Response:{" "}
                {health.responseTime ? `${health.responseTime}ms` : "N/A"}
              </span>
            ) : (
              <span className="text-red-500">
                {health.error || "Unavailable"}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
