"use client";

import React, { useState, useRef } from "react";
import { 
  Send, 
  Reply, 
  ReplyAll, 
  Maximize2, 
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="p-2.5 sm:p-3 border-t border-border/70 bg-card/95 backdrop-blur-md space-y-2 shrink-0 transition-all shadow-[0_-2px_10px_rgba(0,0,0,0.02)] dark:shadow-none">
      {/* Top row of Quick Reply: Compact mode selector & recipient status */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Reply vs Reply All Pill Switcher */}
          {isReplyAllAvailable && allRecipients.length > 1 ? (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setIsReplyAll(false)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                  !isReplyAll
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Reply className="h-2.5 w-2.5" />
                <span>Reply</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReplyAll(true)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                  isReplyAll
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ReplyAll className="h-2.5 w-2.5" />
                <span>Reply All ({allRecipients.length})</span>
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-600" />
              <span>Quick Reply</span>
            </span>
          )}

          {/* Active target badge */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            <span className="font-semibold text-[10px]">To:</span>
            <span className="font-mono text-foreground font-medium truncate max-w-[160px] sm:max-w-[240px]">
              {parsedTarget.name}
            </span>
            {isReplyAll && targetCcEmails.length > 0 && (
              <span className="text-muted-foreground text-[10px]">
                +{targetCcEmails.length} in Cc
              </span>
            )}
          </div>
        </div>

        {/* Signature selector & Full Composer Button */}
        <div className="flex items-center gap-1.5 ml-auto">
          {defaultSignature && (
            <button
              type="button"
              onClick={() => setIncludeSignature(!includeSignature)}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                includeSignature
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
              }`}
              title={includeSignature ? "Signature will be attached" : "Signature omitted"}
            >
              <PenTool className="h-2.5 w-2.5 text-amber-500" />
              <span className="hidden sm:inline">Sig:</span>
              <span className="font-bold truncate max-w-[80px]">{defaultSignature.name}</span>
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
              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium transition-colors gap-1"
              title="Open in full rich-text editor"
            >
              <Maximize2 className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Full Editor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Compact Reply Textarea */}
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Write your reply to ${parsedTarget.name}... (Press Ctrl+Enter to send)`}
        rows={2}
        className="text-xs sm:text-sm resize-none bg-background border-border/80 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/40 shadow-2xs leading-relaxed py-2 px-3 min-h-[52px]"
      />

      {/* Bottom Action Footer: Streamlined Height */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
          Press <kbd className="px-1 py-0.2 rounded bg-muted border border-border text-[9px] font-mono">Ctrl+Enter</kbd> to send
        </span>

        <Button
          size="sm"
          disabled={!text.trim() || isSending}
          onClick={handleSend}
          className="h-7.5 px-3.5 text-xs gap-1.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xs shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.01] active:scale-95 ml-auto"
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
