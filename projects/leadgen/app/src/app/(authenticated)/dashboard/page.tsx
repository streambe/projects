"use client";

import Link from "next/link";
import { Users, TrendingUp, Target, Percent, Flame, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/use-dashboard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCORE_LABEL_COLORS: Record<string, string> = {
  COLD: "bg-gray-400",
  WARM: "bg-amber-400",
  MQL: "bg-orange-500",
  SQL: "bg-red-500",
};

const SCORE_BADGE_VARIANT: Record<string, string> = {
  COLD: "secondary",
  WARM: "outline",
  MQL: "default",
  SQL: "destructive",
};

const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  CONNECTED: "bg-cyan-500",
  ENGAGED: "bg-teal-500",
  MQL: "bg-orange-500",
  SQL: "bg-red-500",
  MEETING_SCHEDULED: "bg-purple-500",
  PROPOSAL_SENT: "bg-indigo-500",
  NEGOTIATION: "bg-pink-500",
  WON: "bg-green-500",
  LOST: "bg-gray-400",
};

const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: "Note",
  LINKEDIN_VIEW: "LinkedIn View",
  LINKEDIN_CONNECT: "LinkedIn Connect",
  LINKEDIN_MESSAGE: "LinkedIn Message",
  LINKEDIN_INMAIL: "LinkedIn InMail",
  EMAIL_SENT: "Email Sent",
  EMAIL_RECEIVED: "Email Received",
  CALL: "Call",
  MEETING: "Meeting",
  STAGE_CHANGE: "Stage Change",
  SCORE_CHANGE: "Score Change",
};

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-12 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-destructive mt-4">Failed to load dashboard data.</p>
      </div>
    );
  }

  const maxStageCount = Math.max(...Object.values(data.byStage), 1);
  const maxScoreCount = Math.max(...Object.values(data.byScore), 1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Row 1 — KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Leads" value={data.totalLeads} />
        <KpiCard icon={TrendingUp} label="New This Week" value={data.newThisWeek} />
        <KpiCard icon={Target} label="MQL+" value={data.mqls} />
        <KpiCard icon={Percent} label="Conversion Rate" value={`${data.conversionRate}%`} />
      </div>

      {/* Row 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.byStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-32 text-sm text-muted-foreground truncate">
                  {stage.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STAGE_COLORS[stage] ?? "bg-blue-500"}`}
                    style={{ width: `${(count / maxStageCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-right font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(data.byStage).length === 0 && (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Score distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(["COLD", "WARM", "MQL", "SQL"] as const).map((label) => {
              const count = data.byScore[label] ?? 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">{label}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SCORE_LABEL_COLORS[label]}`}
                      style={{ width: `${(count / maxScoreCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-right font-medium">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Today&apos;s Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.todayActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No actions scheduled for today.</p>
            ) : (
              <ul className="space-y-2">
                {data.todayActions.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/leads/${a.leadId}`}
                      className="font-medium hover:underline"
                    >
                      {a.leadName}
                    </Link>
                    <span className="text-muted-foreground">
                      {a.sequenceName} &middot; Step {a.step + 1}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Hot leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" /> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.hotLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads scored yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.hotLeads.map((l) => (
                  <li key={l.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/leads/${l.id}`}
                        className="font-medium hover:underline"
                      >
                        {l.name}
                      </Link>
                      {l.company && (
                        <span className="text-muted-foreground text-xs">@ {l.company}</span>
                      )}
                    </div>
                    <Badge variant={SCORE_BADGE_VARIANT[l.label] as "default" | "secondary" | "outline" | "destructive"}>
                      {l.score} &middot; {l.label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{a.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {ACTIVITY_LABELS[a.type] ?? a.type}
                    </span>{" "}
                    <span className="text-muted-foreground">for</span>{" "}
                    <span className="font-medium">{a.leadName}</span>
                    {a.subject && (
                      <span className="text-muted-foreground"> &mdash; {a.subject}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelative(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
