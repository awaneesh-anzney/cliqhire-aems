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
  CREATED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  UPDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  DELETED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  STAGE_CHANGED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  LOGIN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  LOGOUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
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

  const renderChanges = (log: any) => {
    if (log.action === "LOGIN" || log.action === "LOGOUT") {
      if (!log.metadata) return null;
      const { ip, device } = log.metadata;
      return (
        <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
          {ip && <span>IP: {ip}</span>}
          {device && <span>Device: {device.browser} on {device.os}</span>}
        </div>
      );
    }

    if (log.changes) {
      if (log.action === "STAGE_CHANGED") {
        return (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="line-through opacity-70">{log.changes.before?.stage || "Unknown"}</span>
            <span>→</span>
            <span className="font-medium text-foreground">{log.changes.after?.stage || "Unknown"}</span>
          </div>
        );
      }
      return <div className="text-xs text-muted-foreground">Updated fields</div>;
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actor or entity..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Select value={entityType} onValueChange={(val) => { setEntityType(val); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entities</SelectItem>
              <SelectItem value="Candidate">Candidate</SelectItem>
              <SelectItem value="Job">Job</SelectItem>
              <SelectItem value="Client">Client</SelectItem>
              <SelectItem value="Pipeline">Pipeline</SelectItem>
              <SelectItem value="Note">Note</SelectItem>
              <SelectItem value="Attachment">Attachment</SelectItem>
              <SelectItem value="Auth">Auth</SelectItem>
            </SelectContent>
          </Select>

          <Select value={action} onValueChange={(val) => { setAction(val); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="CREATED">CREATED</SelectItem>
              <SelectItem value="UPDATED">UPDATED</SelectItem>
              <SelectItem value="DELETED">DELETED</SelectItem>
              <SelectItem value="STAGE_CHANGED">STAGE_CHANGED</SelectItem>
              <SelectItem value="LOGIN">LOGIN</SelectItem>
              <SelectItem value="LOGOUT">LOGOUT</SelectItem>
            </SelectContent>
          </Select>

          {(entityType !== "ALL" || action !== "ALL" || search !== "") && (
            <Button variant="ghost" size="icon" onClick={handleResetFilters} title="Reset filters">
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Time</TableHead>
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
                <TableCell colSpan={5} className="h-32 text-center text-destructive">
                  Failed to load audit logs. Please try again.
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No activity found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((log) => (
                <TableRow key={log._id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {log.actorName || "System"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-semibold text-[10px] uppercase border-transparent ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">{log.entityLabel || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{log.entityType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderChanges(log)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
