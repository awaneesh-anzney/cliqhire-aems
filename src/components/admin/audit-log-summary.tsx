import { useAuditLogSummary } from "@/hooks/useAuditLog";
import { Activity, Users, Briefcase, FileText, Paperclip, LogIn, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<string, React.ElementType> = {
  Candidate: Users,
  Job: Briefcase,
  Client: Building2,
  Pipeline: Activity,
  Note: FileText,
  Attachment: Paperclip,
  Auth: LogIn,
};

export function AuditLogSummaryCards() {
  const { data, isLoading, isError } = useAuditLogSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        Failed to load audit log summary.
      </div>
    );
  }

  const summaryData = data.data || [];
  
  // Ensure we show 0 for missing entity types if we want, or just show what's returned.
  // The API returns what happened in last 24h.

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {summaryData.map((item) => {
        const Icon = ICONS[item.entityType] || Activity;
        return (
          <Card key={item.entityType} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.entityType}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground mt-1">Actions (24h)</p>
            </CardContent>
          </Card>
        );
      })}
      {summaryData.length === 0 && (
        <div className="col-span-full p-4 text-center text-muted-foreground">
          No activity in the last 24 hours.
        </div>
      )}
    </div>
  );
}
