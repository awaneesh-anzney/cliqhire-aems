"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search,
  Mail,
  Clock
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
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "auth_failed":
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-destructive/10 text-destructive border-destructive/30">
            <AlertTriangle className="h-3 w-3" />
            Auth Failed
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-muted text-muted-foreground border-border">
            <XCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Organization Employee Mailboxes
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="h-7 px-2 text-xs gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Status overview of all connected employee email mailboxes and sync diagnostics (status only, message contents are private).
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="p-3 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or email address..."
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Mail className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">No employee mailboxes found</p>
              <p className="text-[11px] mt-0.5">
                Employees can connect their individual mailboxes from their email tab.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Connected Mailbox</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">{item.userId?.name || "Employee"}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{item.userId?.email}</p>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[11px] text-foreground">
                        {item.emailAddress}
                      </td>

                      <td className="px-3 py-2.5">
                        {getStatusBadge(item.connectionStatus)}
                        {item.lastSyncError && (
                          <p className="text-[10px] text-destructive mt-0.5 max-w-xs truncate" title={item.lastSyncError}>
                            {item.lastSyncError}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-muted-foreground text-[11px]">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
