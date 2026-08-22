"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClients, getParentOptions, ClientResponse } from "@/services/clientService";
import { Loader2, Search, Building2 } from "lucide-react";
import { toast } from "sonner";

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
  title = "Select Client"
}: ClientSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [search, setSearch] = useState("");

  const loadClients = async () => {
    try {
      setLoading(true);
      // Fetching eligible parent options via the new endpoint
      const res = await getParentOptions(search);
      setClients(res.data || []);
    } catch (e) {
      console.error('Error loading clients:', e);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      const delayDebounceFn = setTimeout(() => {
        loadClients();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [open, search]);

  const filtered = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients;
    
    const searchLower = search.toLowerCase();
    return clients.filter(c => c.name?.toLowerCase().includes(searchLower) || c.clientId?.toLowerCase().includes(searchLower));
  }, [clients, search]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md text-right">
            {filtered.length} {filtered.length === 1 ? 'client' : 'clients'} found
          </div>
        </div>

        <div className="mt-3">
          <div className="h-80 border rounded-md">
            {loading ? (
              <div className="h-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clients...
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="p-2 space-y-2">
                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                       <Building2 className="h-10 w-10 mb-2 opacity-10" />
                       <p className="text-sm font-medium">No clients found</p>
                    </div>
                  )}
                  {filtered.map((c) => (
                    <button
                      key={c._id}
                      className="group w-full text-left p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 relative overflow-hidden"
                      onClick={() => {
                        onSelect(c);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                        </div>
                        {c.clientId && (
                           <span className="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/10">
                             {c.clientId}
                           </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={onClose} className="font-bold text-muted-foreground hover:text-foreground">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
