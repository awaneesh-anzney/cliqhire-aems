"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminFilters } from "@/components/admin/shared/admin-filters";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { Globe, Laptop, Shield, Sparkles, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  UPDATED: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  DELETED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  STAGE_CHANGED: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  LOGIN: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  LOGOUT: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

interface AuditLogFeedProps {
  entityType?: string;
  onEntityTypeChange?: (entity: string) => void;
  className?: string;
}

export function AuditLogFeed({
  entityType: externalEntityType,
  onEntityTypeChange,
  className,
}: AuditLogFeedProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [internalEntityType, setInternalEntityType] = useState<string>("ALL");
  const [action, setAction] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const effectiveEntityType = externalEntityType !== undefined ? externalEntityType : internalEntityType;

  const handleSetEntityType = (val: string) => {
    if (onEntityTypeChange) {
      onEntityTypeChange(val);
    } else {
      setInternalEntityType(val);
    }
    setPage(1);
  };

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useAuditLogs({
    page,
    limit,
    ...(effectiveEntityType !== "ALL" && { entityType: effectiveEntityType }),
    ...(action !== "ALL" && { action }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const handleResetFilters = () => {
    handleSetEntityType("ALL");
    setAction("ALL");
    setSearch("");
    setPage(1);
  };

  const renderActor = (log: any) => {
    const isSystem = !log.actorName || log.actorName.toLowerCase() === "system";

    if (isSystem) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-6.5 w-6.5 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 border border-border/60">
            <Shield className="h-3 w-3" />
          </div>
          <span className="font-bold text-xs text-foreground tracking-tight">System</span>
        </div>
      );
    }

    const name = log.actorName || "User";
    const initials = name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="flex items-center gap-2">
        <div className="h-6.5 w-6.5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
          <span className="text-[9px] font-black uppercase tracking-tight">{initials}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[130px]">{name}</span>
          {log.actor?.email && (
            <span className="text-[9px] text-muted-foreground truncate max-w-[130px] leading-none mt-0.5">{log.actor.email}</span>
          )}
        </div>
      </div>
    );
  };

  const renderChanges = (log: any) => {
    let changeNode = null;
    let isEmptyMain = false;

    if (log.changes) {
      if (log.action === "STAGE_CHANGED") {
        changeNode = (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 leading-tight font-medium">
            <span className="line-through text-muted-foreground/60">{log.changes.before?.stage || "Unknown"}</span>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <span className="font-black text-foreground px-1.5 py-0.2 rounded bg-muted border border-border/40">{log.changes.after?.stage || "Unknown"}</span>
          </div>
        );
      } else {
        changeNode = (
          <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
            <span>Updated fields</span>
          </div>
        );
      }
    } else if (log.action !== "LOGIN" && log.action !== "LOGOUT") {
      isEmptyMain = true;
    }

    const { ip, device } = log.metadata || {};
    const { location, session } = log;
    const hasNetworkInfo = ip || location || device || session;

    if (!changeNode && !hasNetworkInfo) {
      return <span className="text-muted-foreground/30 text-xs">—</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        {changeNode}
        {isEmptyMain && !hasNetworkInfo && <span className="text-muted-foreground/30 text-xs">—</span>}
        {hasNetworkInfo && (
          <div className={cn("text-[10px] text-muted-foreground flex flex-col gap-0.5 leading-tight font-medium", changeNode && "pt-1 border-t border-border/40")}>
            {device && (log.action === "LOGIN" || log.action === "LOGOUT") && (
              <div className="flex items-center gap-1">
                <Laptop className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                <span>{device.browser} ({device.os})</span>
              </div>
            )}
            {(ip || location) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {ip && (
                  <span>
                    IP: <code className="font-mono text-foreground/90 bg-muted px-1 py-0.2 rounded text-[9.5px] border border-border/40">{ip}</code>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1 text-[9.5px]">
                    {ip && <span className="text-muted-foreground/40">●</span>}
                    <Globe className="h-2.5 w-2.5 text-muted-foreground/70" />
                    <span>{location.city ? `${location.city}, ` : ""}{location.country}</span>
                    <span className="text-muted-foreground/60">({location.timezone})</span>
                  </span>
                )}
              </div>
            )}
            {session && (
              <span className={cn("mt-0.2 font-bold text-[9.5px]", session.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60")}>
                {session.active ? `Active Session • ${session.label || `${session.days} days`}` : "Session Ended"}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const filterFields = [
    {
      id: "search",
      type: "search" as const,
      placeholder: "Search actor, entity, or keyword...",
      value: search,
      onChange: (val: string) => {
        setSearch(val);
        setPage(1);
      },
      className: "w-full sm:w-64",
    },
  ];

  const rightFilterFields = [
    {
      id: "entityType",
      type: "select" as const,
      placeholder: "Entity Type",
      value: effectiveEntityType,
      onChange: handleSetEntityType,
      options: [
        { label: "All Entities", value: "ALL" },
        { label: "Candidate", value: "Candidate" },
        { label: "Job", value: "Job" },
        { label: "Client", value: "Client" },
        { label: "Pipeline", value: "Pipeline" },
        { label: "Note", value: "Note" },
        { label: "Attachment", value: "Attachment" },
        { label: "Auth", value: "Auth" },
      ],
      className: "w-[130px]",
    },
    {
      id: "action",
      type: "select" as const,
      placeholder: "Action",
      value: action,
      onChange: (val: string) => {
        setAction(val);
        setPage(1);
      },
      options: [
        { label: "All Actions", value: "ALL" },
        { label: "CREATED", value: "CREATED" },
        { label: "UPDATED", value: "UPDATED" },
        { label: "DELETED", value: "DELETED" },
        { label: "STAGE_CHANGED", value: "STAGE_CHANGED" },
        { label: "LOGIN", value: "LOGIN" },
        { label: "LOGOUT", value: "LOGOUT" },
      ],
      className: "w-[125px]",
    },
  ];

  const totalPages = data?.pagination?.totalPages || 1;
  const totalRecords = data?.pagination?.total || 0;

  return (
    <div className={cn("flex-1 min-h-0 flex flex-col gap-2 overflow-hidden w-full", className)}>
      {/* Compact Integrated Filter Bar */}
      <AdminFilters
        leftFields={filterFields}
        rightFields={rightFilterFields}
        onReset={handleResetFilters}
        showReset={effectiveEntityType !== "ALL" || action !== "ALL" || search !== ""}
        className="py-1.5 px-2.5 shrink-0 bg-card/80 backdrop-blur-xs"
      />

      {/* Main Table Container Card with Flex Viewport Containment */}
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border/70 bg-card/95 shadow-2xs overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative custom-scrollbar">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md border-b border-border/60 shadow-2xs">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[170px] h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-3">Actor</TableHead>
                <TableHead className="w-[120px] h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</TableHead>
                <TableHead className="w-[170px] h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</TableHead>
                <TableHead className="h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telemetry & Details</TableHead>
                <TableHead className="w-[130px] h-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-3">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit > 8 ? 8 : limit }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="py-2.5 pl-3"><Skeleton className="h-4 w-[110px]" /></TableCell>
                    <TableCell className="py-2.5"><Skeleton className="h-5 w-[75px] rounded-full" /></TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-3.5 w-[90px] mb-1" />
                      <Skeleton className="h-2.5 w-[50px]" />
                    </TableCell>
                    <TableCell className="py-2.5"><Skeleton className="h-4 w-[160px]" /></TableCell>
                    <TableCell className="py-2.5 pr-3 text-right"><Skeleton className="h-3.5 w-[85px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-xs font-bold text-destructive py-8">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="h-5 w-5 text-destructive/80" />
                      <span>Failed to load audit logs. Please check network connection or retry.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-xs font-medium text-muted-foreground py-8">
                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="h-5 w-5 text-muted-foreground/60" />
                      <span className="font-bold text-foreground/80">No activity found</span>
                      <span className="text-[11px]">Try adjusting your search criteria or clearing active filters.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((log) => (
                  <TableRow key={log._id} className="hover:bg-muted/20 border-b border-border/30 transition-colors">
                    <TableCell className="align-middle py-2 pl-3">
                      {renderActor(log)}
                    </TableCell>
                    <TableCell className="align-middle py-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border select-none",
                          ACTION_COLORS[log.action] || "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle py-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[160px]">
                          {log.entityLabel || "—"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mt-0.5">
                          {log.entityType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle py-2">
                      {renderChanges(log)}
                    </TableCell>
                    <TableCell className="text-right text-[11px] text-muted-foreground font-medium align-middle whitespace-nowrap py-2 pr-3">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground/85">{format(new Date(log.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-[9.5px] text-muted-foreground/80">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Anchored Pagination Bar */}
        {totalRecords > 0 && (
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalRecords}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemName="logs"
            isLoading={isLoading}
            limitOptions={[5, 10, 20, 50]}
            className="border-t border-border/50 py-1.5 px-3 bg-card"
          />
        )}
      </div>
    </div>
  );
}
