"use client";

import React, { useState } from "react";
import { 
  Star, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  Search,
  Paperclip,
  FileEdit,
  Sparkles
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
  "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/40",
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

  const unreadTotal = threads.filter((t) => t.unreadCount > 0 && !t.isDraft).length;
  const starredTotal = threads.filter((t) => t.isStarred).length;

  return (
    <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-xs">
      {/* List Header & Quick Filter Pills */}
      <div className="p-3 border-b border-border/60 bg-muted/20 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Inbox className="h-3 w-3" />
            </div>
            <span>{totalThreads} {totalThreads === 1 ? "Conversation" : "Conversations"}</span>
          </div>
          {totalPages > 1 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Filter Pills with vibrant email client accents */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
              filterType === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            All ({threads.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("unread")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border flex items-center gap-1 ${
              filterType === "unread"
                ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-2xs font-bold"
                : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <span>Unread</span>
            {unreadTotal > 0 && (
              <span className="h-4 px-1 rounded-full text-[9px] font-bold bg-sky-500 text-white leading-none flex items-center">
                {unreadTotal}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("starred")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border flex items-center gap-1 ${
              filterType === "starred"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-2xs font-bold"
                : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Star className={`h-3 w-3 ${filterType === "starred" ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>Starred</span>
            {starredTotal > 0 && (
              <span className="h-4 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-white leading-none flex items-center">
                {starredTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Threads List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 overscroll-contain scrollbar-thin">
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
            <div className="h-12 w-12 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-center mb-3 text-muted-foreground shadow-2xs">
              <Mail className="h-6 w-6 text-muted-foreground/60" />
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
                    ? "bg-primary/10 dark:bg-primary/15 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_rgba(59,130,246,0.6)] shadow-2xs"
                    : hasUnread
                    ? "bg-sky-500/[0.04] dark:bg-sky-500/[0.08]"
                    : ""
                }`}
              >
                {/* Avatar with initials */}
                <Avatar className="h-9 w-9 border border-border/50 shrink-0 text-xs mt-0.5 shadow-2xs">
                  <AvatarFallback className={`font-bold text-[11px] ${getAvatarColor(primaryParticipant)}`}>
                    {thread.isDraft ? <FileEdit className="h-4 w-4" /> : getInitials(primaryParticipant)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Row 1: Participant and Date */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/85"
                        }`}
                      >
                        {thread.isDraft && (
                          <span className="text-purple-600 dark:text-purple-400 font-bold mr-1.5">[Draft]</span>
                        )}
                        {thread.participants?.join(", ") || "Participants"}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground/80 shrink-0 font-medium">
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
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                          Unread
                        </span>
                      )}

                      {thread.hasAttachments && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.2 rounded-md border border-primary/20" title="Has attachments">
                          <Paperclip className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Star Button */}
                    {onToggleStar && !thread.isDraft && (
                      <button
                        type="button"
                        onClick={(e) => onToggleStar(thread.id, e)}
                        className="p-1 rounded-md text-muted-foreground/50 hover:text-amber-400 hover:bg-muted/60 transition-colors"
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
        <div className="p-2.5 border-t border-border/60 bg-muted/15 flex items-center justify-between text-xs shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-7 px-2.5 text-xs gap-1 rounded-xl border-border/70"
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
            className="h-7 px-2.5 text-xs gap-1 rounded-xl border-border/70"
          >
            <span>Next</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
