import { useState } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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

  return (
    <div className="flex flex-col space-y-3.5">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)]">
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80" />
          <Input
            placeholder="Search actor or entity..."
            className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/80 focus-visible:ring-1 focus-visible:ring-brand"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2.5">
          <Select value={entityType} onValueChange={(val) => { setEntityType(val); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-card border-border/80">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="ALL" className="text-xs rounded-lg">All Entities</SelectItem>
              <SelectItem value="Candidate" className="text-xs rounded-lg">Candidate</SelectItem>
              <SelectItem value="Job" className="text-xs rounded-lg">Job</SelectItem>
              <SelectItem value="Client" className="text-xs rounded-lg">Client</SelectItem>
              <SelectItem value="Pipeline" className="text-xs rounded-lg">Pipeline</SelectItem>
              <SelectItem value="Note" className="text-xs rounded-lg">Note</SelectItem>
              <SelectItem value="Attachment" className="text-xs rounded-lg">Attachment</SelectItem>
              <SelectItem value="Auth" className="text-xs rounded-lg">Auth</SelectItem>
            </SelectContent>
          </Select>

          <Select value={action} onValueChange={(val) => { setAction(val); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-card border-border/80">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="ALL" className="text-xs rounded-lg">All Actions</SelectItem>
              <SelectItem value="CREATED" className="text-xs rounded-lg">CREATED</SelectItem>
              <SelectItem value="UPDATED" className="text-xs rounded-lg">UPDATED</SelectItem>
              <SelectItem value="DELETED" className="text-xs rounded-lg">DELETED</SelectItem>
              <SelectItem value="STAGE_CHANGED" className="text-xs rounded-lg">STAGE_CHANGED</SelectItem>
              <SelectItem value="LOGIN" className="text-xs rounded-lg">LOGIN</SelectItem>
              <SelectItem value="LOGOUT" className="text-xs rounded-lg">LOGOUT</SelectItem>
            </SelectContent>
          </Select>

          {(entityType !== "ALL" || action !== "ALL" || search !== "") && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={handleResetFilters} 
              title="Reset filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5">
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
            Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 bg-card hover:bg-muted border border-border"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 bg-card hover:bg-muted border border-border"
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
