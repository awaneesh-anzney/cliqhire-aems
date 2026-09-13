"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createClientGroup, updateClientGroup, ClientGroup } from "@/services/clientService";
import ClientSelectDialog from "@/components/shared/ClientSelectDialog";
import { Building2, X } from "lucide-react";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<ClientGroup>;
  onSuccess?: (group: ClientGroup) => void;
}

export function CreateGroupModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSuccess,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [description, setDescription] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [primaryClientId, setPrimaryClientId] = useState<string | null>(null);
  const [primaryClientName, setPrimaryClientName] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setGroupCode(initialData.groupCode || "");
        setDescription(initialData.description || "");
        setIsClient(!!initialData.primaryClientId);
        setPrimaryClientId(initialData.primaryClientId || null);
        // We'd ideally fetch the name here if not provided, but for edit mode,
        // it might be complex unless passed in. We'll leave it blank or rely on the user to reselect if needed.
        setPrimaryClientName(""); 
      } else {
        setName("");
        setGroupCode("");
        setDescription("");
        setIsClient(false);
        setPrimaryClientId(null);
        setPrimaryClientName("");
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<ClientGroup> = {
        name,
        groupCode,
        description,
        primaryClientId: isClient ? primaryClientId : null,
      };

      let result;
      if (mode === "create") {
        result = await createClientGroup(payload);
        toast.success("Client group created successfully");
      } else {
        if (!initialData?._id) throw new Error("Missing group ID for edit");
        result = await updateClientGroup(initialData._id, payload);
        toast.success("Client group updated successfully");
      }
      
      onSuccess?.(result);
      onOpenChange(false);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("This group code is already taken");
      } else {
        toast.error(error?.response?.data?.message || `Failed to ${mode} group`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Client Group" : "Edit Client Group"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Group Name <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="e.g. Tata Group" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Group Code <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <Input 
              placeholder="e.g. TATA" 
              value={groupCode} 
              onChange={(e) => setGroupCode(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <Textarea 
              placeholder="All Tata conglomerate companies..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 mt-6">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">This group is itself a client</Label>
              <p className="text-xs text-muted-foreground">
                Link this group to an existing primary client account (e.g. headquarters).
              </p>
            </div>
            <Switch 
              checked={isClient} 
              onCheckedChange={(checked) => {
                setIsClient(checked);
                if (!checked) setPrimaryClientId(null);
              }} 
            />
          </div>

          {isClient && (
            <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
              <Label>Primary Client</Label>
              {primaryClientId ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {primaryClientName || "Client Linked"}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    setPrimaryClientId(null);
                    setPrimaryClientName("");
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-dashed text-muted-foreground" 
                  onClick={() => setIsClientSelectOpen(true)}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Select a client...
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Group" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {isClientSelectOpen && (
        <ClientSelectDialog 
          open={isClientSelectOpen}
          onClose={() => setIsClientSelectOpen(false)}
          onSelect={(client) => {
            setPrimaryClientId(client._id);
            setPrimaryClientName(client.name);
          }}
          title="Select Primary Client"
        />
      )}
    </Dialog>
  );
}
