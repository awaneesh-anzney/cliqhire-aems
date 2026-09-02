"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios-config";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { linkClientToGroup } from "@/services/clientService";

interface AddClientToGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "pick-group" | "pick-client";
  clientId?: string;
  groupId?: string;
  onSuccess?: () => void;
}

export function AddClientToGroupModal({
  open,
  onOpenChange,
  mode,
  clientId,
  groupId,
  onSuccess,
}: AddClientToGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: [mode === "pick-group" ? "searchGroups" : "searchClients", searchQuery],
    queryFn: async () => {
      if (mode === "pick-group") {
        const res = await api.get(`/api/client-groups`, { params: { search: searchQuery, limit: 10 } });
        return res.data?.data || [];
      } else {
        const res = await api.get(`/api/clients/names`, { params: { search: searchQuery, limit: 10 } });
        return res.data?.data || [];
      }
    },
    enabled: open,
  });

  const handleSelect = async (selectedItem: any) => {
    try {
      if (mode === "pick-group") {
        if (!clientId) throw new Error("Missing clientId");
        await linkClientToGroup(clientId, selectedItem._id);
        toast.success(`Client added to group ${selectedItem.name}`);
        queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      } else {
        if (!groupId) throw new Error("Missing groupId");
        await linkClientToGroup(selectedItem._id, groupId);
        toast.success(`${selectedItem.name} added to the group`);
        queryClient.invalidateQueries({ queryKey: ["clientGroup", groupId] });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to link client to group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "pick-group" ? "Select a Client Group" : "Select a Client to Add"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input 
            placeholder={mode === "pick-group" ? "Search groups..." : "Search clients..."} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </div>
            ) : searchResults?.length > 0 ? (
              searchResults.map((item: any) => (
                <div 
                  key={item._id} 
                  className="flex flex-col p-2 hover:bg-muted rounded-md cursor-pointer border border-transparent hover:border-border transition-colors"
                  onClick={() => handleSelect(item)}
                >
                  <span className="font-semibold text-sm text-foreground">{item.name}</span>
                  {item.groupCode && <span className="text-xs text-muted-foreground">{item.groupCode}</span>}
                  {item.clientId && <span className="text-xs text-muted-foreground">{item.clientId}</span>}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">No results found.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
