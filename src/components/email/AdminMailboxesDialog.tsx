"use client";

import React, { useState } from "react";
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Mail,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Building2,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMailboxes } from "@/hooks/useEmail";
import { AdminMailboxStatusItem } from "@/types/email";
import { toast } from "sonner";

interface AdminMailboxesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVATAR_COLORS = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40",
];

export const AdminMailboxesDialog: React.FC<AdminMailboxesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data, isLoading, refetch, isRefetching } = useAdminMailboxes(open);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "auth_failed" | "disconnected">("all");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const items: AdminMailboxStatusItem[] = data?.data || [];

  const handleCopyEmail = (emailStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!emailStr) return;
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(emailStr);
    toast.success("Email address copied to clipboard");
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  const getInitials = (name?: string) => {
    if (!name) return "EM";
    const parts = name.trim().split(/[\s@.]+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  const formatLastSync = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  // Metrics counts
  const totalCount = items.length;
  const connectedCount = items.filter((i) => i.connectionStatus === "connected").length;
  const failedCount = items.filter((i) => i.connectionStatus === "auth_failed").length;
  const disconnectedCount = items.filter((i) => i.connectionStatus === "disconnected" || !i.connectionStatus).length;

  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.connectionStatus !== statusFilter) {
      if (statusFilter === "disconnected" && item.connectionStatus && item.connectionStatus !== "disconnected") {
        return false;
      }
      if (statusFilter !== "disconnected" && item.connectionStatus !== statusFilter) {
        return false;
      }
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = item.userId?.name?.toLowerCase() || "";
    const loginEmail = item.userId?.email?.toLowerCase() || "";
    const mailboxEmail = item.emailAddress?.toLowerCase() || "";
    return name.includes(q) || loginEmail.includes(q) || mailboxEmail.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected</span>
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge
            variant="outline"
            className="h-5 px-2 gap-1 bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-bold shadow-2xs"
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
            className="h-5 px-2 gap-1 bg-muted/60 text-muted-foreground border-border/80 text-[10px] font-semibold shadow-2xs"
          >
            <XCircle className="h-3 w-3" />
            <span>Offline</span>
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px] md:max-w-[940px] w-[95vw] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl bg-card/95 backdrop-blur-md">
        {/* Top Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/70 bg-gradient-to-r from-primary/10 via-primary/5 to-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shadow-2xs shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
                  <span>Organization Employee Mailboxes</span>
                  <Badge variant="outline" className="h-5 px-2 text-[10px] font-bold bg-primary/10 text-primary border-primary/25">
                    Admin
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Real-time status overview of company mailboxes, IMAP sync health, and authentication status.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="h-8 px-3 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-muted/50 ml-auto shadow-2xs transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Stats Metrics Cards Bar */}
        <div className="p-3 sm:p-4 border-b border-border/60 bg-muted/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div
            onClick={() => setStatusFilter("all")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-primary/10 border-primary/30 shadow-2xs"
                : "bg-card/70 border-border/60 hover:bg-muted/40"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Accounts</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-black text-foreground">{totalCount}</span>
              <Users className="h-4 w-4 text-primary opacity-80" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("connected")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "connected"
                ? "bg-emerald-500/15 border-emerald-500/30 shadow-2xs"
                : "bg-card/70 border-border/60 hover:bg-muted/40"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Connected</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{connectedCount}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-80" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("auth_failed")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "auth_failed"
                ? "bg-destructive/15 border-destructive/30 shadow-2xs"
                : "bg-card/70 border-border/60 hover:bg-muted/40"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">Auth Issues</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-black text-destructive">{failedCount}</span>
              <AlertTriangle className="h-4 w-4 text-destructive opacity-80" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("disconnected")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "disconnected"
                ? "bg-muted border-border shadow-2xs"
                : "bg-card/70 border-border/60 hover:bg-muted/40"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Offline</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-black text-muted-foreground">{disconnectedCount}</span>
              <XCircle className="h-4 w-4 text-muted-foreground/80" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 border-b border-border/60 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or email..."
              className="h-8.5 text-xs pl-8 pr-7 rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Active Filter indicator */}
          {statusFilter !== "all" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-auto">
              <span>Filter:</span>
              <Badge variant="secondary" className="gap-1 h-5 text-[10px] font-bold uppercase">
                {statusFilter.replace("_", " ")}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="p-0.5 rounded hover:bg-muted"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Content Body: Responsive Table on Desktop, Cards on Mobile */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain scrollbar-thin">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="h-14 w-14 rounded-2xl bg-muted/50 border border-border/70 flex items-center justify-center mb-3.5 text-muted-foreground/60 shadow-2xs">
                <Mail className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-foreground">No employee mailboxes found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                {search
                  ? `No employees match "${search}". Try another keyword or clear search.`
                  : statusFilter !== "all"
                  ? `No employee mailboxes with status "${statusFilter}".`
                  : "Employees can connect their individual work mailboxes directly from their Email page."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View: Clean Responsive Cards (< 640px) */}
              <div className="space-y-3 sm:hidden">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-2xl border border-border/70 bg-card/80 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border border-border/60 shrink-0 text-xs shadow-2xs">
                          <AvatarFallback className={`font-bold text-[11px] ${getAvatarColor(item.userId?.name)}`}>
                            {getInitials(item.userId?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{item.userId?.name || "Employee"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{item.userId?.email}</p>
                        </div>
                      </div>

                      {getStatusBadge(item.connectionStatus)}
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mailbox Address</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(item.emailAddress, e)}
                          className="hover:text-foreground text-muted-foreground transition-colors p-0.5"
                          title="Copy mailbox email"
                        >
                          {copiedEmail === item.emailAddress ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-foreground font-semibold truncate" title={item.emailAddress}>
                        {item.emailAddress || "Not connected"}
                      </p>
                    </div>

                    {item.lastSyncError && (
                      <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-[10px] text-destructive leading-tight flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="truncate">{item.lastSyncError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Synced: {formatLastSync(item.lastSyncedAt)}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-muted-foreground/80">
                        {item.isActive ? "Account Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Elevated Modern Table (>= 640px) */}
              <div className="hidden sm:block border border-border/70 rounded-2xl overflow-hidden shadow-2xs bg-card/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/30 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Connected Mailbox</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Last Synced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredItems.map((item) => (
                        <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                          {/* Employee info with Avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 border border-border/60 shrink-0 text-xs shadow-2xs">
                                <AvatarFallback className={`font-bold text-[11px] ${getAvatarColor(item.userId?.name)}`}>
                                  {getInitials(item.userId?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground text-xs">{item.userId?.name || "Employee"}</p>
                                <p className="text-[11px] text-muted-foreground font-mono truncate">{item.userId?.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Connected Mailbox */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground font-medium">
                              <span className="truncate max-w-[220px]" title={item.emailAddress}>
                                {item.emailAddress || "Not connected"}
                              </span>
                              {item.emailAddress && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyEmail(item.emailAddress, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted/70 rounded text-muted-foreground hover:text-foreground"
                                  title="Copy email"
                                >
                                  {copiedEmail === item.emailAddress ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {getStatusBadge(item.connectionStatus)}
                              {item.lastSyncError && (
                                <p className="text-[10px] text-destructive max-w-xs truncate" title={item.lastSyncError}>
                                  {item.lastSyncError}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Last Synced */}
                          <td className="px-4 py-3 text-right text-muted-foreground text-[11px] font-medium">
                            <div className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/70" />
                              <span>{formatLastSync(item.lastSyncedAt)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer: Privacy Protected Guarantee */}
        <div className="p-3 sm:p-3.5 border-t border-border/70 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Privacy Guaranteed:</strong> Individual email message bodies and attachments are strictly confidential to the employee.
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs font-semibold rounded-xl border-border/70 hover:bg-muted/50 ml-auto"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
