"use client";

import { useClientHierarchy } from "@/hooks/useClient";
import { Loader2, Building2, ExternalLink, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { Badge } from "@/components/ui/badge";

interface HierarchyContentProps {
  clientId: string;
}

export function HierarchyContent({ clientId }: HierarchyContentProps) {
  const router = useRouter();
  const { data: hierarchyData, isLoading, isError } = useClientHierarchy(clientId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Hierarchy Data...</p>
      </div>
    );
  }

  if (isError || !hierarchyData) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <div className="text-red-500 font-bold mb-4">Error loading hierarchy information.</div>
      </div>
    );
  }

  const { parent, members = [], totalCompanies = 0, totalJobCount = 0, stageBreakdown = {} } = hierarchyData;

  // Find the current client in the members list, or fallback
  const currentClient = members.find((m: any) => m._id === clientId) || { _id: clientId, name: "Current Client" };
  
  // Subsidiaries are those members with role 'subsidiary'
  const subsidiaries = members.filter((m: any) => m.role === 'subsidiary');

  const isParent = !parent; // If no parent, it's a top-level client (can have subsidiaries)

  return (
    <div className="bg-muted/50 rounded-2xl p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand/10 rounded-xl">
            <Network className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Corporate Hierarchy</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {isParent ? "Parent Company & Subsidiaries" : "Subsidiary Company"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col justify-center shadow-sm">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Companies</h4>
          <p className="text-3xl font-black text-foreground">{totalCompanies}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col justify-center shadow-sm">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Jobs</h4>
          <p className="text-3xl font-black text-foreground">{totalJobCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col justify-center shadow-sm">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Stage Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stageBreakdown).length > 0 ? (
              Object.entries(stageBreakdown).map(([stage, count]) => (
                <Badge key={stage} variant="outline" className="text-[10px] bg-muted/30">
                  {stage}: <span className="font-black ml-1">{count as React.ReactNode}</span>
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground font-medium">No stages available</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Parent / Top-Level Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Parent Company
            </h3>
          </div>
          <div className="p-5">
            {parent ? (
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{parent.name}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {parent.industry || "No Industry"}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/clients/${parent._id}`)}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View Parent
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{currentClient.name}</h4>
                    <Badge className="bg-primary text-white text-[10px] uppercase tracking-widest font-black">Current</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">This is the top-level parent company.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subsidiaries Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Network className="w-4 h-4 text-brand" />
              Subsidiaries ({subsidiaries.length})
            </h3>
          </div>
          <div className="p-5">
            {subsidiaries.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h4 className="font-bold text-foreground">No Subsidiaries</h4>
                <p className="text-sm text-muted-foreground mt-1">This company does not have any recorded subsidiaries.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {subsidiaries.map((sub: any) => (
                  <div key={sub._id} className={`flex items-center justify-between p-4 rounded-xl border ${sub._id === currentClient._id ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{sub.name}</h4>
                        {sub._id === currentClient._id && (
                          <Badge className="bg-primary text-white text-[10px] uppercase tracking-widest font-black">Current</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {sub.industry || "No Industry"}
                        </span>
                        {sub.contractSource === 'parent' && (
                          <Badge variant="secondary" className="text-[9px] uppercase font-black">Shared Contract</Badge>
                        )}
                        {sub.primaryContactSource === 'parent' && (
                          <Badge variant="secondary" className="text-[9px] uppercase font-black">Shared Contacts</Badge>
                        )}
                      </div>
                    </div>
                    {sub._id !== currentClient._id && (
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/clients/${sub._id}`)}>
                        <ExternalLink className="w-4 h-4 mr-1" /> View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
