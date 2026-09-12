"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  Trash2,
  CheckCheck,
  Inbox,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  AlertTriangle,
  RotateCw,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
  useNotificationActions,
} from "@/hooks/useNotifications";
import { Notification } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketProvider";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type CategoryFilter =
  | "all"
  | "unread"
  | "urgent"
  | "candidates"
  | "jobs"
  | "clients"
  | "security";

export function NotificationsClient() {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();

  // State
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10; // Compact single-screen page limit

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClearReadDialogOpen, setIsClearReadDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Queries
  const { data: countData, refetch: refetchCount } =
    useUnreadNotificationsCountQuery(isAuthenticated);

  const {
    data: notificationsData,
    isLoading,
    isRefetching,
    refetch: refetchNotifications,
  } = useNotificationsQuery({
    page,
    limit,
    unreadOnly: activeCategory === "unread",
  });

  const { markAsRead, markAllAsRead, clearRead, deleteNotification } =
    useNotificationActions();

  const unreadCount = countData?.count || 0;
  const rawNotifications = notificationsData?.data || [];
  const totalPages = notificationsData?.pages || 1;
  const totalItems = notificationsData?.total || 0;

  // Sorting: URGENT -> HIGH -> Date
  const sortedNotifications = useMemo(() => {
    const priorityOrder: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return [...rawNotifications].sort((a, b) => {
      const pA = priorityOrder[a.priority] || 0;
      const pB = priorityOrder[b.priority] || 0;
      if (pA !== pB) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rawNotifications]);

  // Client-side category & keyword filtering
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter((n) => {
      // 1. Category Filter
      if (activeCategory === "unread" && n.isRead) return false;
      if (
        activeCategory === "urgent" &&
        n.priority !== "URGENT" &&
        n.priority !== "HIGH"
      ) {
        return false;
      }
      if (
        activeCategory === "candidates" &&
        !n.type.startsWith("CANDIDATE_") &&
        !n.type.startsWith("PIPELINE_") &&
        !n.type.startsWith("CV_") &&
        !n.type.startsWith("ASSIGNMENT_") &&
        !n.type.startsWith("SCREENING_")
      ) {
        return false;
      }
      if (
        activeCategory === "jobs" &&
        !n.type.startsWith("JOB_") &&
        !n.type.startsWith("TEAM_")
      ) {
        return false;
      }
      if (
        activeCategory === "clients" &&
        !n.type.startsWith("CLIENT_") &&
        !n.type.startsWith("CONTRACT_")
      ) {
        return false;
      }
      if (
        activeCategory === "security" &&
        !n.type.startsWith("PASSWORD_") &&
        !n.type.startsWith("SUSPICIOUS_") &&
        !n.type.startsWith("NEW_LOGIN") &&
        !n.type.startsWith("USER_")
      ) {
        return false;
      }

      // 2. Search Keyword Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = n.title.toLowerCase().includes(query);
        const inMessage = n.message.toLowerCase().includes(query);
        const inCandidate = n.relatedCandidate?.name
          .toLowerCase()
          .includes(query);
        const inJob = n.relatedJob?.title.toLowerCase().includes(query);
        const inTrigger = n.triggeredBy?.name.toLowerCase().includes(query);

        return inTitle || inMessage || inCandidate || inJob || inTrigger;
      }

      return true;
    });
  }, [sortedNotifications, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: totalItems,
      unread: unreadCount,
      urgent: rawNotifications.filter(
        (n) => n.priority === "URGENT" || n.priority === "HIGH"
      ).length,
    };
  }, [totalItems, unreadCount, rawNotifications]);

  // Handlers
  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleRefresh = () => {
    refetchNotifications();
    refetchCount();
    toast.info("Notifications refreshed");
  };

  // Selection handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = filteredNotifications.map((n) => n._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const unreadSelected = filteredNotifications
      .filter((n) => selectedIds.includes(n._id) && !n.isRead)
      .map((n) => n._id);

    if (unreadSelected.length === 0) {
      toast.info("Selected items are already marked as read");
      return;
    }

    unreadSelected.forEach((id) => markAsRead.mutate(id));
    toast.success(`Marked ${unreadSelected.length} notifications as read`);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteNotification.mutate(id));
    setSelectedIds([]);
    setIsBulkDeleteDialogOpen(false);
    toast.success("Deleted selected notifications");
  };

  const allPageSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.includes(n._id));

  // Pagination bounds calculation
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col h-full min-h-0 w-full p-2.5 sm:p-3.5 gap-2 overflow-hidden animate-in fade-in duration-200 select-none">
      {/* ── Compact Header Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/10 shadow-sm shrink-0">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Title & Live Status Indicator */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-white/90" />
              Notifications
            </h1>

            {unreadCount > 0 && (
              <Badge className="bg-white text-primary hover:bg-white font-black text-[10px] px-2 py-0 rounded-full shadow-2xs">
                {unreadCount} New
              </Badge>
            )}

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white/90">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
                )}
              />
              <span>{isConnected ? "Live Sync" : "Reconnecting"}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-lg h-7.5 px-2.5 text-[11px] gap-1 backdrop-blur-md"
            >
              <RotateCw className={cn("h-3 w-3", isRefetching && "animate-spin")} />
              <span>Refresh</span>
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="bg-white hover:bg-white/90 text-primary border-transparent font-bold rounded-lg h-7.5 px-2.5 text-[11px] gap-1 shadow-2xs"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                <span>Mark All Read</span>
              </Button>
            )}

            {rawNotifications.some((n) => n.isRead) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearReadDialogOpen(true)}
                disabled={clearRead.isPending}
                className="bg-white/10 hover:bg-destructive text-white border-white/20 hover:border-transparent font-bold rounded-lg h-7.5 px-2.5 text-[11px] gap-1 backdrop-blur-md transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear Read</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Compact KPI Stat Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="text-sm sm:text-base font-black text-foreground">{totalItems}</span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Unread
            </span>
          </div>
          <span className="text-sm sm:text-base font-black text-primary">{unreadCount}</span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Urgent
            </span>
          </div>
          <span className="text-sm sm:text-base font-black text-foreground">
            {categoryCounts.urgent}
          </span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Resolved
            </span>
          </div>
          <span className="text-sm sm:text-base font-black text-foreground">
            {Math.max(0, totalItems - unreadCount)}
          </span>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────── */}
      <div className="space-y-1.5 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-card p-1.5 rounded-xl border border-border/80 shadow-2xs">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search keyword, candidate, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7.5 pl-8 pr-7 rounded-lg text-xs font-medium bg-muted/40 border-border/60 focus:bg-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Batch Selection Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end px-1 sm:px-0">
            {filteredNotifications.length > 0 && (
              <div
                className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-bold text-muted-foreground hover:text-foreground"
                onClick={handleSelectAllOnPage}
              >
                <Checkbox
                  checked={allPageSelected}
                  className="h-3.5 w-3.5 rounded"
                />
                <span>Select Page ({filteredNotifications.length})</span>
              </div>
            )}

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1 animate-in fade-in zoom-in-95">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                  className="h-7 px-2 rounded-lg text-[11px] font-bold border-border/80"
                >
                  <Check className="h-3 w-3 mr-1 text-primary" />
                  Read
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  className="h-7 px-2 rounded-lg text-[11px] font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
          {[
            { key: "all", label: "All", count: categoryCounts.all },
            { key: "unread", label: "Unread", count: unreadCount },
            { key: "urgent", label: "Urgent", count: categoryCounts.urgent },
            { key: "candidates", label: "Candidates" },
            { key: "jobs", label: "Jobs" },
            { key: "clients", label: "Clients" },
            { key: "security", label: "Security" },
          ].map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key as CategoryFilter);
                  setPage(1);
                }}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 select-none border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card text-muted-foreground border-border/70 hover:border-border hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span
                    className={cn(
                      "px-1 py-0 rounded text-[9px] font-black",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notification List Container (Scrolls internally to fit single-screen) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-2.5"
              >
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Modern Empty State */
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-card rounded-2xl border border-border/70 shadow-2xs">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
              <Inbox className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-extrabold text-foreground">
              {searchQuery
                ? "No matching notifications"
                : activeCategory === "unread"
                ? "You're all caught up!"
                : "No notifications found"}
            </h3>

            <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 leading-relaxed">
              {searchQuery
                ? `No alerts matching "${searchQuery}". Clear query to view all.`
                : activeCategory === "unread"
                ? "No unread notifications at the moment."
                : "Your notifications list for this filter is empty."}
            </p>

            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2.5 h-7 rounded-lg text-xs font-bold"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          /* List of Notification Items */
          <div className="space-y-1.5">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                isMarkingRead={markAsRead.isPending}
                isDeleting={deleteNotification.isPending}
                isSelected={selectedIds.includes(notification._id)}
                onToggleSelect={handleToggleSelect}
                isSelectionMode={selectedIds.length > 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Proper Pagination Footer (Anchored in View) ─────────────── */}
      <div className="shrink-0 flex items-center justify-between px-2 pt-1 border-t border-border/60 bg-background/95 text-[11px] text-muted-foreground font-medium">
        <span className="hidden sm:inline-block">
          Showing <span className="font-bold text-foreground">{startItem}</span> -{" "}
          <span className="font-bold text-foreground">{endItem}</span> of{" "}
          <span className="font-bold text-foreground">{totalItems}</span>
        </span>

        <div className="flex items-center gap-1 mx-auto sm:mx-0">
          {/* First page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(1)}
            disabled={page === 1 || isLoading}
            className="h-7 w-7 rounded-lg"
            title="First Page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Prev page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-7 px-2 rounded-lg text-[11px] font-bold"
          >
            <ChevronLeft className="h-3 w-3 mr-0.5" />
            Prev
          </Button>

          {/* Current Page Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-card border border-border/80 font-black text-foreground text-[11px]">
            {page} / {totalPages}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="h-7 px-2 rounded-lg text-[11px] font-bold"
          >
            Next
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || isLoading}
            className="h-7 w-7 rounded-lg"
            title="Last Page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Confirmation Dialog: Clear All Read ─────────────────────── */}
      <Dialog
        open={isClearReadDialogOpen}
        onOpenChange={setIsClearReadDialogOpen}
      >
        <DialogContent className="max-w-md rounded-2xl border-border/80 shadow-2xl p-5 bg-card">
          <DialogHeader className="space-y-1.5">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <DialogTitle className="text-base font-extrabold text-foreground">
              Clear All Read Notifications?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will permanently delete all notifications that have already been marked as read. This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsClearReadDialogOpen(false)}
              className="rounded-xl text-xs font-bold h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearRead.mutate();
                setIsClearReadDialogOpen(false);
              }}
              disabled={clearRead.isPending}
              className="rounded-xl text-xs font-bold h-8"
            >
              Confirm & Clear Read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation Dialog: Bulk Delete ────────────────────────── */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <DialogContent className="max-w-md rounded-2xl border-border/80 shadow-2xl p-5 bg-card">
          <DialogHeader className="space-y-1.5">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <DialogTitle className="text-base font-extrabold text-foreground">
              Delete Selected Notifications?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete {selectedIds.length}{" "}
              selected notification{selectedIds.length > 1 ? "s" : ""}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteDialogOpen(false)}
              className="rounded-xl text-xs font-bold h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="rounded-xl text-xs font-bold h-8"
            >
              Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
