"use client";

import { useEffect, useState } from "react";
import { getClientStageHistory, ClientStageHistory } from "@/services/clientService";
import { Loader2, AlertCircle, History, Clock, Calendar, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HistoryContentProps {
  clientId: string;
}

export function HistoryContent({ clientId }: HistoryContentProps) {
  const [history, setHistory] = useState<ClientStageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getClientStageHistory(clientId);
        setHistory(data || []);
      } catch (error) {
        console.error("Failed to fetch stage history:", error);
        toast.error("Failed to load stage history");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Loading Stage Progression...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center max-w-lg mx-auto">
        <History className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-foreground">No Stage History</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Stage transition logs will be recorded as this client moves through stages.
        </p>
      </div>
    );
  }

  const currentStageRecord = history[0];
  const currentDurationDays = currentStageRecord
    ? differenceInDays(new Date(), new Date(currentStageRecord.startedAt))
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Progression Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Stage</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{currentStageRecord?.stage || "N/A"}</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">Active</Badge>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Days in Current Stage</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{currentDurationDays} Days</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Stage Changes</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{history.length}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <History className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Progression Audit Log
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <TableHead className="py-3 px-4">Stage</TableHead>
                <TableHead className="py-3 px-4">Start Date</TableHead>
                <TableHead className="py-3 px-4">End Date</TableHead>
                <TableHead className="py-3 px-4 text-center">Duration</TableHead>
                <TableHead className="py-3 px-4 text-center">Activities</TableHead>
                <TableHead className="py-3 px-4 text-right">Updated By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40 text-xs">
              {history.map((record, index) => {
                const isCurrent = index === 0;
                const startDate = new Date(record.startedAt);
                const endDate = record.endedAt ? new Date(record.endedAt) : new Date();
                const durationDays = differenceInDays(endDate, startDate);
                const userName = record.changedBy?.name || record.changedBy?.firstName || "System Admin";

                return (
                  <TableRow key={record._id || index} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{record.stage}</span>
                        {isCurrent && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground">
                      {format(startDate, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground">
                      {record.endedAt ? format(endDate, "dd MMM yyyy") : <span className="text-muted-foreground/60">—</span>}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                        {durationDays} {durationDays === 1 ? "day" : "days"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <span className="font-semibold text-foreground">{record.activityCount || 0}</span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right text-muted-foreground font-medium">
                      {userName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}