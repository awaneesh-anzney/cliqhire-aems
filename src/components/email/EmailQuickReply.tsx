"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Reply, 
  ReplyAll, 
  Maximize2, 
  PenTool, 
  Paperclip, 
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseContactString } from "./EmailRecipientBadges";

interface EmailQuickReplyProps {
  replyTargetEmail: string;
  allRecipients?: string[];
  isReplyAllAvailable?: boolean;
  defaultSignature?: { name: string; contentHtml: string } | null;
  onSend: (text: string, includeSignature: boolean, isReplyAll: boolean) => void;
  isSending?: boolean;
  onOpenFullComposer?: (replyData: {
    to: string;
    cc?: string;
    subject: string;
    text?: string;
  }) => void;
  subject: string;
}

export const EmailQuickReply: React.FC<EmailQuickReplyProps> = ({
  replyTargetEmail,
  allRecipients = [],
  isReplyAllAvailable = false,
  defaultSignature,
  onSend,
  isSending = false,
  onOpenFullComposer,
  subject,
}) => {
  const [text, setText] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [isReplyAll, setIsReplyAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parsedTarget = parseContactString(replyTargetEmail) || {
    name: replyTargetEmail,
    email: replyTargetEmail,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isSending) return;
    onSend(text, includeSignature, isReplyAll);
    setText("");
  };

  const targetCcEmails = isReplyAll
    ? allRecipients.filter((r) => r.toLowerCase() !== replyTargetEmail.toLowerCase())
    : [];

  return (
    <div className="p-3.5 sm:p-4 border-t border-border/70 bg-card/90 backdrop-blur-md space-y-2.5 shrink-0 transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
      {/* Top row of Quick Reply: Mode selector & recipient status */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Reply vs Reply All Pill Switcher */}
          {isReplyAllAvailable && allRecipients.length > 1 ? (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setIsReplyAll(false)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  !isReplyAll
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReplyAll(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  isReplyAll
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ReplyAll className="h-3 w-3" />
                <span>Reply All ({allRecipients.length})</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-600" />
              <span>Quick Reply</span>
            </span>
          )}

          {/* Active target badge */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            <span className="font-semibold">To:</span>
            <span className="font-mono text-foreground font-medium truncate max-w-[160px] sm:max-w-[240px]">
              {parsedTarget.name}
            </span>
            {isReplyAll && targetCcEmails.length > 0 && (
              <span className="text-muted-foreground text-[10px]">
                +{targetCcEmails.length} more in Cc
              </span>
            )}
          </div>
        </div>

        {/* Signature selector & Full Composer Button */}
        <div className="flex items-center gap-2 ml-auto">
          {defaultSignature && (
            <button
              type="button"
              onClick={() => setIncludeSignature(!includeSignature)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                includeSignature
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
              }`}
              title={includeSignature ? "Signature will be attached" : "Signature omitted"}
            >
              <PenTool className="h-2.5 w-2.5 text-amber-500" />
              <span className="hidden sm:inline">Sig:</span>
              <span className="font-bold truncate max-w-[90px]">{defaultSignature.name}</span>
            </button>
          )}

          {onOpenFullComposer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenFullComposer({
                  to: replyTargetEmail,
                  cc: isReplyAll ? targetCcEmails.join(", ") : undefined,
                  subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
                  text,
                });
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium transition-colors gap-1"
              title="Open in full rich-text editor"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Full Editor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Reply Textarea */}
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Write your reply to ${parsedTarget.name}... (Press Ctrl+Enter to send)`}
        rows={3}
        className="text-xs sm:text-sm resize-none bg-background border-border/80 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 shadow-2xs leading-relaxed p-3"
      />

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
          Pro-tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">Ctrl+Enter</kbd> to quickly send
        </span>

        <Button
          size="sm"
          disabled={!text.trim() || isSending}
          onClick={handleSend}
          className="h-8.5 px-4 text-xs gap-1.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xs shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ml-auto"
        >
          {isSending ? (
            <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          <span>Send Reply</span>
        </Button>
      </div>
    </div>
  );
};
