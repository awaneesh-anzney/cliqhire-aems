"use client";

import { useClientHierarchy } from "@/hooks/useClient";
import { Loader2, Building2, ExternalLink, Network, Briefcase, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HierarchyContentProps {
  clientId: string;
}

export function HierarchyContent({ clientId }: HierarchyContentProps) {
  const router = useRouter();
  const { data: hierarchyData, isLoading, isError } = useClientHierarchy(clientId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Loading Corporate Hierarchy...
        </p>
      </div>
    );
  }

  if (isError || !hierarchyData) {
    return (
      <div className="p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20 max-w-lg mx-auto">
        <div className="text-destructive font-semibold text-sm">Failed to load hierarchy information.</div>
      </div>
    );
  }

  const { parent, members = [], totalCompanies = 0, totalJobCount = 0, stageBreakdown = {} } = hierarchyData;
  const currentClient = members.find((m: any) => m._id === clientId) || { _id: clientId, name: "Current Client" };
  const subsidiaries = members.filter((m: any) => m.role === "subsidiary");
  const isParent = !parent;

  return (
    <div className="space-y-4">
      {/* Top Hierarchy KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Companies</span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalCompanies}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Positions</span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalJobCount}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stage Breakdown</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(stageBreakdown).length > 0 ? (
              Object.entries(stageBreakdown).map(([stage, count]) => (
                <Badge key={stage} variant="outline" className="text-[10px] font-semibold bg-muted/50 border-border/70">
                  {stage}: <span className="font-bold ml-1">{count as React.ReactNode}</span>
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No active stages</span>
            )}
          </div>
        </div>
      </div>

      {/* Parent Organization Section */}
      <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Parent Entity
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold">
            {isParent ? "Root Organization" : "Sub-Entity"}
          </Badge>
        </div>

        <div className="p-4">
          {parent ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/70 bg-background/50 hover:bg-muted/40 transition-colors gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{parent.name}</h4>
                  <Badge variant="secondary" className="text-[9px] font-bold uppercase">Parent</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {parent.industry || "General Industry"}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold rounded-lg self-start sm:self-center"
                onClick={() => router.push(`/clients/${parent._id}`)}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Parent
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{currentClient.name}</h4>
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold uppercase">Top-Level</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  This company operates as the primary parent entity with no parent organization above it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subsidiaries Section */}
      <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Network className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Subsidiaries ({subsidiaries.length})
            </h3>
          </div>
        </div>

        <div className="p-4">
          {subsidiaries.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-foreground">No Subsidiaries Recorded</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                There are currently no child entities linked under this organization.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subsidiaries.map((sub: any) => {
                const isCurrent = sub._id === currentClient._id;
                return (
                  <div
                    key={sub._id}
                    className={cn(
                      "p-3.5 rounded-xl border transition-colors flex flex-col justify-between gap-3",
                      isCurrent
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/70 bg-background/50 hover:bg-muted/40",
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground truncate">{sub.name}</h4>
                        {isCurrent && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] font-bold uppercase shrink-0">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Building2 className="w-3 h-3 text-muted-foreground/60" /> {sub.industry || "General Industry"}
                        </span>
                        {sub.contractSource === "parent" && (
                          <Badge variant="outline" className="text-[9px] font-semibold bg-muted/60">
                            Shared Contract
                          </Badge>
                        )}
                        {sub.primaryContactSource === "parent" && (
                          <Badge variant="outline" className="text-[9px] font-semibold bg-muted/60">
                            Shared Contacts
                          </Badge>
                        )}
                      </div>
                    </div>

                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 self-end"
                        onClick={() => router.push(`/clients/${sub._id}`)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> View Entity
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
