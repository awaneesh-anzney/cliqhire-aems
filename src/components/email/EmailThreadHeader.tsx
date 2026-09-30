"use client";

import React from "react";
import { 
  ArrowLeft, 
  Star, 
  Eye, 
  EyeOff, 
  Reply, 
  Trash2, 
  RotateCcw, 
  ChevronsUpDown, 
  ChevronsDownUp,
  Maximize2,
  Minimize2,
  Printer,
  MoreVertical,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailThread } from "@/types/email";
import { normalizeContacts } from "./EmailRecipientBadges";

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
  onPrintThread,
}) => {
  const isUnread = thread.unreadCount > 0;
  const isStarred = thread.isStarred;

  // Clean participant display
  const participants = thread.participants || [];
  const parsedParticipants = normalizeContacts(participants);

  return (
    <div className="p-3.5 sm:p-4 border-b border-border/70 bg-card/95 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
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
              className="text-base sm:text-lg font-bold text-foreground truncate max-w-[300px] sm:max-w-[480px] lg:max-w-[620px]"
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

          {/* Participant summary row */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <Users className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {parsedParticipants.length > 0
                ? parsedParticipants.map((p) => p.name).join(", ")
                : participants.join(", ") || "Participants"}
            </span>
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
