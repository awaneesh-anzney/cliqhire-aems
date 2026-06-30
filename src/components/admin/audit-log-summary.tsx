import { useAuditLogSummary } from "@/hooks/useAuditLog";
import { Activity, Users, Briefcase, FileText, Paperclip, LogIn, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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

const ENTITY_COLORS: Record<string, { bg: string; text: string }> = {
  Candidate: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  Job: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
  Client: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
  Pipeline: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
  Note: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  Attachment: { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-400" },
  Auth: { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-400" },
};

export function AuditLogSummaryCards() {
  const { data, isLoading, isError } = useAuditLogSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="p-3.5 rounded-xl border border-border/60 animate-pulse min-h-[105px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-7 w-10 mb-1.5" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest rounded-xl border border-destructive/20 shadow-sm animate-in fade-in duration-300">
        Failed to load audit log summary.
      </div>
    );
  }

  const summaryData = data.data || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {summaryData.map((item) => {
        const Icon = ICONS[item.entityType] || Activity;
        const colors = ENTITY_COLORS[item.entityType] || { bg: "bg-zinc-500/10", text: "text-zinc-600 dark:text-zinc-400" };
        
        return (
          <Card 
            key={item.entityType} 
            className="group relative bg-card border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] rounded-xl p-3.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-brand/40 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {item.entityType}
              </span>
              <div className={`p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110 ${colors.bg} ${colors.text}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-black text-foreground tracking-tight">{item.count}</div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Actions (24h)</p>
            </div>
            
            {/* Subtle glow border at bottom on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent translate-y-[2px] group-hover:translate-y-0 transition-transform duration-300" />
          </Card>
        );
      })}
      {summaryData.length === 0 && (
        <div className="col-span-full p-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground bg-card border rounded-xl shadow-sm">
          No activity in the last 24 hours.
        </div>
      )}
    </div>
  );
}
