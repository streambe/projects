"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  ExternalLink,
  Building2,
  User,
  Clock,
  Send,
  MessageSquare,
  Activity as ActivityIcon,
  Target,
  TrendingUp,
} from "lucide-react";
import { useLead, useUpdateLead, useActivities, useCreateActivity } from "@/hooks/use-leads";
import { Stage, ActivityType } from "@/types";
import { format } from "date-fns";

function scoreColor(score: number) {
  if (score >= 70) return "bg-red-500/10 text-red-700 border-red-200";
  if (score >= 40) return "bg-orange-500/10 text-orange-700 border-orange-200";
  if (score >= 20) return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
}

const STAGE_OPTIONS: { key: Stage; label: string }[] = [
  { key: Stage.NEW, label: "New" },
  { key: Stage.CONNECTED, label: "Connected" },
  { key: Stage.ENGAGED, label: "Engaged" },
  { key: Stage.MQL, label: "MQL" },
  { key: Stage.SQL, label: "SQL" },
  { key: Stage.MEETING_SCHEDULED, label: "Meeting Scheduled" },
  { key: Stage.PROPOSAL_SENT, label: "Proposal Sent" },
  { key: Stage.NEGOTIATION, label: "Negotiation" },
  { key: Stage.WON, label: "Won" },
  { key: Stage.LOST, label: "Lost" },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  NOTE: <MessageSquare className="h-3.5 w-3.5" />,
  EMAIL_SENT: <Send className="h-3.5 w-3.5" />,
  EMAIL_RECEIVED: <Mail className="h-3.5 w-3.5" />,
  CALL: <Phone className="h-3.5 w-3.5" />,
  MEETING: <User className="h-3.5 w-3.5" />,
  LINKEDIN_VIEW: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_CONNECT: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_MESSAGE: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_INMAIL: <ExternalLink className="h-3.5 w-3.5" />,
  STAGE_CHANGE: <TrendingUp className="h-3.5 w-3.5" />,
  SCORE_CHANGE: <Target className="h-3.5 w-3.5" />,
};

interface LeadDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string | null;
}

export function LeadDetailSheet({ open, onOpenChange, leadId }: LeadDetailSheetProps) {
  const { data: lead, isLoading } = useLead(leadId);
  const { data: activities = [] } = useActivities(leadId);
  const updateLead = useUpdateLead();
  const createActivity = useCreateActivity();
  const [noteText, setNoteText] = useState("");

  const handleStageChange = (newStage: Stage) => {
    if (!leadId) return;
    updateLead.mutate({ id: leadId, stage: newStage } as any);
  };

  const handleAddNote = () => {
    if (!leadId || !noteText.trim()) return;
    createActivity.mutate(
      { leadId, type: ActivityType.NOTE, content: noteText.trim() },
      { onSuccess: () => setNoteText("") }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 flex flex-col overflow-hidden">
        {isLoading || !lead ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-slate-400">
              {leadId ? "Loading..." : "No lead selected"}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="p-5 pb-0">
              <div className="flex items-start justify-between pr-8">
                <div>
                  <SheetTitle className="text-lg">
                    {lead.firstName} {lead.lastName}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {lead.title && <span>{lead.title}</span>}
                    {lead.title && (lead as any).company?.name && <span> at </span>}
                    {(lead as any).company?.name && (
                      <span className="font-medium">{(lead as any).company.name}</span>
                    )}
                  </SheetDescription>
                </div>
                <Badge variant="outline" className={`text-sm font-bold px-2.5 py-1 ${scoreColor(lead.score)}`}>
                  {lead.score}
                </Badge>
              </div>

              {/* Stage selector */}
              <div className="flex gap-1 mt-3 flex-wrap">
                {STAGE_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(s.key)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                      lead.stage === s.key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SheetHeader>

            <Separator className="mt-4" />

            {/* Tabs */}
            <Tabs defaultValue={0} className="flex-1 flex flex-col overflow-hidden">
              <TabsList variant="line" className="mx-5 mt-2 justify-start gap-2 h-auto p-0 border-b border-slate-100 rounded-none">
                <TabsTrigger value={0} className="px-3 pb-2 text-xs">Info</TabsTrigger>
                <TabsTrigger value={1} className="px-3 pb-2 text-xs">Activity</TabsTrigger>
                <TabsTrigger value={2} className="px-3 pb-2 text-xs">Notes</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value={0} className="flex-1 overflow-y-auto px-5 py-4 mt-0">
                <div className="space-y-4">
                  {/* Contact details */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</h4>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.linkedinUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {(lead as any).company?.name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>{(lead as any).company.name}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Score breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 p-3">
                        <div className="text-xs text-slate-500 mb-1">Demographic</div>
                        <div className="text-xl font-bold text-slate-800">{lead.scoreDemographic ?? 0}</div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${Math.min(100, (lead.scoreDemographic ?? 0))}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <div className="text-xs text-slate-500 mb-1">Behavioral</div>
                        <div className="text-xl font-bold text-slate-800">{lead.scoreBehavioral ?? 0}</div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500 transition-all"
                            style={{ width: `${Math.min(100, (lead.scoreBehavioral ?? 0))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Meta */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Created {format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    {lead.isTarget && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">Target Account</span>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {lead.notes}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value={1} className="flex-1 overflow-y-auto px-5 py-4 mt-0">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                    <ActivityIcon className="h-8 w-8 mb-2 opacity-40" />
                    No activities yet
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <div key={activity.id} className="flex gap-3 relative">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 text-slate-500">
                            {ACTIVITY_ICONS[activity.type] ?? <ActivityIcon className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-medium text-slate-700">
                                {activity.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            {activity.subject && (
                              <p className="text-sm font-medium text-slate-700 mt-0.5">{activity.subject}</p>
                            )}
                            {activity.content && (
                              <p className="text-sm text-slate-600 mt-0.5">{activity.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value={2} className="flex-1 flex flex-col overflow-hidden px-5 py-4 mt-0">
                <div className="flex gap-2 mb-4">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || createActivity.isPending}
                  className="self-end mb-4 bg-blue-600 hover:bg-blue-700"
                >
                  Add Note
                </Button>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {activities
                    .filter((a: any) => a.type === "NOTE")
                    .map((note: any) => (
                      <div key={note.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                        <p className="text-sm text-slate-700">{note.content}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    ))}
                  {activities.filter((a: any) => a.type === "NOTE").length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 text-sm">
                      No notes yet
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
