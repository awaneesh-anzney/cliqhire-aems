"use client";

import React, { useState } from "react";
import { 
  Inbox, 
  Star, 
  Send, 
  Archive, 
  PenSquare, 
  LogOut, 
  CheckCircle2, 
  Clock,
  Shield,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mailbox } from "@/types/email";
import { useDisconnectMailbox } from "@/hooks/useEmail";

export type EmailFolder = "inbox" | "starred" | "sent" | "drafts" | "trash";

interface EmailSidebarProps {
  activeFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  onComposeClick: () => void;
  unreadCount?: number;
  mailbox: Mailbox | null;
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  activeFolder,
  onFolderChange,
  onComposeClick,
  unreadCount = 0,
  mailbox,
}) => {
  const disconnectMutation = useDisconnectMailbox();
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const formatLastSync = (dateStr?: string | null) => {
    if (!dateStr) return "Not synced yet";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  const navItems: { id: EmailFolder; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, badge: unreadCount },
    { id: "starred", label: "Starred", icon: Star },
    { id: "sent", label: "Sent Mail", icon: Send },
    { id: "drafts", label: "Drafts", icon: FileText },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  return (
    <div className="flex flex-col justify-between h-full bg-card border rounded-xl p-3 shadow-xs min-h-[500px]">
      {/* Top Section */}
      <div className="space-y-3">
        {/* Compose Button */}
        <Button
          onClick={onComposeClick}
          className="w-full h-9 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs justify-start px-3.5"
        >
          <PenSquare className="h-4 w-4" />
          <span>New Message</span>
        </Button>

        {/* Navigation Folders */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFolder === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onFolderChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Mailbox Health & Disconnect */}
      <div className="pt-3 border-t space-y-3">
        {mailbox && (
          <div className="p-2.5 rounded-lg bg-muted/30 border space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground truncate max-w-[140px]">
                {mailbox.displayName || "Mailbox"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <p className="text-muted-foreground truncate font-mono text-[10px]">
              {mailbox.emailAddress}
            </p>

            <div className="flex items-center gap-1 text-muted-foreground text-[10px] pt-0.5">
              <Clock className="h-3 w-3" />
              <span>Synced at {formatLastSync(mailbox.lastSyncedAt)}</span>
            </div>

            {mailbox.sentFolderDetected === false && (
              <div className="flex items-center gap-1 text-amber-500 text-[10px] pt-0.5 mt-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Sent folder not detected</span>
              </div>
            )}
          </div>
        )}

        {/* Disconnect Mailbox Dialog */}
        <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start px-2.5 gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Disconnect Mailbox</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base">Disconnect Mailbox?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                This will pause incoming IMAP sync for this account. Your past sent and received email history will remain safely preserved in CliqHire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  disconnectMutation.mutate();
                  setDisconnectOpen(false);
                }}
                className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
