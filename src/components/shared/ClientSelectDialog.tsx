"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getParentOptions, ClientResponse } from "@/services/clientService";
import { Loader2, Search, Building2, X, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (client: ClientResponse) => void;
  title?: string;
}

export default function ClientSelectDialog({ 
  open, 
  onClose, 
  onSelect, 
  title = "Select Parent Client"
}: ClientSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [search, setSearch] = useState("");

  const loadClients = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getParentOptions(search);
      setClients(res.data || []);
    } catch (e) {
      console.error('Error loading clients:', e);
      toast.error('Failed to load eligible parent clients');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (open) {
      const delayDebounceFn = setTimeout(() => {
        loadClients();
      }, 250);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [open, loadClients]);

  const filtered = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients;
    
    const searchLower = search.toLowerCase();
    return clients.filter(c => 
      c.name?.toLowerCase().includes(searchLower) || 
      c.clientId?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select a parent company or headquarters account
                </DialogDescription>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/80">
              {filtered.length} eligible
            </span>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-4 bg-muted/20 border-b border-border/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder="Search by company name or ID..."
              className="pl-9 pr-8 h-10 rounded-xl bg-background border-border/80 font-semibold text-xs sm:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Client List */}
        <div className="p-4">
          <div className="h-[280px] rounded-xl border border-border/80 bg-background overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-semibold">Searching clients...</span>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1.5">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                       <Building2 className="h-10 w-10 mb-2 opacity-20" />
                       <p className="text-sm font-bold text-foreground">No matching clients</p>
                       <p className="text-xs text-muted-foreground mt-0.5">Check the name or create a parent client first</p>
                    </div>
                  ) : (
                    filtered.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className="group w-full text-left p-2.5 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 flex items-center justify-between gap-3"
                        onClick={() => {
                          onSelect(c);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-muted/80 text-foreground/80 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Building2 className="w-4 h-4" />
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                {c.name}
                              </span>
                              {c.clientId && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20">
                                  {c.clientId}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                              Parent Account Candidate
                            </p>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            Select
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/40 dark:bg-muted/20 border-t border-border/70 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="font-bold text-muted-foreground hover:text-foreground text-xs h-9 rounded-xl px-4"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
