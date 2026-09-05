"use client";

import React from "react";
import { 
  Star, 
  Mail, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Inbox,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailThread } from "@/types/email";

export interface EmailListItem {
  id: string; // The email ID or thread ID to select
  threadId?: string; // The underlying thread ID
  subject: string;
  participants: string[];
  date: string;
  unreadCount: number;
  isStarred: boolean;
  isDraft?: boolean;
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
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "E";
    const parts = name.split(/[\s@.]+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchSubject = thread.subject?.toLowerCase().includes(q);
    const matchParticipants = thread.participants?.some((p) => p.toLowerCase().includes(q));
    return matchSubject || matchParticipants;
  });

  return (
    <div className="flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-xs">
      {/* Header Info */}
      <div className="px-3.5 py-2.5 border-b bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Inbox className="h-3.5 w-3.5 text-primary" />
          <span>
            {totalThreads} {totalThreads === 1 ? "Conversation" : "Conversations"}
          </span>
        </div>
        {totalPages > 1 && (
          <span className="text-[11px]">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
              <Mail className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-xs font-semibold text-foreground">No conversations found</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
              {searchQuery
                ? `No emails matching "${searchQuery}". Try adjusting your search term.`
                : "Your inbox is clear. When you send or receive emails, they will appear here."}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id || selectedThreadId === thread.threadId;
            const hasUnread = thread.unreadCount > 0 && !thread.isDraft;
            const primaryParticipant = thread.participants?.[0] || "Unknown";

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`relative flex items-start gap-3 p-3 cursor-pointer transition-all hover:bg-muted/40 ${
                  isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                } ${hasUnread ? "bg-muted/10 font-semibold" : ""}`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 border shrink-0 text-xs mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                    {getInitials(primaryParticipant)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs truncate ${
                        hasUnread ? "font-bold text-foreground" : "font-medium text-foreground/90"
                      }`}
                    >
                      {thread.isDraft && (
                        <span className="text-amber-500 font-bold mr-1">[Draft]</span>
                      )}
                      {thread.participants?.join(", ") || "Participants"}
                    </span>

                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {formatTime(thread.date)}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate ${
                      hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {thread.subject || "(No Subject)"}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    {hasUnread && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full"
                      >
                        {thread.unreadCount} new
                      </Badge>
                    )}

                    {thread.isStarred && (
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Star Button */}
                {onToggleStar && !thread.isDraft && (
                  <button
                    type="button"
                    onClick={(e) => onToggleStar(thread.id, e)}
                    className="p-1 rounded text-muted-foreground hover:text-amber-400 hover:bg-muted/60 transition-colors"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        thread.isStarred ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-2 border-t bg-muted/10 flex items-center justify-between text-xs">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-7 px-2 text-xs gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Previous
          </Button>

          <span className="text-[11px] text-muted-foreground">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-7 px-2 text-xs gap-1"
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
