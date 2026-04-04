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
  COLD: "bg-[#F5F7FF]",
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
  NEW: "bg-[#999999]",
  CONNECTED: "bg-sky-500",
  ENGAGED: "bg-[#3957ED]",
  MQL: "bg-orange-500",
  SQL: "bg-red-500",
  MEETING_SCHEDULED: "bg-violet-500",
  PROPOSAL_SENT: "bg-indigo-500",
  NEGOTIATION: "bg-amber-500",
  WON: "bg-[#25D366]",
  LOST: "bg-[#999999]",
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
        <h1 className="text-lg font-bold tracking-tight text-[#141414]">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <CardContent className="p-6"><div className="h-12 bg-[#F5F7FF] rounded-xl animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-bold tracking-tight text-[#141414]">Dashboard</h1>
        <p className="text-red-500 mt-4 text-sm">Failed to load dashboard data.</p>
      </div>
    );
  }

  const maxStageCount = Math.max(...Object.values(data.byStage), 1);
  const maxScoreCount = Math.max(...Object.values(data.byScore), 1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold tracking-tight text-[#141414]">Dashboard</h1>

      {/* Row 1 -- KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Leads" value={data.totalLeads} />
        <KpiCard icon={TrendingUp} label="New This Week" value={data.newThisWeek} />
        <KpiCard icon={Target} label="MQL+" value={data.mqls} />
        <KpiCard icon={Percent} label="Conversion Rate" value={`${data.conversionRate}%`} />
      </div>

      {/* Row 2 -- Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage distribution */}
        <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-bold text-[#141414]">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {Object.entries(data.byStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-28 text-xs text-[#666666] truncate">
                  {stage.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-2 bg-[#F5F7FF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STAGE_COLORS[stage] ?? "bg-[#3957ED]"}`}
                    style={{ width: `${(count / maxStageCount) * 100}%` }}
                  />
                </div>
                <span className="w-7 text-xs text-right font-semibold text-[#141414]">{count}</span>
              </div>
            ))}
            {Object.keys(data.byStage).length === 0 && (
              <p className="text-xs text-[#999999]">No leads yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Score distribution */}
        <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-bold text-[#141414]">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {(["COLD", "WARM", "MQL", "SQL"] as const).map((label) => {
              const count = data.byScore[label] ?? 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-[#666666]">{label}</span>
                  <div className="flex-1 h-2 bg-[#F5F7FF] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${SCORE_LABEL_COLORS[label]}`}
                      style={{ width: `${(count / maxScoreCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-7 text-xs text-right font-semibold text-[#141414]">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 -- Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today actions */}
        <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-bold text-[#141414] flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F7FF]">
                <Clock className="h-3.5 w-3.5 text-[#3957ED]" />
              </div>
              Today&apos;s Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {data.todayActions.length === 0 ? (
              <p className="text-xs text-[#999999]">No actions scheduled for today.</p>
            ) : (
              <ul className="space-y-2">
                {data.todayActions.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/leads/${a.leadId}`}
                      className="font-semibold text-[#141414] hover:text-[#3957ED] transition-colors duration-200"
                    >
                      {a.leadName}
                    </Link>
                    <span className="text-xs text-[#999999]">
                      {a.sequenceName} &middot; Step {a.step + 1}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Hot leads */}
        <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-bold text-[#141414] flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                <Flame className="h-3.5 w-3.5 text-red-500" />
              </div>
              Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {data.hotLeads.length === 0 ? (
              <p className="text-xs text-[#999999]">No leads scored yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.05)]">
                      <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999999]">Name</th>
                      <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999999]">Company</th>
                      <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[#999999]">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.03)]">
                    {data.hotLeads.map((l) => (
                      <tr key={l.id} className="group">
                        <td className="py-2.5">
                          <Link
                            href={`/leads/${l.id}`}
                            className="font-semibold text-[#141414] group-hover:text-[#3957ED] transition-colors duration-200"
                          >
                            {l.name}
                          </Link>
                        </td>
                        <td className="py-2.5 text-xs text-[#999999]">{l.company || "--"}</td>
                        <td className="py-2.5 text-right">
                          <Badge variant={SCORE_BADGE_VARIANT[l.label] as "default" | "secondary" | "outline" | "destructive"} className="text-[10px] rounded-full">
                            {l.score} &middot; {l.label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 -- Recent Activity as timeline */}
      <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="text-sm font-bold text-[#141414] flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F7FF]">
              <Activity className="h-3.5 w-3.5 text-[#3957ED]" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-[#999999]">No activity yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E8EBFF]" />
              <ul className="space-y-4">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm relative">
                    <div className="w-[15px] h-[15px] mt-0.5 rounded-full border-2 border-[#3957ED] bg-white shrink-0 z-10" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[#141414]">{a.userName}</span>{" "}
                      <span className="text-[#666666]">
                        {ACTIVITY_LABELS[a.type] ?? a.type}
                      </span>{" "}
                      <span className="text-[#999999]">for</span>{" "}
                      <span className="font-semibold text-[#141414]">{a.leadName}</span>
                      {a.subject && (
                        <span className="text-[#999999]"> &mdash; {a.subject}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#999999] whitespace-nowrap">
                      {formatRelative(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
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
    <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:-translate-y-px">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F7FF]">
          <Icon className="h-4.5 w-4.5 text-[#3957ED]" />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-[#141414]">{value}</p>
          <p className="text-sm text-[#666666] mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
