"use client";

import React, { useState, useEffect } from "react";
import { EmailThread, Email } from "@/types/email";
import { 
  useMarkThreadRead, 
  useSendEmail, 
  useMoveToTrash, 
  useToggleStar,
  useRestoreEmail,
  usePermanentDelete
} from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailThreadHeader } from "./EmailThreadHeader";
import { EmailMessageCard } from "./EmailMessageCard";
import { EmailQuickReply } from "./EmailQuickReply";
import { EmailEmptyState } from "./EmailEmptyState";
import { normalizeContacts } from "./EmailRecipientBadges";
import { toast } from "sonner";

interface EmailThreadDetailProps {
  thread: EmailThread | null;
  messages: Email[];
  isLoading: boolean;
  onClose?: () => void;
  onOpenFullComposer?: (replyData: { 
    to: string; 
    cc?: string;
    bcc?: string;
    subject: string; 
    threadId: string; 
    inReplyTo?: string;
    text?: string;
    html?: string;
  }) => void;
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
  const restoreEmailMutation = useRestoreEmail();
  const permanentDeleteMutation = usePermanentDelete();
  const { defaultReplySignature } = useEmailSignatures();

  // State for expanded messages in multi-message threads
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // When thread or messages change, default the last message to expanded
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const newSet = new Set<string>();
      // If 1 or 2 messages, expand all. If > 2, expand latest message
      if (messages.length <= 2) {
        messages.forEach((m) => {
          if (m._id) newSet.add(m._id);
        });
      } else if (lastMsg?._id) {
        newSet.add(lastMsg._id);
      }
      setExpandedMessageIds(newSet);
    }
  }, [thread?._id, messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card border border-border/80 rounded-2xl p-5 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-6 w-72 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
        <div className="space-y-4 flex-1 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 border border-border/60 rounded-2xl space-y-4 bg-muted/10">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-64 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <EmailEmptyState
        onCompose={
          onOpenFullComposer
            ? () => onOpenFullComposer({ to: "", subject: "", threadId: "" })
            : undefined
        }
      />
    );
  }

  // Calculate reply targets
  const lastReceivedMessage = [...messages].reverse().find((m) => m.direction === "received") || messages[messages.length - 1];
  const replyTargetEmail = lastReceivedMessage?.from || thread.participants[0] || "";

  // Collect all distinct recipient emails across all messages for "Reply All"
  const allRecipientsSet = new Set<string>();
  messages.forEach((msg) => {
    if (msg.from) {
      const parsed = normalizeContacts(msg.from);
      parsed.forEach((p) => allRecipientsSet.add(p.email));
    }
    if (msg.to) {
      const parsed = normalizeContacts(msg.to);
      parsed.forEach((p) => allRecipientsSet.add(p.email));
    }
    if (msg.cc) {
      const parsed = normalizeContacts(msg.cc);
      parsed.forEach((p) => allRecipientsSet.add(p.email));
    }
  });
  const allRecipientsList = Array.from(allRecipientsSet);

  const toggleMessageExpand = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedMessageIds.size === messages.length) {
      // Collapse older ones, keep only latest
      const lastMsg = messages[messages.length - 1];
      const next = new Set<string>();
      if (lastMsg?._id) next.add(lastMsg._id);
      setExpandedMessageIds(next);
    } else {
      // Expand all
      const next = new Set<string>();
      messages.forEach((m) => {
        if (m._id) next.add(m._id);
      });
      setExpandedMessageIds(next);
    }
  };

  const handleQuickReplySend = (text: string, includeSignature: boolean, isReplyAll: boolean) => {
    if (!text.trim() || !thread) return;

    const replySubject = thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`;

    let replyHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;"><p>${text.replace(/\n/g, "<br/>")}</p></div>`;

    if (includeSignature && defaultReplySignature) {
      replyHtml += `<br/><div class="gmail_signature" data-signature-block="true">${defaultReplySignature.contentHtml}</div>`;
    }

    const ccList = isReplyAll
      ? allRecipientsList.filter((r) => r.toLowerCase() !== replyTargetEmail.toLowerCase())
      : undefined;

    sendEmailMutation.mutate(
      {
        to: replyTargetEmail,
        cc: ccList && ccList.length > 0 ? ccList : undefined,
        subject: replySubject,
        html: replyHtml,
        threadId: thread._id,
        inReplyTo: lastReceivedMessage?.messageIdHeader,
      },
      {
        onSuccess: () => {
          toast.success("Reply sent successfully");
        },
      }
    );
  };

  const handleOpenComposerWithData = (to: string, inReplyTo?: string, cc?: string) => {
    if (onOpenFullComposer) {
      onOpenFullComposer({
        to,
        cc,
        subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
        threadId: thread._id,
        inReplyTo,
      });
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs transition-all ${
        isFullscreen ? "fixed inset-2 sm:inset-4 z-50 shadow-2xl" : ""
      }`}
    >
      {/* 1. TOP HEADER TOOLBAR */}
      <EmailThreadHeader
        thread={thread}
        messageCount={messages.length}
        allExpanded={expandedMessageIds.size === messages.length}
        onToggleExpandAll={handleToggleExpandAll}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onClose={onClose}
        onToggleStar={() =>
          toggleStarMutation.mutate({ threadId: thread._id, isStarred: !thread.isStarred })
        }
        onToggleRead={() =>
          markReadMutation.mutate({ threadId: thread._id, isRead: thread.unreadCount <= 0 })
        }
        onOpenReply={() => handleOpenComposerWithData(replyTargetEmail, lastReceivedMessage?.messageIdHeader)}
        onMoveToTrash={() => moveToTrashMutation.mutate(thread._id)}
      />

      {/* 2. MESSAGES SCROLL AREA: Comfortable spacing, readable typography, no cramped bubbles */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 overscroll-contain scrollbar-thin bg-gradient-to-b from-muted/20 via-background to-background">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground bg-card rounded-2xl border border-dashed border-border/80 p-8">
              No message history recorded in this conversation.
            </div>
          ) : (
            messages.map((msg, idx) => {
              const msgId = msg._id || `msg-${idx}`;
              const isExpanded = expandedMessageIds.has(msgId) || messages.length === 1;

              return (
                <EmailMessageCard
                  key={msgId}
                  message={msg}
                  threadSubject={thread.subject}
                  isExpanded={isExpanded}
                  canCollapse={messages.length > 1}
                  onToggleExpand={() => toggleMessageExpand(msgId)}
                  onReply={(to, inReplyTo) => handleOpenComposerWithData(to, inReplyTo)}
                  onReplyAll={(to, cc, inReplyTo) =>
                    handleOpenComposerWithData(to.join(", "), inReplyTo, cc?.join(", "))
                  }
                  onDelete={(id) => moveToTrashMutation.mutate(id)}
                  onRestore={(id) => restoreEmailMutation.mutate(id)}
                  onPermanentDelete={(id) => permanentDeleteMutation.mutate(id)}
                  onComposeTo={(email) => handleOpenComposerWithData(email)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* 3. DOCKED BOTTOM QUICK REPLY BAR */}
      <EmailQuickReply
        replyTargetEmail={replyTargetEmail}
        allRecipients={allRecipientsList}
        isReplyAllAvailable={allRecipientsList.length > 1}
        defaultSignature={defaultReplySignature}
        onSend={handleQuickReplySend}
        isSending={sendEmailMutation.isPending}
        subject={thread.subject}
        onOpenFullComposer={(data) => {
          if (onOpenFullComposer) {
            onOpenFullComposer({
              to: data.to,
              cc: data.cc,
              subject: data.subject,
              threadId: thread._id,
              inReplyTo: lastReceivedMessage?.messageIdHeader,
              text: data.text,
            });
          }
        }}
      />
    </div>
  );
};
