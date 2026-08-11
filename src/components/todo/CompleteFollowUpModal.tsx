import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { taskService } from "@/services/taskService";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface CompleteFollowUpModalProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompleteFollowUpModal({ taskId, open, onOpenChange, onSuccess }: CompleteFollowUpModalProps) {
  const queryClient = useQueryClient();
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionDate, setCompletionDate] = useState<Date | undefined>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNotes.trim()) {
      toast.error("Completion notes are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.completeFollowUpTask(taskId, {
        completionNotes: completionNotes.trim(),
        completionDate: completionDate ? completionDate.toISOString() : undefined
      });
      toast.success("Follow-up completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      // Reset state for next open
      setCompletionNotes("");
      setCompletionDate(new Date());
    } catch (err: any) {
      toast.error(err.message || "Failed to complete follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Follow-up</DialogTitle>
          <DialogDescription>
            Please provide details on what happened during this follow-up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Completion Notes <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="e.g. Called the client — they've approved the revised proposal."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Completion Date (Optional)</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !completionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {completionDate ? format(completionDate, "PPP") : <span>Pick actual date of follow-up</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={completionDate}
                    onSelect={(date) => {
                      setCompletionDate(date);
                      setDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">If not selected, the current time will be logged.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Complete Follow-up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
