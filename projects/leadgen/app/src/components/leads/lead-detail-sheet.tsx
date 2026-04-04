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
  return "bg-[#F5F7FF] text-[#666666] border-[#E8EBFF]";
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
            <div className="text-sm text-[#999999]">
              {leadId ? "Loading..." : "No lead selected"}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="p-5 pb-0">
              <div className="flex items-start justify-between pr-8">
                <div>
                  <SheetTitle className="text-lg font-bold text-[#141414]">
                    {lead.firstName} {lead.lastName}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 text-[#666666]">
                    {lead.title && <span>{lead.title}</span>}
                    {lead.title && (lead as any).company?.name && <span> at </span>}
                    {(lead as any).company?.name && (
                      <span className="font-semibold text-[#141414]">{(lead as any).company.name}</span>
                    )}
                  </SheetDescription>
                </div>
                <Badge variant="outline" className={`text-sm font-bold px-2.5 py-1 rounded-full ${scoreColor(lead.score)}`}>
                  {lead.score}
                </Badge>
              </div>

              {/* Stage selector */}
              <div className="flex gap-1 mt-3 flex-wrap">
                {STAGE_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(s.key)}
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-200 ${
                      lead.stage === s.key
                        ? "bg-[#3957ED] text-white border-[#3957ED]"
                        : "bg-white text-[#666666] border-[#E8EBFF] hover:border-[#3957ED] hover:text-[#3957ED]"
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
              <TabsList variant="line" className="mx-5 mt-2 justify-start gap-2 h-auto p-0 border-b border-[rgba(0,0,0,0.05)] rounded-none">
                <TabsTrigger value={0} className="px-3 pb-2 text-xs font-semibold">Info</TabsTrigger>
                <TabsTrigger value={1} className="px-3 pb-2 text-xs font-semibold">Activity</TabsTrigger>
                <TabsTrigger value={2} className="px-3 pb-2 text-xs font-semibold">Notes</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value={0} className="flex-1 overflow-y-auto px-5 py-4 mt-0">
                <div className="space-y-4">
                  {/* Contact details */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Contact</h4>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[#999999]" />
                        <a href={`mailto:${lead.email}`} className="text-[#3957ED] hover:underline">{lead.email}</a>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-[#141414]">
                        <Phone className="h-4 w-4 text-[#999999]" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.linkedinUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-[#999999]" />
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3957ED] hover:underline truncate"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {(lead as any).company?.name && (
                      <div className="flex items-center gap-2 text-sm text-[#141414]">
                        <Building2 className="h-4 w-4 text-[#999999]" />
                        <span>{(lead as any).company.name}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Score breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Score Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[14px] border border-[rgba(0,0,0,0.05)] p-3">
                        <div className="text-xs text-[#666666] mb-1">Demographic</div>
                        <div className="text-xl font-bold text-[#141414]">{lead.scoreDemographic ?? 0}</div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-[#F5F7FF] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#3957ED] transition-all duration-200"
                            style={{ width: `${Math.min(100, (lead.scoreDemographic ?? 0))}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-[14px] border border-[rgba(0,0,0,0.05)] p-3">
                        <div className="text-xs text-[#666666] mb-1">Behavioral</div>
                        <div className="text-xl font-bold text-[#141414]">{lead.scoreBehavioral ?? 0}</div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-[#F5F7FF] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500 transition-all duration-200"
                            style={{ width: `${Math.min(100, (lead.scoreBehavioral ?? 0))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Meta */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Details</h4>
                    <div className="flex items-center gap-2 text-sm text-[#666666]">
                      <Clock className="h-4 w-4 text-[#999999]" />
                      <span>Created {format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    {lead.isTarget && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-[#25D366]" />
                        <span className="text-[#25D366] font-semibold">Target Account</span>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="text-sm text-[#666666] bg-[#F5F7FF] p-3 rounded-xl border border-[#E8EBFF]">
                        {lead.notes}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value={1} className="flex-1 overflow-y-auto px-5 py-4 mt-0">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-[#999999] text-sm">
                    <ActivityIcon className="h-8 w-8 mb-2 opacity-40" />
                    No activities yet
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E8EBFF]" />
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <div key={activity.id} className="flex gap-3 relative">
                          <div className="w-8 h-8 rounded-full bg-white border border-[#E8EBFF] flex items-center justify-center shrink-0 z-10 text-[#3957ED]">
                            {ACTIVITY_ICONS[activity.type] ?? <ActivityIcon className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-[#141414]">
                                {activity.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] text-[#999999]">
                                {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            {activity.subject && (
                              <p className="text-sm font-semibold text-[#141414] mt-0.5">{activity.subject}</p>
                            )}
                            {activity.content && (
                              <p className="text-sm text-[#666666] mt-0.5">{activity.content}</p>
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
                    className="min-h-[80px] text-sm resize-none rounded-xl border-[#E8EBFF] focus-visible:ring-[#3957ED] transition-all duration-200"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || createActivity.isPending}
                  className="self-end mb-4 rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white shadow-md hover:-translate-y-px transition-all duration-200"
                >
                  Add Note
                </Button>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {activities
                    .filter((a: any) => a.type === "NOTE")
                    .map((note: any) => (
                      <div key={note.id} className="rounded-xl border border-[#E8EBFF] p-3 bg-[#F5F7FF]/50">
                        <p className="text-sm text-[#141414]">{note.content}</p>
                        <p className="text-[10px] text-[#999999] mt-2">
                          {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    ))}
                  {activities.filter((a: any) => a.type === "NOTE").length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-[#999999] text-sm">
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
