"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Email, EmailThread } from "@/types/email";
import { EmailEditor } from "./EmailEditor";

// MUI Icons
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarIcon from "@mui/icons-material/Star";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ForwardIcon from "@mui/icons-material/Forward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";

export interface EmailDetailPaneProps {
  thread: EmailThread | null;
  messages: Email[];
  fallbackSubject?: string;
  fallbackSender?: { name: string; email: string };
  fallbackDate?: string;
  fallbackRecipients?: string;
  fallbackSnippet?: string;
  isStarred?: boolean;
  isImportant?: boolean;
  isLoading?: boolean;
  onToggleStar: () => void;
  onToggleImportant?: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onMarkUnread?: () => void;
  onReplyQuick?: (type: "reply" | "replyAll" | "forward") => void;
  onMobileBack?: () => void;
  // Reply Composer
  replyText: string;
  onReplyTextChange: (val: string) => void;
  onSendReply: () => void;
  isSendingReply?: boolean;
  className?: string;
}

export function getInitials(name?: string, emailAddress?: string) {
  if (name) {
    return name.split(" ")
               .map(word => word[0])
               .join("")
               .toUpperCase()
               .substring(0, 2);
  }
  return emailAddress ? emailAddress[0].toUpperCase() : "?";
}

export function getAvatarColor(emailAddress?: string) {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#D4A5A5"];
  if (!emailAddress) return colors[0];
  let sum = 0;
  for (let i = 0; i < emailAddress.length; i++) {
    sum += emailAddress.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export function EmailDetailPane({
  thread,
  messages,
  fallbackSubject = "(No Subject)",
  fallbackSender = { name: "Sender", email: "" },
  fallbackDate = "",
  fallbackRecipients = "",
  fallbackSnippet = "",
  isStarred = false,
  isImportant = false,
  isLoading = false,
  onToggleStar,
  onToggleImportant,
  onDelete,
  onArchive,
  onMarkUnread,
  onReplyQuick,
  onMobileBack,
  replyText,
  onReplyTextChange,
  onSendReply,
  isSendingReply = false,
  className,
}: EmailDetailPaneProps) {
  const latestMessage = messages[messages.length - 1] || null;

  const subject = thread?.subject || latestMessage?.subject || fallbackSubject;
  const senderName = latestMessage?.fromName || fallbackSender.name || "Sender";
  const senderEmail = latestMessage?.fromEmail || fallbackSender.email || "";
  
  const formatRecipients = (recs?: any[]) => {
    if (!recs || recs.length === 0) return "";
    return recs.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(", ");
  };

  const toStr = formatRecipients(latestMessage?.toRecipients) || latestMessage?.to?.join(", ") || fallbackRecipients || "";
  const ccStr = formatRecipients(latestMessage?.ccRecipients);
  const displayDate = fallbackDate;

  if (isLoading && !latestMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#919EAB]">
        <CircularProgress size={24} />
        <span className="text-xs">Loading email thread...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 min-w-0 flex flex-col overflow-hidden bg-transparent font-['Public_Sans',sans-serif]",
        className
      )}
    >
      {/* Top Action Bar */}
      <div className="h-12 px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        {/* Mobile Back Button */}
        {onMobileBack && (
          <button
            type="button"
            onClick={onMobileBack}
            className="flex md:hidden items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <span>List</span>
          </button>
        )}

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <button
            type="button"
            onClick={onToggleStar}
            className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Star"
          >
            {isStarred ? (
              <StarIcon sx={{ fontSize: 19, color: "#F59E0B" }} />
            ) : (
              <StarBorderOutlinedIcon sx={{ fontSize: 19 }} />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleImportant}
            className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Important"
          >
            {isImportant ? (
              <LabelImportantOutlinedIcon sx={{ fontSize: 19, color: "#F59E0B" }} />
            ) : (
              <LabelImportantOutlinedIcon sx={{ fontSize: 19 }} />
            )}
          </button>

          {onArchive && (
            <button
              type="button"
              onClick={onArchive}
              className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Archive"
            >
              <ArchiveOutlinedIcon sx={{ fontSize: 19 }} />
            </button>
          )}

          {onMarkUnread && (
            <button
              type="button"
              onClick={onMarkUnread}
              className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Mark unread"
            >
              <MailOutlineIcon sx={{ fontSize: 19 }} />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-[#637381] hover:text-rose-600 dark:text-[#919EAB] dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete"
          >
            <DeleteOutlineIcon sx={{ fontSize: 19 }} />
          </button>

          <button
            type="button"
            className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="More"
          >
            <MoreVertIcon sx={{ fontSize: 19 }} />
          </button>
        </div>
      </div>

      {/* Subject Header & Quick Reply Actions */}
      <div className="px-5 sm:px-7 pt-4 pb-1 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <h1 className="text-[15px] sm:text-[16px] font-bold text-[#1C252E] dark:text-white tracking-tight leading-snug">
            {subject}
          </h1>

          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-[#637381] dark:text-[#919EAB]">
              <button
                type="button"
                onClick={() => onReplyQuick?.("reply")}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reply"
              >
                <ReplyIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => onReplyQuick?.("replyAll")}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reply all"
              >
                <ReplyAllIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => onReplyQuick?.("forward")}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Forward"
              >
                <ForwardIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
            <span className="text-[11px] text-[#919EAB] font-normal mt-0.5">
              {displayDate}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle Dashed Divider */}
      <div className="border-b border-dashed border-slate-200 dark:border-slate-800 mx-5 sm:mx-7 my-3" />

      {/* Sender Info Row */}
      <div className="px-5 sm:px-7 py-1 flex items-start gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5 shadow-2xs"
          style={{ backgroundColor: getAvatarColor(senderEmail) }}
        >
          {getInitials(senderName, senderEmail)}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-baseline gap-1.5 leading-snug">
            <span className="text-[13.5px] font-bold text-[#1C252E] dark:text-white">
              {senderName}
            </span>
            {senderEmail && (
              <span className="text-[12px] text-[#637381] dark:text-[#919EAB]">
                &lt;{senderEmail}&gt;
              </span>
            )}
          </div>
          <span className="text-[11.5px] text-[#919EAB] mt-0.5 truncate">
            To: {toStr}
          </span>
          {ccStr && (
            <span className="text-[11.5px] text-[#919EAB] truncate">
              Cc: {ccStr}
            </span>
          )}
        </div>
      </div>

      {/* Email Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-4 text-[13.5px] text-[#212B36] dark:text-slate-200 leading-relaxed font-normal">
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              return (
                <div key={msg._id} className={cn(!isLast && "pb-4 border-b border-slate-100 dark:border-slate-800/60")}>
                  {msg.bodyHtml ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-[#212B36] dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.bodyText || "(No message body)"}</p>
                  )}

                  {/* Message Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {msg.attachments.map((att, aIdx) => (
                        <a
                          key={aIdx}
                          href={att.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span>📎 {att.fileName}</span>
                          <span className="text-[10px] text-muted-foreground">({Math.round(att.sizeBytes / 1024)} KB)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{fallbackSnippet || "(No content)"}</p>
        )}
      </div>

      {/* Bottom Rich-Text Reply Composer */}
      <div className="p-4 sm:p-6 pt-2 shrink-0">
        <EmailEditor
          value={replyText}
          onChange={onReplyTextChange}
          onSend={onSendReply}
          isSending={isSendingReply}
          placeholder="Write a message..."
        />
      </div>
    </div>
  );
}
