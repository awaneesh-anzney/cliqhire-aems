"use client";

import React from "react";
import { Mail, PenSquare, Sparkles, Inbox, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailEmptyStateProps {
  onCompose?: () => void;
}

export const EmailEmptyState: React.FC<EmailEmptyStateProps> = ({ onCompose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-card border border-border/80 rounded-2xl p-8 text-center text-muted-foreground shadow-xs">
      {/* Decorative Brand Accent Icon */}
      <div className="relative mb-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/25 flex items-center justify-center text-blue-600 shadow-sm">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow-xs">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-foreground">Select a conversation</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
        Choose an email thread from the left to view messages, inspect recipients and attachments, or send quick replies.
      </p>

      {onCompose && (
        <Button
          onClick={onCompose}
          variant="outline"
          size="sm"
          className="mt-6 h-9 px-4 gap-2 text-xs font-semibold rounded-xl border-border/70 hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-2xs"
        >
          <PenSquare className="h-3.5 w-3.5 text-blue-600" />
          <span>Compose New Message</span>
        </Button>
      )}

      {/* Feature highlight badges */}
      <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 gap-4 max-w-sm text-left">
        <div className="flex items-start gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
          <div className="text-[11px]">
            <p className="font-semibold text-foreground">Secure Synchronization</p>
            <p className="text-muted-foreground text-[10px]">Real-time IMAP/SMTP synced directly</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          <div className="text-[11px]">
            <p className="font-semibold text-foreground">Multi-recipient View</p>
            <p className="text-muted-foreground text-[10px]">Clearly view all To, Cc, and Bcc contacts</p>
          </div>
        </div>
      </div>
    </div>
  );
};
