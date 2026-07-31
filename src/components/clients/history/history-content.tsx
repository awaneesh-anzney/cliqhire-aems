"use client";

import { useEffect, useState } from "react";
import { getClientStageHistory, ClientStageHistory } from "@/services/clientService";
import { Loader2, AlertCircle } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
          Loading History...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-12 text-center bg-muted/30 rounded-3xl border border-border max-w-2xl mx-auto mt-8">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-black text-foreground mb-2 tracking-tight">No Stage History</h3>
        <p className="text-sm text-muted-foreground font-semibold">There is no stage history available for this client yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 border shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Stage Progression History</h2>
        <p className="text-sm text-muted-foreground">Overview of time spent in each stage.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Stage</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-center">Activities</TableHead>
              <TableHead>Changed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((record, index) => {
              const isCurrent = index === 0; // Assuming API returns newest first
              const startDate = new Date(record.startedAt);
              const endDate = record.endedAt ? new Date(record.endedAt) : new Date();
              const durationDays = differenceInDays(endDate, startDate);
              const userName = record.changedBy?.name || record.changedBy?.firstName || "System";

              return (
                <TableRow key={record._id || index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {record.stage}
                      {isCurrent && <Badge variant="secondary" className="bg-brand/10 text-brand text-[10px]">Current</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{format(startDate, "dd MMM yyyy")}</TableCell>
                  <TableCell>{record.endedAt ? format(endDate, "dd MMM yyyy") : "—"}</TableCell>
                  <TableCell>{durationDays} days</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{record.activityCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{userName}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}