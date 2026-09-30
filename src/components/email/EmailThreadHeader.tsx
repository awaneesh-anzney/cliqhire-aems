"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  Eye, 
  EyeOff, 
  Reply, 
  Trash2, 
  ChevronsUpDown, 
  ChevronsDownUp,
  Maximize2,
  Minimize2,
  Users,
  Copy,
  Check,
  MailCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmailThread } from "@/types/email";
import { normalizeContacts, getContactAvatarColor } from "./EmailRecipientBadges";
import { toast } from "sonner";

interface EmailThreadHeaderProps {
  thread: EmailThread;
  messageCount: number;
  allExpanded?: boolean;
  onToggleExpandAll?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  onToggleStar: () => void;
  onToggleRead: () => void;
  onOpenReply: () => void;
  onMoveToTrash?: () => void;
  onPrintThread?: () => void;
}

export const EmailThreadHeader: React.FC<EmailThreadHeaderProps> = ({
  thread,
  messageCount,
  allExpanded = true,
  onToggleExpandAll,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
  onToggleStar,
  onToggleRead,
  onOpenReply,
  onMoveToTrash,
}) => {
  const isUnread = thread.unreadCount > 0;
  const isStarred = thread.isStarred;
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Clean participant display
  const participants = thread.participants || [];
  const parsedParticipants = normalizeContacts(participants);

  const visibleParticipants = parsedParticipants.slice(0, 3);
  const hiddenCount = Math.max(0, parsedParticipants.length - 3);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success(`Copied ${email} to clipboard`);
    setTimeout(() => {
      setCopiedEmail((curr) => (curr === email ? null : curr));
    }, 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-gradient-to-r from-slate-100/70 via-slate-50/90 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-blue-950/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 transition-all shadow-2xs">
        {/* LEFT: Back button (mobile), Subject Title & Inline Participants */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-7.5 w-7.5 rounded-lg border-border/70 shrink-0 md:hidden text-foreground hover:bg-muted/60"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          )}

          <div className="space-y-0.5 min-w-0 flex-1">
            {/* Row 1: Subject Title & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2
                className="text-sm sm:text-[15px] font-bold text-foreground tracking-tight truncate max-w-[280px] sm:max-w-[440px] lg:max-w-[620px]"
                title={thread.subject || "(No Subject)"}
              >
                {thread.subject || "(No Subject)"}
              </h2>

              {isUnread && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 shadow-2xs shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Unread</span>
                </span>
              )}

              {messageCount > 1 && (
                <span className="text-[10px] h-4.5 px-1.5 bg-muted/60 text-muted-foreground border border-border/60 rounded-md shrink-0 font-medium inline-flex items-center">
                  {messageCount} msgs
                </span>
              )}
            </div>

            {/* Row 2: Streamlined Participant Summary */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-wrap">
              <Users className="h-3 w-3 shrink-0 text-blue-500/80" />
              <span className="font-semibold text-[10px] text-muted-foreground/80 shrink-0">To:</span>

              {parsedParticipants.length === 0 ? (
                <span className="text-[11px] truncate">{participants.join(", ") || "No contacts"}</span>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  {visibleParticipants.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] text-foreground/85 font-medium truncate max-w-[140px] sm:max-w-[200px]"
                      title={`${p.name} <${p.email}>`}
                    >
                      <span className="truncate">{p.name}</span>
                      {idx < visibleParticipants.length - 1 && <span className="text-muted-foreground/50">,</span>}
                    </span>
                  ))}

                  {/* +X More / View All Popover Trigger */}
                  {hiddenCount > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9.5px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 transition-all cursor-pointer shadow-2xs shrink-0"
                          title={`View all ${parsedParticipants.length} participants`}
                        >
                          <span>+{hiddenCount} more</span>
                          <span className="opacity-75">• View All</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-72 p-3 rounded-2xl shadow-xl border-border/70 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-xs font-bold text-foreground">
                              All Participants ({parsedParticipants.length})
                            </span>
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                          {parsedParticipants.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/60 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-6 w-6 border border-border/50 text-[10px] shrink-0">
                                  <AvatarFallback className={`font-bold ${getContactAvatarColor(p.email)}`}>
                                    {p.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate">{p.name}</p>
                                  <p className="text-[10px] font-mono text-muted-foreground truncate">{p.email}</p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyEmail(p.email)}
                                className="h-6 w-6 rounded text-muted-foreground hover:text-foreground shrink-0"
                                title="Copy email address"
                              >
                                {copiedEmail === p.email ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Compact Unified Action Bar */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto flex-wrap">
          {/* Segmented quick actions rail */}
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-muted/40 border border-border/60">
            {/* Toggle Star */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleStar}
                  className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-all ${
                    isStarred
                      ? "text-amber-500 bg-amber-500/15 shadow-2xs"
                      : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                  }`}
                  aria-label={isStarred ? "Unstar" : "Star"}
                >
                  <Star className={`h-3.5 w-3.5 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isStarred ? "Unstar" : "Star"}
              </TooltipContent>
            </Tooltip>

            {/* Mark Read / Unread */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleRead}
                  className={`h-7 px-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    isUnread
                      ? "text-blue-600 dark:text-blue-400 hover:bg-blue-500/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  aria-label={isUnread ? "Mark as Read" : "Mark as Unread"}
                >
                  {isUnread ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span className="hidden xl:inline text-[11px]">{isUnread ? "Read" : "Unread"}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isUnread ? "Mark as Read" : "Mark as Unread"}
              </TooltipContent>
            </Tooltip>

            {/* Expand / Collapse All Messages (in multi-message threads) */}
            {messageCount > 1 && onToggleExpandAll && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleExpandAll}
                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    aria-label={allExpanded ? "Collapse older messages" : "Expand all messages"}
                  >
                    {allExpanded ? (
                      <ChevronsDownUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {allExpanded ? "Collapse older messages" : "Expand all"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fullscreen Reading Mode */}
            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="h-7 w-7 rounded-lg hidden lg:inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    aria-label={isFullscreen ? "Exit reading mode" : "Focus reading mode"}
                  >
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isFullscreen ? "Exit Fullscreen" : "Focus Reading Mode"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Move to Trash */}
            {onMoveToTrash && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onMoveToTrash}
                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                    aria-label="Move to Trash"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Move to Trash</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Primary Quick Reply CTA */}
          <Button
            size="sm"
            onClick={onOpenReply}
            className="h-7.5 px-3 text-xs gap-1.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-xs shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-95 ml-0.5"
          >
            <Reply className="h-3 w-3" />
            <span>Reply</span>
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
};
