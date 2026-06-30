import { useState } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminFilters } from "@/components/admin/shared/admin-filters";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  UPDATED: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10",
  DELETED: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  STAGE_CHANGED: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/10",
  LOGIN: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/10",
  LOGOUT: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10",
};

export function AuditLogFeed() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<string>("ALL");
  const [action, setAction] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useAuditLogs({
    page,
    limit: 20,
    ...(entityType !== "ALL" && { entityType }),
    ...(action !== "ALL" && { action }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const handleResetFilters = () => {
    setEntityType("ALL");
    setAction("ALL");
    setSearch("");
    setPage(1);
  };

  const renderActor = (log: any) => {
    const isSystem = !log.actorName || log.actorName.toLowerCase() === "system";
    
    if (isSystem) {
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-500/10 text-zinc-500 flex items-center justify-center shrink-0 border border-zinc-500/10">
            <span className="text-[9px] font-black uppercase">SYS</span>
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
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/10 shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-tight">{initials}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[125px]">{name}</span>
          {log.actor?.email && (
            <span className="text-[9px] text-muted-foreground truncate max-w-[125px] leading-none mt-0.5">{log.actor.email}</span>
          )}
        </div>
      </div>
    );
  };

  const renderChanges = (log: any) => {
    if (log.action === "LOGIN" || log.action === "LOGOUT") {
      if (!log.metadata) return null;
      const { ip, device } = log.metadata;
      return (
        <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5 leading-tight font-medium">
          {ip && <span>IP: <code className="font-mono text-foreground/80 bg-muted/65 px-1 py-0.5 rounded">{ip}</code></span>}
          {device && <span>Device: {device.browser} ({device.os})</span>}
        </div>
      );
    }

    if (log.changes) {
      if (log.action === "STAGE_CHANGED") {
        return (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 leading-tight font-medium">
            <span className="line-through text-muted-foreground/60">{log.changes.before?.stage || "Unknown"}</span>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <span className="font-black text-foreground px-1.5 py-0.5 rounded bg-muted border border-border/40">{log.changes.after?.stage || "Unknown"}</span>
          </div>
        );
      }
      return (
        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand/60 animate-pulse" />
          <span>Updated fields</span>
        </div>
      );
    }
    return <span className="text-muted-foreground/30">—</span>;
  };

  const filterFields = [
    {
      id: "search",
      type: "search" as const,
      placeholder: "Search actor or entity...",
      value: search,
      onChange: (val: string) => {
        setSearch(val);
        setPage(1);
      },
    },
  ];

  const rightFilterFields = [
    {
      id: "entityType",
      type: "select" as const,
      placeholder: "Entity Type",
      value: entityType,
      onChange: (val: string) => {
        setEntityType(val);
        setPage(1);
      },
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
    },
  ];

  return (
    <div className="flex flex-col space-y-3.5">
      <AdminFilters
        leftFields={filterFields}
        rightFields={rightFilterFields}
        onReset={handleResetFilters}
        showReset={entityType !== "ALL" || action !== "ALL" || search !== ""}
      />

      <div className="bg-card border border-border/60 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[180px] h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actor</TableHead>
              <TableHead className="w-[130px] h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</TableHead>
              <TableHead className="w-[180px] h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</TableHead>
              <TableHead className="h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</TableHead>
              <TableHead className="w-[140px] h-9 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] mb-1" />
                    <Skeleton className="h-3 w-[60px]" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs font-bold uppercase tracking-widest text-destructive">
                  Failed to load audit logs. Please try again.
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No activity found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((log) => (
                <TableRow key={log._id} className="hover:bg-muted/20 border-b border-border/40">
                  <TableCell className="align-middle">
                    {renderActor(log)}
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge variant="outline" className={`font-extrabold text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${ACTION_COLORS[log.action] || "bg-zinc-150 text-zinc-800 border-zinc-200"}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[170px]">{log.entityLabel || "—"}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{log.entityType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    {renderChanges(log)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-medium align-middle whitespace-nowrap">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <AdminPagination
          page={page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          limit={20}
          onPageChange={setPage}
          itemName="logs"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
