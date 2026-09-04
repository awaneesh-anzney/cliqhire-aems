"use client";

import React from "react";
import Link from "next/link";
import { 
  Mail, 
  PenSquare, 
  RefreshCw, 
  Search, 
  Settings, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mailbox, MailboxConnectionStatus } from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";

interface EmailHeaderProps {
  mailbox: Mailbox | null;
  isConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onComposeClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
  onOpenAdminMailboxes?: () => void;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  mailbox,
  isConnected,
  searchQuery,
  onSearchChange,
  onComposeClick,
  onRefreshClick,
  isRefreshing = false,
  onOpenAdminMailboxes,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const getStatusBadge = (status?: MailboxConnectionStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="h-6 gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge variant="outline" className="h-6 gap-1 bg-destructive/10 text-destructive border-destructive/30 text-[11px] font-medium">
            <AlertTriangle className="h-3 w-3" />
            Auth Failed
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge variant="outline" className="h-6 gap-1 bg-muted text-muted-foreground border-border text-[11px] font-medium">
            <XCircle className="h-3 w-3" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border rounded-xl p-3 sm:p-4 shadow-xs">
      {/* Left side: Brand, Title, and Mailbox status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <Mail className="h-5 w-5" />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Mailbox & Communications
            </h1>
            {getStatusBadge(mailbox?.connectionStatus)}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            {isConnected && mailbox?.emailAddress ? (
              <span className="font-mono text-foreground/80 font-medium truncate">
                {mailbox.displayName ? `${mailbox.displayName} <${mailbox.emailAddress}>` : mailbox.emailAddress}
              </span>
            ) : (
              <span>Connect your organizational mailbox to send and receive candidate emails.</span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Search, Compose CTA, Admin Tools */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Search input */}
        <div className="relative w-full sm:w-56 md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search emails, subjects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 border-border/80 rounded-lg"
          />
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshClick}
          disabled={isRefreshing || !isConnected}
          className="h-8 w-8 p-0"
          title="Refresh Inbox"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>

        {/* Compose CTA */}
        <Button
          size="sm"
          onClick={onComposeClick}
          disabled={!isConnected}
          className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-medium"
        >
          <PenSquare className="h-3.5 w-3.5" />
          Compose
        </Button>

        {/* Admin Tools */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 border-l pl-2 ml-1">
            {onOpenAdminMailboxes && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAdminMailboxes}
                className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="View all employee mailboxes"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Team Mailboxes</span>
              </Button>
            )}

            <Link href="/settings?tab=email">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Email Provider Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
