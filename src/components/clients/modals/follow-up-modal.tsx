import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClientFollowUp } from "@/services/clientService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
// Note: We might want a select dropdown for owner if we have a user list. For now, it's a text input or we assume the current user if left blank.

interface FollowUpModalProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate?: string;
  currentOwner?: string; // owner ID or name depending on how backend handles it
}

export function FollowUpModal({ clientId, open, onOpenChange, currentDate, currentOwner }: FollowUpModalProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [owner, setOwner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (currentDate) {
        try {
          setDate(format(new Date(currentDate), "yyyy-MM-dd'T'HH:mm"));
        } catch {
          setDate("");
        }
      } else {
        setDate("");
      }
      setOwner(currentOwner || "");
    }
  }, [open, currentDate, currentOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date && !owner) {
      toast.error("Please provide at least a date or an owner");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (date) {
        payload.nextFollowUpDate = new Date(date).toISOString();
      }
      if (owner) {
        payload.nextFollowUpOwner = owner;
      }
      await updateClientFollowUp(clientId, payload);
      toast.success("Follow-up updated successfully");
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Next Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Next Follow-up Date & Time</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Follow-up Owner ID</Label>
              <Input
                placeholder="Owner ID"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Leave empty if unchanged.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
