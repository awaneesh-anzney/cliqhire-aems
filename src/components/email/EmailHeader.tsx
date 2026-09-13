"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  PenSquare, 
  RefreshCw, 
  Search, 
  Settings,  
  AlertTriangle, 
  XCircle,
  Menu,
  X,
  PenTool,
  Users,
  ChevronDown,
  LogOut,
  Clock,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mailbox, MailboxConnectionStatus } from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";
import { EmailFolder } from "./EmailSidebar";
import { EmailContactType, EMAIL_TYPE_CONFIG } from "@/types/emailContactTypes";
import { EmailAddressSelector } from "./EmailAddressSelector";
import { useDisconnectMailbox } from "@/hooks/useEmail";

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
  selectedEmailType?: EmailContactType | null;
  onSelectEmailType?: (type: EmailContactType | null) => void;
  selectedEmailAddress?: string | null;
  onSelectEmailAddress?: (email: string | null) => void;
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
  selectedEmailType = null,
  onSelectEmailType,
  selectedEmailAddress = null,
  onSelectEmailAddress,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const disconnectMutation = useDisconnectMailbox();
  const [headerDisconnectOpen, setHeaderDisconnectOpen] = useState(false);

  const formatLastSync = (dateStr?: string | null) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  const getStatusBadge = (status?: MailboxConnectionStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-[11px] font-medium shrink-0 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Connected</span>
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 text-[11px] font-medium shrink-0 shadow-2xs"
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
            className="h-5 px-2 gap-1 bg-muted/40 text-muted-foreground border-border/70 text-[11px] font-medium shrink-0 shadow-2xs"
          >
            <XCircle className="h-3 w-3" />
            <span>Offline</span>
          </Badge>
        );
    }
  };

  return (
    <>
      <header className="flex flex-col gap-2.5 bg-card border border-border/80 rounded-2xl p-2.5 sm:p-3 shadow-xs transition-all">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Left: Mobile Toggle, Brand Icon, Title & Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile drawer toggle */}
            {onOpenMobileNav && (
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenMobileNav}
                className="h-8 w-8 md:hidden shrink-0 border-border/70 text-muted-foreground hover:text-foreground rounded-xl"
                aria-label="Open folders navigation"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            {/* Email Client Logo Icon */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-600/20 via-primary/10 to-primary/5 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Title & Active Filter */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                  {selectedEmailType ? EMAIL_TYPE_CONFIG[selectedEmailType].label : FOLDER_LABELS[activeFolder]}
                </h1>

                {/* Selected Email Address Badge */}
                {selectedEmailAddress && (
                  <Badge
                    variant="outline"
                    className="h-5 pl-2 pr-1 gap-1 text-[11px] font-mono bg-primary/10 text-primary border-primary/25 shrink-0"
                  >
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      {selectedEmailAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectEmailAddress?.(null)}
                      className="p-0.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                      title="Clear selected email address"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}

                {/* Mailbox Status Dropdown Trigger */}
                {isConnected && mailbox ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15 transition-colors cursor-pointer shadow-2xs"
                        title="Click to manage mailbox account"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold hidden sm:inline">Connected</span>
                        <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-xl border-border/70">
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground truncate">{mailbox.displayName || "Work Mailbox"}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground truncate" title={mailbox.emailAddress}>
                          {mailbox.emailAddress}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>Last Synced: {formatLastSync(mailbox.lastSyncedAt)}</span>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="my-1.5" />

                      <DropdownMenuItem onClick={onRefreshClick} className="gap-2 text-xs rounded-xl cursor-pointer">
                        <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                        <span>Sync Mailbox Now</span>
                      </DropdownMenuItem>

                      {onOpenSignatures && (
                        <DropdownMenuItem onClick={onOpenSignatures} className="gap-2 text-xs rounded-xl cursor-pointer">
                          <PenTool className="h-3.5 w-3.5 text-amber-500" />
                          <span>Manage Email Signatures</span>
                        </DropdownMenuItem>
                      )}

                      {isAdmin && (
                        <Link href="/settings?tab=email">
                          <DropdownMenuItem className="gap-2 text-xs rounded-xl cursor-pointer">
                            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Server Configuration</span>
                          </DropdownMenuItem>
                        </Link>
                      )}

                      <DropdownMenuSeparator className="my-1.5" />

                      {/* Header Disconnect Trigger */}
                      <DropdownMenuItem
                        onClick={() => setHeaderDisconnectOpen(true)}
                        className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl cursor-pointer font-semibold"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Disconnect Mailbox</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  getStatusBadge(mailbox?.connectionStatus)
                )}
              </div>

              {/* Sub-header text on desktop */}
              <div className="text-[11px] text-muted-foreground truncate hidden md:block">
                {isConnected && mailbox?.emailAddress ? (
                  <span className="font-mono text-foreground/80 font-medium truncate">
                    {mailbox.displayName ? `${mailbox.displayName} • ${mailbox.emailAddress}` : mailbox.emailAddress}
                  </span>
                ) : (
                  <span>CliqHire Talent Communications Hub</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions, Search, Compose */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search input with clear button (on sm+ screens) */}
            <div className="relative w-44 sm:w-56 md:w-64 lg:w-72">
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
              title="Refresh Mailbox"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </Button>

            {/* Signatures Button */}
            {onOpenSignatures && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSignatures}
                className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl border-border/70 shadow-2xs hover:bg-muted/50 shrink-0 transition-colors hidden sm:inline-flex"
                title="Manage Email Signatures"
              >
                <PenTool className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden lg:inline font-medium">Signatures</span>
              </Button>
            )}

            {/* Stakeholder Selector in Header */}
            <EmailAddressSelector
              initialType={selectedEmailType || "client"}
              selectedEmail={selectedEmailAddress}
              onSelect={(email, contact) => {
                onSelectEmailType?.(contact.type);
                onSelectEmailAddress?.(email);
              }}
              onClear={() => onSelectEmailAddress?.(null)}
              title="Select Email Address"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-2.5 gap-1.5 text-xs rounded-xl border-border/70 shadow-2xs hover:bg-muted/50 shrink-0 transition-colors hidden sm:inline-flex ${
                    selectedEmailAddress
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Select contact address"
                >
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden xl:inline">
                    {selectedEmailAddress ? selectedEmailAddress : "Contacts"}
                  </span>
                  {selectedEmailAddress && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmailAddress?.(null);
                      }}
                      className="p-0.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              }
            />

            {/* Compose CTA */}
            <Button
              size="sm"
              onClick={onComposeClick}
              disabled={!isConnected}
              className="h-8 px-3 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold rounded-xl shrink-0 transition-transform active:scale-[0.98]"
            >
              <PenSquare className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Compose</span>
            </Button>

            {/* Admin Tools */}
            {isAdmin && onOpenAdminMailboxes && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAdminMailboxes}
                className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl border-border/70 shadow-2xs hidden 2xl:inline-flex"
                title="View team employee mailboxes"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Team Mailboxes</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Dialog for Header Disconnect Trigger */}
      <AlertDialog open={headerDisconnectOpen} onOpenChange={setHeaderDisconnectOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Disconnect Mailbox?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will pause incoming IMAP sync for this account. Your past sent and received email history will remain safely preserved in CliqHire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                disconnectMutation.mutate();
                setHeaderDisconnectOpen(false);
              }}
              className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl"
            >
              Disconnect Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
