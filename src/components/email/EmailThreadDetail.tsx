"use client";

import React, { useState } from "react";
import { 
  Reply, 
  Send, 
  Paperclip, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Mail, 
  User, 
  Star, 
  Eye,
  EyeOff, 
  MoreVertical,
  X,
  FileIcon,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  const [isReplying, setIsReplying] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card border rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-4 flex-1">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card border rounded-xl p-8 text-center text-muted-foreground shadow-xs">
        <div className="h-14 w-14 rounded-full bg-muted/60 flex items-center justify-center mb-3">
          <Mail className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Select a conversation</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Choose an email thread from the inbox list to read the full conversation and respond to candidates.
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
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40">
            <CheckCheck className="h-3 w-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/30" title={errorMsg}>
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
            <Clock className="h-3 w-3" />
            Queued
          </Badge>
        );
      case "received":
      default:
        return null;
    }
  };

  const lastReceivedMessage = [...messages].reverse().find((m) => m.direction === "received") || messages[messages.length - 1];

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim() || !thread) return;

    const replyToEmail = lastReceivedMessage ? lastReceivedMessage.from : thread.participants[0];
    const replySubject = thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`;

    sendEmailMutation.mutate(
      {
        to: replyToEmail,
        subject: replySubject,
        text: quickReplyText,
        html: `<p>${quickReplyText.replace(/\n/g, "<br/>")}</p>`,
        threadId: thread._id,
        inReplyTo: lastReceivedMessage?.messageIdHeader,
      },
      {
        onSuccess: () => {
          setQuickReplyText("");
          setIsReplying(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-xs">
      {/* Thread Header */}
      <div className="p-3.5 sm:p-4 border-b bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {thread.subject || "(No Subject)"}
            </h2>
            {thread.unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Participants: {thread.participants?.join(", ")}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({ threadId: thread._id, isRead: thread.unreadCount <= 0 })}
            className="h-8 px-2.5 text-xs gap-1.5"
            title={thread.unreadCount > 0 ? "Mark as Read" : "Mark as Unread"}
          >
            {thread.unreadCount > 0 ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{thread.unreadCount > 0 ? "Mark Read" : "Mark Unread"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (onOpenFullComposer && lastReceivedMessage) {
                onOpenFullComposer({
                  to: lastReceivedMessage.from,
                  subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
                  threadId: thread._id,
                  inReplyTo: lastReceivedMessage.messageIdHeader,
                });
              } else {
                setIsReplying(true);
              }
            }}
            className="h-8 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-medium"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isSent = msg.direction === "sent";

          return (
            <div
              key={msg._id || idx}
              className={`group rounded-xl border p-4 shadow-xs transition-colors ${
                isSent ? "bg-muted/20 border-border/80 ml-4 sm:ml-8" : "bg-card border-border/90 mr-4 sm:mr-8"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 border shrink-0 text-xs">
                    <AvatarFallback className={isSent ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-foreground font-bold"}>
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

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {msg.sentAt || msg.receivedAt
                      ? new Date(msg.sentAt || msg.receivedAt!).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent"}
                  </div>

                  {/* Message Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.folder === "trash" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => restoreEmailMutation.mutate(msg._id)}
                          disabled={restoreEmailMutation.isPending}
                          className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                          title="Restore Email"
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => permanentDeleteMutation.mutate(msg._id)}
                          disabled={permanentDeleteMutation.isPending}
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Permanently Delete"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveToTrashMutation.mutate(msg._id)}
                        disabled={moveToTrashMutation.isPending}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="py-3 text-xs text-foreground leading-relaxed break-words">
                {msg.bodyHtml ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-xs"
                    dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.bodyText || "(No message body content)"}</p>
                )}
              </div>

              {/* Attachments Section */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    Attachments ({msg.attachments.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {msg.attachments.map((file, fileIdx) => (
                      <a
                        key={fileIdx}
                        href={file.storageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/40 hover:bg-muted/70 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileIcon className="h-4 w-4 text-primary shrink-0" />
                          <div className="truncate text-xs">
                            <p className="font-medium text-foreground truncate">{file.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">{formatFileSize(file.sizeBytes)}</p>
                          </div>
                        </div>

                        <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Quick Reply Drawer / Area */}
      <div className="p-3.5 border-t bg-muted/10 space-y-2">
        <div className="space-y-1.5">
          <Textarea
            value={quickReplyText}
            onChange={(e) => setQuickReplyText(e.target.value)}
            placeholder="Write a quick reply to candidate or client..."
            rows={3}
            className="text-xs resize-none bg-background"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-medium">Replying to:</span>
              <span className="truncate max-w-[200px] font-mono">
                {lastReceivedMessage ? lastReceivedMessage.from : thread.participants[0]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFullComposer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOpenFullComposer({
                      to: lastReceivedMessage ? lastReceivedMessage.from : thread.participants[0],
                      subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
                      threadId: thread._id,
                      inReplyTo: lastReceivedMessage?.messageIdHeader,
                    });
                  }}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Full Editor & Attachments
                </Button>
              )}

              <Button
                size="sm"
                disabled={!quickReplyText.trim() || sendEmailMutation.isPending}
                onClick={handleSendQuickReply}
                className="h-7 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {sendEmailMutation.isPending ? (
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                <span>Send Reply</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
