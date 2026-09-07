"use client";

import React, { useState } from "react";
import { 
  Star, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  Search,
  Filter,
  CheckCircle2,
  Paperclip,
  FileEdit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmailListItem {
  id: string;
  threadId?: string;
  subject: string;
  participants: string[];
  date: string;
  unreadCount: number;
  isStarred: boolean;
  isDraft?: boolean;
  snippet?: string;
  hasAttachments?: boolean;
}

interface EmailThreadListProps {
  threads: EmailListItem[];
  isLoading: boolean;
  selectedThreadId: string | null;
  onSelectThread: (item: EmailListItem) => void;
  page: number;
  totalPages: number;
  totalThreads: number;
  onPageChange: (newPage: number) => void;
  searchQuery?: string;
  onToggleStar?: (threadId: string, e: React.MouseEvent) => void;
}

const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40",
];

export const EmailThreadList: React.FC<EmailThreadListProps> = ({
  threads,
  isLoading,
  selectedThreadId,
  onSelectThread,
  page,
  totalPages,
  totalThreads,
  onPageChange,
  searchQuery = "",
  onToggleStar,
}) => {
  const [filterType, setFilterType] = useState<"all" | "unread" | "starred">("all");

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return date.toLocaleDateString([], { weekday: "short" });
      }

      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "EM";
    const clean = name.replace(/[<>"']/g, "").trim();
    const parts = clean.split(/[\s@.]+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  // Filter threads by search and active filter chip
  const filteredThreads = threads.filter((thread) => {
    if (filterType === "unread" && thread.unreadCount <= 0) return false;
    if (filterType === "starred" && !thread.isStarred) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchSubject = thread.subject?.toLowerCase().includes(q);
    const matchParticipants = thread.participants?.some((p) => p.toLowerCase().includes(q));
    return matchSubject || matchParticipants;
  });

  return (
    <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl overflow-hidden shadow-xs">
      {/* List Header & Quick Filter Pills */}
      <div className="p-3 border-b border-border/70 bg-muted/15 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Inbox className="h-3.5 w-3.5 text-primary" />
            <span>{totalThreads} {totalThreads === 1 ? "Conversation" : "Conversations"}</span>
          </div>
          {totalPages > 1 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType("unread")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              filterType === "unread"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setFilterType("starred")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              filterType === "starred"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Starred
          </button>
        </div>
      </div>

      {/* Threads List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50 overscroll-contain">
        {isLoading ? (
          <div className="p-3 space-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-2.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 text-center text-muted-foreground">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3 text-muted-foreground">
              <Mail className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-foreground">No conversations found</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
              {searchQuery
                ? `No emails match "${searchQuery}". Try a different keyword.`
                : filterType !== "all"
                ? `No ${filterType} emails in this folder.`
                : "Your folder is clear. Inbound and sent messages will appear here."}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id || selectedThreadId === thread.threadId;
            const hasUnread = thread.unreadCount > 0 && !thread.isDraft;
            const primaryParticipant = thread.participants?.[0] || "Unknown Contact";

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`relative flex items-start gap-3 p-3 sm:p-3.5 cursor-pointer transition-all hover:bg-muted/40 group ${
                  isSelected
                    ? "bg-primary/10 border-l-3 border-l-primary"
                    : hasUnread
                    ? "bg-muted/15 font-medium"
                    : ""
                }`}
              >
                {/* Avatar with initials */}
                <Avatar className="h-9 w-9 border shrink-0 text-xs mt-0.5 shadow-2xs">
                  <AvatarFallback className={`font-bold text-[11px] ${getAvatarColor(primaryParticipant)}`}>
                    {thread.isDraft ? <FileEdit className="h-4 w-4" /> : getInitials(primaryParticipant)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Row 1: Participant and Date */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs truncate ${
                        hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/85"
                      }`}
                    >
                      {thread.isDraft && (
                        <span className="text-amber-500 dark:text-amber-400 font-bold mr-1.5">[Draft]</span>
                      )}
                      {thread.participants?.join(", ") || "Participants"}
                    </span>

                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {formatTime(thread.date)}
                    </span>
                  </div>

                  {/* Row 2: Subject */}
                  <p
                    className={`text-xs truncate leading-snug ${
                      hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {thread.subject || "(No Subject)"}
                  </p>

                  {/* Row 3: Tags & Indicators */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      {hasUnread && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
                          New
                        </span>
                      )}

                      {thread.hasAttachments && (
                        <span className="inline-flex items-center text-muted-foreground">
                          <Paperclip className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    {/* Star Button */}
                    {onToggleStar && !thread.isDraft && (
                      <button
                        type="button"
                        onClick={(e) => onToggleStar(thread.id, e)}
                        className="p-1 rounded-md text-muted-foreground/60 hover:text-amber-400 hover:bg-muted/70 transition-colors"
                        title={thread.isStarred ? "Unstar" : "Star"}
                      >
                        <Star
                          className={`h-3.5 w-3.5 transition-transform active:scale-125 ${
                            thread.isStarred ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-2.5 border-t border-border/70 bg-muted/15 flex items-center justify-between text-xs shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-7 px-2.5 text-xs gap-1 rounded-xl"
          >
            <ChevronLeft className="h-3 w-3" />
            <span>Prev</span>
          </Button>

          <span className="text-[11px] text-muted-foreground font-medium">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-7 px-2.5 text-xs gap-1 rounded-xl"
          >
            <span>Next</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
