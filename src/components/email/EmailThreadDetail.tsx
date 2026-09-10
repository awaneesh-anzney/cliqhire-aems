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
  MoreVertical, 
  PenTool,
  Star,
  PenSquare,
  FileText,
  Image as ImageIcon,
  Sheet
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
  useToggleStar 
} from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";

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
  const toggleStarMutation = useToggleStar();
  const { defaultReplySignature } = useEmailSignatures();

  const [quickReplyText, setQuickReplyText] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-4 flex-1 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-border/60 rounded-2xl space-y-3">
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
      <div className="flex flex-col items-center justify-center h-full bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl p-8 text-center text-muted-foreground shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-2xs">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">Select a conversation</h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          Choose an email thread from the conversation list to review message history, download attachments, and send replies.
        </p>
        {onOpenFullComposer && (
          <Button
            onClick={() => onOpenFullComposer({ to: "", subject: "", threadId: "" })}
            variant="outline"
            size="sm"
            className="mt-5 h-9 px-4 gap-2 text-xs font-semibold rounded-xl border-border/70 hover:bg-muted/50"
          >
            <PenSquare className="h-3.5 w-3.5 text-primary" />
            <span>Compose New Message</span>
          </Button>
        )}
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAttachmentIcon = (filename: string, mime?: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf") || mime?.includes("pdf")) {
      return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || mime?.includes("image")) {
      return <ImageIcon className="h-4 w-4 text-purple-500 shrink-0" />;
    }
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) {
      return <Sheet className="h-4 w-4 text-emerald-500 shrink-0" />;
    }
    return <FileIcon className="h-4 w-4 text-blue-500 shrink-0" />;
  };

  const getStatusBadge = (status: EmailStatus, errorMsg?: string) => {
    switch (status) {
      case "delivered":
      case "sent":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 font-semibold">
            <CheckCheck className="h-3 w-3" />
            <span>Sent</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/25 font-semibold" title={errorMsg}>
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-semibold">
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

    let replyHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #334155;"><p>${quickReplyText.replace(/\n/g, "<br/>")}</p></div>`;

    if (includeSignature && defaultReplySignature) {
      replyHtml += `<div class="gmail_signature" data-signature-block="true">${defaultReplySignature.contentHtml}</div>`;
    }

    sendEmailMutation.mutate(
      {
        to: replyTargetEmail,
        subject: replySubject,
        text: quickReplyText,
        html: replyHtml,
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
    <div className="flex flex-col h-full bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-xs">
      {/* Thread Header Toolbar */}
      <div className="p-3 sm:p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back button */}
          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl border-border/70 shrink-0 md:hidden text-foreground hover:bg-muted/50"
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
                <Badge variant="secondary" className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 rounded-full shrink-0 font-bold">
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
          {/* Star thread toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleStarMutation.mutate({ threadId: thread._id, isStarred: !thread.isStarred })}
            className={`h-8 w-8 p-0 rounded-xl border-border/70 transition-colors ${
              thread.isStarred ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-muted-foreground hover:text-amber-400"
            }`}
            title={thread.isStarred ? "Unstar conversation" : "Star conversation"}
          >
            <Star className={`h-3.5 w-3.5 ${thread.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
          </Button>

          {/* Mark read / unread */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({ threadId: thread._id, isRead: thread.unreadCount <= 0 })}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-muted/50"
            title={thread.unreadCount > 0 ? "Mark as Read" : "Mark as Unread"}
          >
            {thread.unreadCount > 0 ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden lg:inline">{thread.unreadCount > 0 ? "Mark Read" : "Mark Unread"}</span>
          </Button>

          {/* Open full reply */}
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
            className="h-8 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold rounded-xl transition-transform active:scale-95"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 overscroll-contain scrollbar-thin">
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
                className={`group rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
                  isSent
                    ? "bg-blue-500/[0.03] dark:bg-blue-500/[0.08] border-blue-500/20 ml-2 sm:ml-8"
                    : "bg-card border-border/70 mr-2 sm:mr-8"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border/60 shrink-0 text-xs shadow-2xs">
                      <AvatarFallback
                        className={
                          isSent
                            ? "bg-blue-600 text-white font-bold"
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
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-medium">
                      {msg.sentAt || msg.receivedAt
                        ? new Date(msg.sentAt || msg.receivedAt!).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </div>

                    {/* Quick message options dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs rounded-xl">
                        <DropdownMenuItem
                          onClick={() => {
                            if (onOpenFullComposer) {
                              onOpenFullComposer({
                                to: msg.direction === "sent" ? (Array.isArray(msg.to) ? msg.to[0] : msg.to) : msg.from,
                                subject: msg.subject?.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
                                threadId: thread._id,
                                inReplyTo: msg.messageIdHeader,
                              });
                            }
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          <span>Reply to this</span>
                        </DropdownMenuItem>
                        {msg._id && (
                          <DropdownMenuItem
                            onClick={() => moveToTrashMutation.mutate(msg._id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Move to trash</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Message Body */}
                <div className="pt-3 text-xs sm:text-sm text-foreground/90 leading-relaxed overflow-x-auto select-text">
                  {msg.bodyHtml ? (
                    <div
                      className="email-body-content max-w-none prose dark:prose-invert text-xs sm:text-sm"
                      dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.bodyText || "(No message body content)"}</p>
                  )}
                </div>

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="pt-3 border-t border-border/50 space-y-2 mt-3">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      Attachments ({msg.attachments.length})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.attachments.map((file, fileIdx) => {
                        const hasUrl = !!file.storageUrl;
                        return (
                          <a
                            key={fileIdx}
                            href={hasUrl ? file.storageUrl : undefined}
                            target={hasUrl ? "_blank" : undefined}
                            rel={hasUrl ? "noreferrer" : undefined}
                            className={`flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/30 transition-colors group/file ${
                              hasUrl ? "hover:bg-muted/60 cursor-pointer" : "opacity-80 cursor-default"
                            }`}
                            title={!hasUrl ? "Attachment is processing or unavailable" : undefined}
                            onClick={(e) => {
                              if (!hasUrl) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {getAttachmentIcon(file.fileName, file.mimeType)}
                              <div className="truncate text-xs">
                                <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                                <p className="text-[10px] text-muted-foreground">{formatFileSize(file.sizeBytes)}</p>
                              </div>
                            </div>

                            {hasUrl && (
                              <Download className="h-3.5 w-3.5 text-muted-foreground group-hover/file:text-primary transition-colors shrink-0 ml-2" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Inline Quick Reply Drawer */}
      <div className="p-3 sm:p-3.5 border-t border-border/60 bg-muted/20 space-y-2 shrink-0">
        <Textarea
          value={quickReplyText}
          onChange={(e) => setQuickReplyText(e.target.value)}
          placeholder={`Write a quick reply to ${replyTargetEmail || "recipient"}...`}
          rows={2}
          className="text-xs resize-none bg-background/90 border-border/60 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 shadow-2xs"
        />

        <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {/* Signature toggle in quick reply */}
            {defaultReplySignature && (
              <button
                type="button"
                onClick={() => setIncludeSignature(!includeSignature)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                  includeSignature
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
                title={includeSignature ? "Signature will be included" : "Signature excluded"}
              >
                <PenTool className="h-3 w-3 text-amber-500" />
                <span className="hidden sm:inline">Sig:</span>
                <span className="font-bold truncate max-w-[100px]">{defaultReplySignature.name}</span>
              </button>
            )}
            <div className="text-[11px] text-muted-foreground truncate hidden md:block">
              <span>To: </span>
              <span className="font-mono text-foreground/80 font-medium">{replyTargetEmail}</span>
            </div>
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
              className="h-8 px-3.5 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs rounded-xl transition-transform active:scale-95"
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
