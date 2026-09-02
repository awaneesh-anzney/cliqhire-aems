"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { mergeClientGroups } from "@/services/clientService";
import { api } from "@/lib/axios-config";

interface MergeGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceGroupId: string;
  sourceGroupName: string;
}

export function MergeGroupModal({
  open,
  onOpenChange,
  sourceGroupId,
  sourceGroupName,
}: MergeGroupModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["searchMergeGroups", searchQuery],
    queryFn: async () => {
      const res = await api.get(`/api/client-groups`, { params: { search: searchQuery, limit: 10 } });
      return (res.data?.data || []).filter((g: any) => g._id !== sourceGroupId);
    },
    enabled: open,
  });

  const handleMerge = async (targetGroup: any) => {
    try {
      setIsMerging(true);
      await mergeClientGroups(sourceGroupId, targetGroup._id);
      toast.success(`${sourceGroupName} merged into ${targetGroup.name}`);
      onOpenChange(false);
      router.push(`/client-groups/${targetGroup._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to merge groups");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Merge Client Group</DialogTitle>
          <DialogDescription>
            Merge <strong>{sourceGroupName}</strong> into another group. The source group will be deleted, and all members will be moved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input 
            placeholder="Search target group..." 
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
                  className="flex flex-col p-3 hover:bg-primary/5 rounded-xl cursor-pointer border border-border/50 hover:border-primary/30 transition-colors"
                  onClick={() => handleMerge(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm text-foreground block">{item.name}</span>
                      {item.groupCode && <span className="text-xs text-muted-foreground">{item.groupCode}</span>}
                    </div>
                    <Button size="sm" variant="outline" disabled={isMerging} className="h-7 text-xs">
                      Merge Here
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                No eligible target groups found.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isMerging}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
