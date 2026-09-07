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
  ShieldAlert
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMailboxes } from "@/hooks/useEmail";
import { AdminMailboxStatusItem } from "@/types/email";

interface AdminMailboxesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminMailboxesDialog: React.FC<AdminMailboxesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data, isLoading, refetch, isRefetching } = useAdminMailboxes(open);
  const [search, setSearch] = useState("");

  const items: AdminMailboxStatusItem[] = data?.data || [];

  const filteredItems = items.filter((item) => {
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
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Connected</span>
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/20 font-medium">
            <AlertTriangle className="h-3 w-3" />
            <span>Auth Failed</span>
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-muted/70 text-muted-foreground border-border font-medium">
            <XCircle className="h-3 w-3" />
            <span>Disconnected</span>
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/80 shadow-lg">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Organization Employee Mailboxes
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/70"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Status overview of all employee mailboxes and IMAP sync status (privacy preserved: email body contents are not visible).
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="p-3 border-b border-border/70 bg-background/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or email address..."
              className="h-8.5 text-xs pl-8 rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-center mb-3 text-muted-foreground/60">
                <Mail className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-foreground">No employee mailboxes found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
                Employees can connect their individual work mailboxes directly from their Email page.
              </p>
            </div>
          ) : (
            <div className="border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground">
                    <tr>
                      <th className="px-3.5 py-2.5">Employee</th>
                      <th className="px-3.5 py-2.5">Connected Mailbox</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">Last Synced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3.5 py-3">
                          <p className="font-bold text-foreground">{item.userId?.name || "Employee"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{item.userId?.email}</p>
                        </td>

                        <td className="px-3.5 py-3 font-mono text-[11px] text-foreground font-medium">
                          {item.emailAddress}
                        </td>

                        <td className="px-3.5 py-3">
                          {getStatusBadge(item.connectionStatus)}
                          {item.lastSyncError && (
                            <p className="text-[10px] text-destructive mt-1 max-w-xs truncate" title={item.lastSyncError}>
                              {item.lastSyncError}
                            </p>
                          )}
                        </td>

                        <td className="px-3.5 py-3 text-muted-foreground text-[11px]">
                          {item.lastSyncedAt
                            ? new Date(item.lastSyncedAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
