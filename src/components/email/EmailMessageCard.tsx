"use client";

import React, { useState } from "react";
import { 
  Reply, 
  ReplyAll, 
  Trash2, 
  RotateCcw, 
  MoreVertical, 
  CheckCheck, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  MailCheck
} from "lucide-react";
import { Email, EmailStatus } from "@/types/email";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailRecipientBadges, getContactAvatarColor, parseContactString } from "./EmailRecipientBadges";
import { EmailAttachmentList } from "./EmailAttachmentList";
import { toast } from "sonner";

interface EmailMessageCardProps {
  message: Email;
  threadSubject?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  canCollapse?: boolean;
  onReply?: (to: string, inReplyTo?: string) => void;
  onReplyAll?: (to: string[], cc?: string[], inReplyTo?: string) => void;
  onDelete?: (messageId: string) => void;
  onRestore?: (messageId: string) => void;
  onPermanentDelete?: (messageId: string) => void;
  onComposeTo?: (email: string) => void;
}

export const EmailMessageCard: React.FC<EmailMessageCardProps> = ({
  message,
  threadSubject,
  isExpanded = true,
  onToggleExpand,
  canCollapse = false,
  onReply,
  onReplyAll,
  onDelete,
  onRestore,
  onPermanentDelete,
  onComposeTo,
}) => {
  const [copiedBody, setCopiedBody] = useState(false);
  const [showQuotedText, setShowQuotedText] = useState(false);

  const isSent = message.direction === "sent";
  const parsedFrom = parseContactString(message.from) || {
    raw: message.from,
    name: isSent ? "You" : message.from,
    email: message.from,
    initials: isSent ? "ME" : "EM",
  };

  const formattedDate = message.sentAt || message.receivedAt || message.createdAt;

  const formatShortTime = (dateStr?: string) => {
    if (!dateStr) return "Recent";
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
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  const getStatusBadge = (status: EmailStatus, errorMsg?: string) => {
    switch (status) {
      case "delivered":
      case "sent":
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 font-semibold shrink-0"
            title="Delivered to recipient mailbox"
          >
            <CheckCheck className="h-3 w-3" />
            <span>Sent</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/25 font-semibold shrink-0"
            title={errorMsg || "Delivery failed"}
          >
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case "queued":
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-semibold shrink-0"
            title="Queued for delivery"
          >
            <Clock className="h-3 w-3" />
            <span>Queued</span>
          </Badge>
        );
      case "received":
      default:
        return null;
    }
  };

  const handleCopyBody = () => {
    const textToCopy = message.bodyText || message.bodyHtml?.replace(/<[^>]+>/g, " ") || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBody(true);
    toast.success("Email body copied to clipboard");
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${message.subject || threadSubject || "Email Print"}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 4px; }
            .title { font-size: 20px; font-bold: true; margin-bottom: 12px; }
            .content { font-size: 14px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${message.subject || threadSubject || "(No Subject)"}</div>
            <div class="meta"><strong>From:</strong> ${parsedFrom.name} &lt;${parsedFrom.email}&gt;</div>
            <div class="meta"><strong>To:</strong> ${Array.isArray(message.to) ? message.to.join(", ") : message.to}</div>
            ${message.cc ? `<div class="meta"><strong>Cc:</strong> ${Array.isArray(message.cc) ? message.cc.join(", ") : message.cc}</div>` : ""}
            <div class="meta"><strong>Date:</strong> ${formattedDate ? new Date(formattedDate).toLocaleString() : ""}</div>
          </div>
          <div class="content">
            ${message.bodyHtml || `<pre style="white-space: pre-wrap; font-family: inherit;">${message.bodyText || ""}</pre>`}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Preview snippet for collapsed card
  const snippet = message.bodyText
    ? message.bodyText.slice(0, 160).replace(/\s+/g, " ")
    : message.bodyHtml
    ? message.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 160).replace(/\s+/g, " ")
    : "No text preview available";

  // Collapsed state in multi-message threads
  if (!isExpanded && canCollapse) {
    return (
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 cursor-pointer transition-all shadow-2xs group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-7 w-7 border border-border/50 text-xs shrink-0">
            <AvatarFallback className={`font-bold ${getContactAvatarColor(parsedFrom.email)}`}>
              {parsedFrom.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
              {isSent ? "You" : parsedFrom.name}
            </span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              — {snippet}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {message.attachments && message.attachments.length > 0 && (
            <Badge variant="outline" className="text-[10px] h-4.5 px-1 font-semibold text-muted-foreground">
              📎 {message.attachments.length}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground font-medium">
            {formatShortTime(formattedDate)}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all shadow-xs ${
        isSent
          ? "bg-gradient-to-b from-blue-50/40 via-card to-card dark:from-blue-950/20 dark:via-card dark:to-card border-blue-200/60 dark:border-blue-900/40"
          : "bg-card border-border/80"
      }`}
    >
      {/* CARD HEADER */}
      <div className="p-4 sm:p-5 pb-3 border-b border-border/50 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          {/* Sender Identity & Avatar */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border/70 shrink-0 text-xs shadow-2xs">
              <AvatarFallback
                className={
                  isSent
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-xs shadow-blue-500/20"
                    : `font-bold ${getContactAvatarColor(parsedFrom.email)}`
                }
              >
                {parsedFrom.initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground truncate">
                  {isSent ? "You" : parsedFrom.name}
                </span>

                {!isSent && parsedFrom.email && parsedFrom.name !== parsedFrom.email && (
                  <span className="text-[11px] font-mono text-muted-foreground truncate hidden sm:inline">
                    &lt;{parsedFrom.email}&gt;
                  </span>
                )}

                {getStatusBadge(message.status, message.errorMessage)}
              </div>

              {/* Timestamp on mobile */}
              <div className="text-[11px] text-muted-foreground font-medium sm:hidden">
                {formattedDate ? new Date(formattedDate).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Recent"}
              </div>
            </div>
          </div>

          {/* Right Header Toolbar: Timestamp, Quick Reply Button, Dropdown Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {formattedDate ? new Date(formattedDate).toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) : "Recent"}
            </span>

            {/* Quick Reply Trigger for this message */}
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(isSent ? (Array.isArray(message.to) ? message.to[0] : message.to) : message.from, message.messageIdHeader)}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg gap-1"
                title="Reply to this message"
              >
                <Reply className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden md:inline">Reply</span>
              </Button>
            )}

            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs rounded-xl shadow-lg border-border/70">
                {onReply && (
                  <DropdownMenuItem
                    onClick={() => onReply(isSent ? (Array.isArray(message.to) ? message.to[0] : message.from) : message.from, message.messageIdHeader)}
                    className="gap-2 cursor-pointer"
                  >
                    <Reply className="h-3.5 w-3.5 text-blue-600" />
                    <span>Reply</span>
                  </DropdownMenuItem>
                )}

                {onReplyAll && (
                  <DropdownMenuItem
                    onClick={() => {
                      const allTo = Array.isArray(message.to) ? message.to : [message.to];
                      const allCc = message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : [];
                      onReplyAll(allTo, allCc, message.messageIdHeader);
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <ReplyAll className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Reply All</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleCopyBody} className="gap-2 cursor-pointer">
                  {copiedBody ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Message Text</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Message</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {message._id && message.folder !== "trash" && onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message._id)}
                    className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Move to Trash</span>
                  </DropdownMenuItem>
                )}

                {message._id && message.folder === "trash" && onRestore && (
                  <DropdownMenuItem
                    onClick={() => onRestore(message._id)}
                    className="gap-2 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore</span>
                  </DropdownMenuItem>
                )}

                {message._id && message.folder === "trash" && onPermanentDelete && (
                  <DropdownMenuItem
                    onClick={() => onPermanentDelete(message._id)}
                    className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collapse toggle button if applicable */}
            {canCollapse && onToggleExpand && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleExpand}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Collapse message"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* RECIPIENTS SECTION: Displayed clearly with To, Cc, Bcc, expand details and copy actions */}
        <EmailRecipientBadges
          from={message.from}
          to={message.to}
          cc={message.cc}
          bcc={message.bcc}
          date={formattedDate}
          subject={message.subject || threadSubject}
          isSent={isSent}
          status={message.status}
          onComposeTo={onComposeTo}
        />
      </div>

      {/* CARD BODY: Clean, spacious, readable email text */}
      <div className="p-4 sm:p-6 text-sm text-foreground/90 leading-relaxed overflow-x-auto select-text">
        {message.bodyHtml ? (
          <div
            className="email-body-prose max-w-none prose dark:prose-invert prose-sm sm:prose-base prose-headings:font-bold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-500 prose-img:rounded-xl prose-img:max-w-full prose-table:border prose-table:border-border overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
          />
        ) : (
          <p className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] leading-relaxed break-words">
            {message.bodyText || "(No message body content)"}
          </p>
        )}

        {/* ATTACHMENTS */}
        {message.attachments && message.attachments.length > 0 && (
          <EmailAttachmentList attachments={message.attachments} />
        )}
      </div>
    </div>
  );
};
