"use client";

import React, { useState } from "react";
import { 
  Reply, 
  Send, 
  Paperclip, 
  Download, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Mail, 
  Eye,
  EyeOff, 
  ArrowLeft,
  FileIcon,
  Trash2,
  Maximize2,
  ExternalLink,
  MoreVertical,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailThread, Email, EmailAttachment, EmailStatus } from "@/types/email";
import { 
  useMarkThreadRead, 
  useSendEmail,
  useMoveToTrash,
  useRestoreEmail,
  usePermanentDelete
} from "@/hooks/useEmail";

interface EmailThreadDetailProps {
  thread: EmailThread | null;
  messages: Email[];
  isLoading: boolean;
  onClose?: () => void;
  onOpenFullComposer?: (replyData: { to: string; subject: string; threadId: string; inReplyTo?: string }) => void;
}

export const EmailThreadDetail: React.FC<EmailThreadDetailProps> = ({
  thread,
  messages,
  isLoading,
  onClose,
  onOpenFullComposer,
}) => {
  const markReadMutation = useMarkThreadRead();
  const sendEmailMutation = useSendEmail();
  const moveToTrashMutation = useMoveToTrash();
  const restoreEmailMutation = useRestoreEmail();
  const permanentDeleteMutation = usePermanentDelete();

  const [quickReplyText, setQuickReplyText] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-4 flex-1 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl p-8 text-center text-muted-foreground shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-center mb-4 text-muted-foreground/60 shadow-2xs">
          <Mail className="h-8 w-8" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Select a conversation</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
          Choose an email thread from the inbox list to view the full message history and communicate with candidates.
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: EmailStatus, errorMsg?: string) => {
    switch (status) {
      case "delivered":
      case "sent":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
            <CheckCheck className="h-3 w-3" />
            <span>Sent</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/20 font-medium" title={errorMsg}>
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium">
            <Clock className="h-3 w-3" />
            <span>Queued</span>
          </Badge>
        );
      case "received":
      default:
        return null;
    }
  };

  const lastReceivedMessage = [...messages].reverse().find((m) => m.direction === "received") || messages[messages.length - 1];
  const replyTargetEmail = lastReceivedMessage?.from || thread.participants[0] || "";

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim() || !thread) return;

    const replySubject = thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`;

    sendEmailMutation.mutate(
      {
        to: replyTargetEmail,
        subject: replySubject,
        text: quickReplyText,
        html: `<div style="font-family: sans-serif; line-height: 1.5; color: #222;"><p>${quickReplyText.replace(/\n/g, "<br/>")}</p></div>`,
        threadId: thread._id,
        inReplyTo: lastReceivedMessage?.messageIdHeader,
      },
      {
        onSuccess: () => {
          setQuickReplyText("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl overflow-hidden shadow-xs">
      {/* Thread Header Toolbar */}
      <div className="p-3 sm:p-4 border-b border-border/70 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back button */}
          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl border-border/70 shrink-0 md:hidden text-foreground"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {thread.subject || "(No Subject)"}
              </h2>
              {thread.unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary rounded-full shrink-0">
                  Unread
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {thread.participants?.join(", ") || "Participants"}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({ threadId: thread._id, isRead: thread.unreadCount <= 0 })}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/70"
            title={thread.unreadCount > 0 ? "Mark as Read" : "Mark as Unread"}
          >
            {thread.unreadCount > 0 ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden lg:inline">{thread.unreadCount > 0 ? "Mark Read" : "Mark Unread"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (onOpenFullComposer) {
                onOpenFullComposer({
                  to: replyTargetEmail,
                  subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
                  threadId: thread._id,
                  inReplyTo: lastReceivedMessage?.messageIdHeader,
                });
              }
            }}
            className="h-8 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold rounded-xl"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No message content recorded in this thread.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSent = msg.direction === "sent";

            return (
              <div
                key={msg._id || idx}
                className={`group rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                  isSent
                    ? "bg-primary/5 border-primary/15 ml-2 sm:ml-8"
                    : "bg-card border-border/80 mr-2 sm:mr-8"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border shrink-0 text-xs">
                      <AvatarFallback
                        className={
                          isSent
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted text-foreground font-bold"
                        }
                      >
                        {isSent ? "ME" : msg.from ? msg.from.slice(0, 2).toUpperCase() : "CA"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">
                          {isSent ? "You" : msg.from}
                        </span>
                        {getStatusBadge(msg.status, msg.errorMessage)}
                      </div>

                      <div className="text-[11px] text-muted-foreground truncate">
                        <span>To: {Array.isArray(msg.to) ? msg.to.join(", ") : msg.to}</span>
                        {msg.cc && msg.cc.length > 0 && (
                          <span className="ml-2 font-normal">| Cc: {Array.isArray(msg.cc) ? msg.cc.join(", ") : msg.cc}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                      {msg.sentAt || msg.receivedAt
                        ? new Date(msg.sentAt || msg.receivedAt!).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </div>

                    {/* Message menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 rounded-lg"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs rounded-xl">
                        {msg.folder === "trash" ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => restoreEmailMutation.mutate(msg._id)}
                              className="gap-2 text-emerald-600 dark:text-emerald-400"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Restore Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => permanentDeleteMutation.mutate(msg._id)}
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Permanently</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => moveToTrashMutation.mutate(msg._id)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Move to Trash</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="py-3 text-xs text-foreground leading-relaxed break-words overflow-hidden">
                  {msg.bodyHtml ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.bodyText || "(No message body content)"}</p>
                  )}
                </div>

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="pt-3 border-t border-border/60 space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments ({msg.attachments.length})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.attachments.map((file, fileIdx) => (
                        <a
                          key={fileIdx}
                          href={file.storageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted/70 transition-colors group/file"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileIcon className="h-4 w-4 text-primary shrink-0" />
                            <div className="truncate text-xs">
                              <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                              <p className="text-[10px] text-muted-foreground">{formatFileSize(file.sizeBytes)}</p>
                            </div>
                          </div>

                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover/file:text-primary transition-colors shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Inline Quick Reply Drawer */}
      <div className="p-3 sm:p-4 border-t border-border/70 bg-muted/15 space-y-2 shrink-0">
        <Textarea
          value={quickReplyText}
          onChange={(e) => setQuickReplyText(e.target.value)}
          placeholder={`Write a quick reply to ${replyTargetEmail || "candidate"}...`}
          rows={2}
          className="text-xs resize-none bg-background/80 border-border/70 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
        />

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="text-[11px] text-muted-foreground truncate hidden sm:block">
            <span>To: </span>
            <span className="font-mono text-foreground/85 font-medium">{replyTargetEmail}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onOpenFullComposer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenFullComposer({
                    to: replyTargetEmail,
                    subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
                    threadId: thread._id,
                    inReplyTo: lastReceivedMessage?.messageIdHeader,
                  });
                }}
                className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                Full Editor
              </Button>
            )}

            <Button
              size="sm"
              disabled={!quickReplyText.trim() || sendEmailMutation.isPending}
              onClick={handleSendQuickReply}
              className="h-8 px-3.5 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs rounded-xl"
            >
              {sendEmailMutation.isPending ? (
                <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
