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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    <div className="p-3 sm:p-3.5 md:p-4 border-b border-border/70 bg-card/95 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      {/* LEFT: Back button + Subject title + Badge */}
      <div className="flex items-center gap-3 min-w-0">
        {onClose && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8.5 w-8.5 rounded-xl border-border/70 shrink-0 md:hidden text-foreground hover:bg-muted/60"
            aria-label="Back to conversations list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-base sm:text-lg font-bold text-foreground truncate max-w-[280px] sm:max-w-[420px] lg:max-w-[560px]"
              title={thread.subject || "(No Subject)"}
            >
              {thread.subject || "(No Subject)"}
            </h2>

            {isUnread && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 rounded-full shrink-0 font-bold"
              >
                Unread
              </Badge>
            )}

            {messageCount > 1 && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 bg-muted/40 text-muted-foreground border-border/60 rounded-full shrink-0 font-semibold"
              >
                {messageCount} messages
              </Badge>
            )}
          </div>

          {/* Participant summary row with View All / +X more popover */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Users className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="font-semibold text-[11px]">Participants:</span>

            {parsedParticipants.length === 0 ? (
              <span className="text-[11px]">{participants.join(", ") || "No contacts"}</span>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {visibleParticipants.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] text-foreground/85 font-medium"
                  >
                    <span>{p.name}</span>
                    {idx < visibleParticipants.length - 1 && <span className="text-muted-foreground/60">,</span>}
                  </span>
                ))}

                {/* +X More / View All Button */}
                {hiddenCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer shadow-2xs"
                        title={`View all ${parsedParticipants.length} participants`}
                      >
                        <span>+{hiddenCount} more</span>
                        <span className="opacity-75">• View All</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-72 p-3 rounded-2xl shadow-xl border-border/70 space-y-2">
                      <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/60">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-foreground">
                          All Participants ({parsedParticipants.length})
                        </span>
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

      {/* RIGHT: Action Toolbar */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
        {/* Toggle star */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleStar}
          className={`h-8 w-8 p-0 rounded-xl border-border/70 transition-all ${
            isStarred
              ? "text-amber-500 bg-amber-500/15 border-amber-500/35 shadow-2xs"
              : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
          }`}
          title={isStarred ? "Unstar conversation" : "Star conversation"}
        >
          <Star className={`h-3.5 w-3.5 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
        </Button>

        {/* Mark read / unread */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRead}
          className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40 transition-colors"
          title={isUnread ? "Mark as Read" : "Mark as Unread"}
        >
          {isUnread ? <Eye className="h-3.5 w-3.5 text-blue-600" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline font-semibold">{isUnread ? "Mark Read" : "Mark Unread"}</span>
        </Button>

        {/* Expand / Collapse all in multi-message threads */}
        {messageCount > 1 && onToggleExpandAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpandAll}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={allExpanded ? "Collapse older messages" : "Expand all messages"}
          >
            {allExpanded ? (
              <ChevronsDownUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline font-semibold">
              {allExpanded ? "Collapse" : "Expand All"}
            </span>
          </Button>
        )}

        {/* Fullscreen focus reading mode toggle */}
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 rounded-xl border-border/70 text-muted-foreground hover:text-foreground hidden lg:flex"
            title={isFullscreen ? "Exit reading mode" : "Focus reading mode"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        )}

        {/* Move to trash */}
        {onMoveToTrash && (
          <Button
            variant="outline"
            size="icon"
            onClick={onMoveToTrash}
            className="h-8 w-8 rounded-xl border-border/70 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 transition-colors"
            title="Move conversation to Trash"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Primary Reply Button */}
        <Button
          size="sm"
          onClick={onOpenReply}
          className="h-8 px-3.5 text-xs gap-1.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs shadow-blue-500/20 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <Reply className="h-3.5 w-3.5" />
          <span>Reply</span>
        </Button>
      </div>
    </div>
  );
};
