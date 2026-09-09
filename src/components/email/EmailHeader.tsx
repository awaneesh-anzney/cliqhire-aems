"use client";

import React from "react";
import Link from "next/link";
import { 
  Mail, 
  PenSquare, 
  RefreshCw, 
  Search, 
  Settings, 
  Users, 
  AlertTriangle, 
  XCircle,
  Menu,
  X,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mailbox, MailboxConnectionStatus } from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";
import { EmailFolder } from "./EmailSidebar";

interface EmailHeaderProps {
  mailbox: Mailbox | null;
  isConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onComposeClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
  onOpenAdminMailboxes?: () => void;
  onOpenMobileNav?: () => void;
  onOpenSignatures?: () => void;
  activeFolder?: EmailFolder;
}

const FOLDER_LABELS: Record<EmailFolder, string> = {
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  trash: "Trash",
};

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  mailbox,
  isConnected,
  searchQuery,
  onSearchChange,
  onComposeClick,
  onRefreshClick,
  isRefreshing = false,
  onOpenAdminMailboxes,
  onOpenMobileNav,
  onOpenSignatures,
  activeFolder = "inbox",
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const getStatusBadge = (status?: MailboxConnectionStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Connected</span>
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium shrink-0"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Auth Failed</span>
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1 bg-muted/40 text-muted-foreground border-border/70 text-[11px] font-medium shrink-0"
          >
            <XCircle className="h-3 w-3" />
            <span>Offline</span>
          </Badge>
        );
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 bg-card/85 backdrop-blur-md border border-border/60 rounded-2xl p-2.5 sm:p-3.5 shadow-xs transition-all">
      {/* Left side: Mobile menu toggle, Brand icon, Title, Connection badge */}
      <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile drawer toggle */}
          {onOpenMobileNav && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenMobileNav}
              className="h-8 w-8 sm:hidden shrink-0 border-border/70 text-muted-foreground hover:text-foreground rounded-xl"
              aria-label="Open folders navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          {/* Mail Icon */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          {/* Title & Current Account */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                {FOLDER_LABELS[activeFolder]}
              </h1>
              {getStatusBadge(mailbox?.connectionStatus)}
            </div>

            <div className="text-[11px] text-muted-foreground truncate hidden md:block">
              {isConnected && mailbox?.emailAddress ? (
                <span className="font-mono text-foreground/80 font-medium truncate">
                  {mailbox.displayName ? `${mailbox.displayName} • ${mailbox.emailAddress}` : mailbox.emailAddress}
                </span>
              ) : (
                <span>CliqHire Talent Communications</span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only Compose CTA */}
        <div className="flex sm:hidden items-center gap-1.5">
          <Button
            size="sm"
            onClick={onComposeClick}
            disabled={!isConnected}
            className="h-8 px-2.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold rounded-xl"
          >
            <PenSquare className="h-3.5 w-3.5" />
            <span>Compose</span>
          </Button>
        </div>
      </div>

      {/* Right side: Search, Signatures, Refresh, Desktop Compose, Admin tools */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Search input with clear button */}
        <div className="relative flex-1 sm:w-60 md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
          <Input
            placeholder="Search emails, contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-muted/30 border-border/60 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/60 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshClick}
          disabled={isRefreshing || !isConnected}
          className="h-8 w-8 p-0 shrink-0 rounded-xl border-border/70 hover:bg-muted/50"
          title="Refresh Inbox"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>

        {/* Signatures Shortcut Button */}
        {onOpenSignatures && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSignatures}
            className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl border-border/70 shadow-2xs hover:bg-muted/50 shrink-0 transition-colors"
            title="Manage Email Signatures"
          >
            <PenTool className="h-3.5 w-3.5 text-primary" />
            <span className="hidden md:inline font-medium">Signatures</span>
          </Button>
        )}

        {/* Desktop Compose CTA */}
        <Button
          size="sm"
          onClick={onComposeClick}
          disabled={!isConnected}
          className="hidden sm:inline-flex h-8 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold rounded-xl shrink-0 transition-transform active:scale-[0.98]"
        >
          <PenSquare className="h-3.5 w-3.5" />
          <span>Compose</span>
        </Button>

        {/* Admin Tools */}
        {isAdmin && (
          <div className="flex items-center gap-1 border-l border-border/60 pl-2 ml-0.5 shrink-0">
            {onOpenAdminMailboxes && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAdminMailboxes}
                className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl border-border/70 shadow-2xs"
                title="View team employee mailboxes"
              >
                <Users className="h-3.5 w-3.5 text-primary/80" />
                <span className="hidden xl:inline">Team Mailboxes</span>
              </Button>
            )}

            <Link href="/settings?tab=email">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                title="Email Server Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
