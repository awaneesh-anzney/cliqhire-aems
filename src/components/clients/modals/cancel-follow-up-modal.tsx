import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cancelClientFollowUp } from "@/services/clientService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CancelFollowUpModalProps {
  clientId: string;
  followUpId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelFollowUpModal({ clientId, followUpId, open, onOpenChange, onSuccess }: CancelFollowUpModalProps) {
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        cancelReason: cancelReason.trim() || undefined
      };

      await cancelClientFollowUp(clientId, followUpId, payload);

      toast.success("Follow-up cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      // Reset state for next open
      setCancelReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Follow-up</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this follow-up? This action will remove it from the owner&apos;s Todo list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancel Reason (Optional)</Label>
              <Textarea 
                placeholder="e.g. Client put the deal on hold"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Close
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Follow-up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
